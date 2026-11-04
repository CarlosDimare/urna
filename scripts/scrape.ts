import fs from "fs";
import path from "path";
import { load, CheerioAPI } from "cheerio";
import type { ScrapedElection, ScrapedCandidate } from "@/types/election";

const DB_PATH = path.join(process.cwd(), "data", "elecciones.json");
const USER_AGENT =
  "Mozilla/5.0 (compatible; EleccionesFlashcoreBot/1.0; +https://elecciones.local)";

/* -------------------------------------------------------------------------- */
// Fuentes de ejemplo. Reemplazá/agregá las URLs reales de cada país/organismo.
/* -------------------------------------------------------------------------- */const SOURCES: Array<{
  name: string;
  url: string;
  type: ScrapedElection["type"];
  /* selectores CSS de ejemplo; adaptá según cada sitio */
  selectors?: {
    title: string;
    org: string;
    status: string;
    startDate: string;
    endDate: string;
    location: string;
    description: string;
    candidate: string;
    candidateName: string;
    candidateList: string;
    candidateVotes: string;
  };
}> = [
  {
    name: "FACA - Consejo de la Magistratura",
    url: "https://faca.org.ar/elecciones/resultados",
    type: "magistrate",
  },
  {
    name: "UNS - Universidad Nacional del Sur",
    url: "https://www.uns.edu.ar/noticias/2025/7574",
    type: "university",
  },
  {
    name: "Línea Sindical - CONADU",
    url: "https://www.lineasindical.com.ar/renovacin-sindical-quines-nuevos-dirigentes-pusieron-frente-gremios-clave-2025-n-1758720.html",
    type: "union",
  },
  {
    name: "Ejemplo Sindicato",
    url: "https://example.org/elecciones-sindicato",
    type: "union",
    selectors: {
      title: "h1",
      org: ".organizacion",
      status: ".estado",
      startDate: ".fecha-inicio",
      endDate: ".fecha-fin",
      location: ".lugar",
      description: ".descripcion",
      candidate: ".candidatura",
      candidateName: ".nombre",
      candidateList: ".lista",
      candidateVotes: ".votos",
    },
  },
  {
    name: "Consejo Universitario",
    url: "https://example.org/elecciones-consejo",
    type: "university",
  },
  {
    name: "Club Deportivo",
    url: "https://example.org/elecciones-club",
    type: "club",
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

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Fetch ${url} failed: ${res.status}`);
  return res.text();
}

function parseElectionFromHtml(
  html: string,
  source: (typeof SOURCES)[number],
): ScrapedElection | null {
  const $ = load(html);
  const sel = source.selectors;

  const title = sel?.title ? $(sel.title).first().text().trim() : "";
  const organization = sel?.org ? $(sel.org).first().text().trim() : source.name;
  if (!title) return null;

  const statusText = sel?.status ? $(sel.status).first().text().trim().toLowerCase() : "";
  let status: ScrapedElection["status"] = "upcoming";
  if (statusText.includes("en curso") || statusText.includes("ongoing") || statusText.includes("vivo")) status = "ongoing";
  else if (statusText.includes("finaliz") || statusText.includes("completed")) status = "completed";

  const startDate = sel?.startDate ? $(sel.startDate).first().attr("datetime") || $(sel.startDate).first().text().trim() : undefined;
  const endDate = sel?.endDate ? $(sel.endDate).first().attr("datetime") || $(sel.endDate).first().text().trim() : undefined;
  const location = sel?.location ? $(sel.location).first().text().trim() : undefined;
  const description = sel?.description ? $(sel.description).first().text().trim() : undefined;

  const candidates: ScrapedCandidate[] = [];
  if (sel?.candidate) {
    $(sel.candidate).each((_, el) => {
      const $c = $(el);
      const name = sel?.candidateName ? $c.find(sel.candidateName).first().text().trim() : $c.text().trim();
      const list = sel?.candidateList ? $c.find(sel.candidateList).first().text().trim() : undefined;
      const votesText = sel?.candidateVotes ? $c.find(sel.candidateVotes).first().text().trim() : "";
      const votes = votesText ? parseInt(votesText.replace(/\D/g, ""), 10) : undefined;
      if (name) candidates.push({ name, list, ...(votes != null ? { votes } : {}) });
    });
  }

  const id = `elec-${slugify(title)}-${slugify(source.name)}`;

  return {
    id,
    title,
    organization,
    type: source.type,
    status,
    startDate,
    endDate,
    location,
    description,
    sourceUrl: source.url,
    sourceName: source.name,
    candidates,
  };
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

export async function runScrape() {
  const db = readDb();
  const now = nowIso();
  let inserted = 0;
  let updated = 0;

  const existingById = new Map(db.elections.map((e: any) => [e.id, e]));

  for (const source of SOURCES) {
    let scraped: ScrapedElection | null = null;
    try {
      const html = await fetchHtml(source.url);
      scraped = parseElectionFromHtml(html, source);
    } catch (err) {
      console.error(`Error scraping ${source.name} (${source.url}):`, (err as Error).message);
    }
    if (!scraped) continue;

    const election = {
      ...scraped,
      updatedAt: now,
      createdAt: existingById.get(scraped.id)?.createdAt || now,
    };
    const candRows = (scraped.candidates || []).map((c, i) => ({
      id: `cand-${scraped.id}-${i}`,
      election_id: scraped.id,
      name: c.name,
      list: c.list ?? null,
      votes: c.votes ?? 0,
      percentage: 0,
      elected: 0,
    }));

    const existed = existingById.has(scraped.id);
    db.elections = db.elections.filter((e: any) => e.id !== scraped.id);
    db.elections.push(election);
    db.candidates = db.candidates.filter((c: any) => c.election_id !== scraped.id);
    db.candidates.push(...candRows);

    if (existed) updated++; else inserted++;
  }

  writeDb(db);
  return { inserted, updated, at: now, total: db.elections.length };
}

if (require.main === module) {
  runScrape()
    .then((r) => {
      console.log("Scrape completado:", r);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Scrape falló:", err);
      process.exit(1);
    });
}
