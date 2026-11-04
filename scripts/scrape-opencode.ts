import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "elecciones.json");

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function nowIso(): string {
  return new Date().toISOString();
}

function readDb(): { elections: any[]; candidates: any[] } {
  if (!fs.existsSync(DB_PATH)) return { elections: [], candidates: [] };
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } catch {
    return { elections: [], candidates: [] };
  }
}

function writeDb(data: { elections: any[]; candidates: any[] }) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--") && a.includes("=")) {
      const [k, v] = a.slice(2).split("=");
      args[k] = v;
    } else if (a.startsWith("--") && i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
      args[a.slice(2)] = argv[++i];
    }
  }
  return args;
}

export async function runScrapeOpenCode() {
  const args = parseArgs(process.argv.slice(2));
  const title = args.title;
  if (!title) {
    console.error("Falta --title");
    process.exit(1);
  }

  const db = readDb();
  const now = nowIso();
  const id = `elec-${slugify(title)}-opencode`;

  const candidatesRaw = args.candidates ? JSON.parse(args.candidates) : [];
  const candidates = (candidatesRaw as Array<{ name: string; list?: string; votes?: number }>).map(
    (c, i) => ({
      id: `cand-${id}-${i}`,
      election_id: id,
      name: c.name,
      list: c.list ?? null,
      votes: c.votes ?? 0,
      percentage: 0,
      elected: 0,
    }),
  );

  const election = {
    id,
    title,
    organization: args.organization || "Organización no especificada",
    type: (args.type as any) || "other",
    status: (args.status as any) || "upcoming",
    startDate: args.start || null,
    endDate: args.end || null,
    location: args.location || null,
    description: args.desc || null,
    sourceUrl: args.sourceUrl || null,
    sourceName: args.sourceName || null,
    totalVotes: null,
    eligibleVoters: null,
    updatedAt: now,
    createdAt: now,
  };

  const existed = db.elections.some((e: any) => e.id === id);
  db.elections = db.elections.filter((e: any) => e.id !== id);
  db.elections.push(election);
  db.candidates = db.candidates.filter((c: any) => c.election_id !== id);
  db.candidates.push(...candidates);

  writeDb(db);

  console.log(JSON.stringify({ id, title, existed, candidates: candidates.length, at: now }, null, 2));
}

if (require.main === module) {
  runScrapeOpenCode().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
