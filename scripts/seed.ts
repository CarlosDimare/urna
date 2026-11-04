import { initDb, upsertElection } from "@/lib/db";

const SEED: Array<{
  title: string;
  organization: string;
  type: "union" | "university" | "magistrate" | "club" | "other";
  status: "upcoming" | "ongoing" | "completed";
  startDate?: string;
  endDate?: string;
  location?: string;
  description?: string;
  sourceUrl: string;
  sourceName: string;
  candidates: Array<{ name: string; list?: string; votes?: number }>;
}> = [
  {
    title: "Elecciones Sindicato de Docentes 2024",
    organization: "Sindicato de Trabajadores de la Educación",
    type: "union",
    status: "ongoing",
    startDate: "2024-11-01T08:00:00Z",
    endDate: "2024-11-05T18:00:00Z",
    location: "Sede Central, CABA",
    description: "Renovación de autoridades del gremio docente universitario.",
    sourceUrl: "https://example.org/eleccion-sindicato-docentes",
    sourceName: "Sindicato Docente",
    candidates: [
      { name: "Lista Azul y Blanca", list: "A", votes: 1240 },
      { name: "Lista Roja", list: "B", votes: 890 },
      { name: "Lista Verde", list: "C", votes: 560 },
    ],
  },
  {
    title: "Consejo Directivo Facultad de Ciencias",
    organization: "Universidad Nacional",
    type: "university",
    status: "upcoming",
    startDate: "2024-12-02T09:00:00Z",
    endDate: "2024-12-03T17:00:00Z",
    location: "Pabellón de Votación, Campus",
    description: "Elección de representantes docentes y estudiantiles al consejo directivo.",
    sourceUrl: "https://example.org/eleccion-consejo-directivo",
    sourceName: "Universidad Nacional",
    candidates: [
      { name: "Frente Universitario", list: "FU", votes: 0 },
      { name: "Agrupación Estudiantil", list: "AE", votes: 0 },
    ],
  },
  {
    title: "Consejo de la Magistratura - Circunscripción 1",
    organization: "Consejo de la Magistratura",
    type: "magistrate",
    status: "completed",
    startDate: "2024-10-10T10:00:00Z",
    endDate: "2024-10-10T16:00:00Z",
    location: "Tribunales, CABA",
    description: "Elección de miembros del consejo de la magistratura.",
    sourceUrl: "https://example.org/eleccion-magistratura-c1",
    sourceName: "Consejo de la Magistratura",
    candidates: [
      { name: "Jueza María López", list: "Independiente", votes: 3400 },
      { name: "Abogado Carlos Ruiz", list: "Lista 2", votes: 2100 },
    ],
  },
  {
    title: "Comisión Directiva Club Atlético",
    organization: "Club Atlético Universitario",
    type: "club",
    status: "upcoming",
    startDate: "2024-11-15T10:00:00Z",
    endDate: "2024-11-16T18:00:00Z",
    location: "Sede Social del Club",
    description: "Renovación de la comisión directiva del club deportivo universitario.",
    sourceUrl: "https://example.org/eleccion-club-atletico",
    sourceName: "Club Atlético Universitario",
    candidates: [
      { name: "Lista Blanca", list: "A", votes: 0 },
      { name: "Lista Negra", list: "B", votes: 0 },
    ],
  },
];

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

export async function runSeed() {
  initDb();
  const now = nowIso();
  let inserted = 0;

  for (const e of SEED) {
    const id = `elec-${slugify(e.title)}`;
    const fs = await import("fs");
    const path = await import("path");
    const DB_PATH = path.join(process.cwd(), "data", "elecciones.json");
    let existing: any[] = [];
    if (fs.existsSync(DB_PATH)) {
      existing = JSON.parse(fs.readFileSync(DB_PATH, "utf-8")).elections || [];
    }
    if (existing.find((el: any) => el.id === id)) continue;

    const election = {
      id,
      title: e.title,
      organization: e.organization,
      type: e.type,
      status: e.status,
      startDate: e.startDate ?? null,
      endDate: e.endDate ?? null,
      location: e.location ?? null,
      description: e.description ?? null,
      sourceUrl: e.sourceUrl,
      sourceName: e.sourceName,
      totalVotes: null,
      eligibleVoters: null,
      updatedAt: now,
      createdAt: now,
    };
    const candidates = e.candidates.map((c, i) => ({
      id: `cand-${id}-${i}`,
      election_id: id,
      name: c.name,
      list: c.list ?? null,
      votes: c.votes ?? 0,
      percentage: 0,
      elected: 0,
    }));

    upsertElection(election, candidates);
    inserted++;
  }

  console.log(`Seed completado: ${inserted} elecciones insertadas.`);
}

if (require.main === module) {
  runSeed().catch((err) => {
    console.error("Seed falló:", err);
    process.exit(1);
  });
}
