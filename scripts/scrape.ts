import { initDb, upsertElection } from "@/lib/db";
import type { ScrapedElection } from "@/types/election";

const SOURCES: Array<{
  name: string;
  url: string;
  type: ScrapedElection["type"];
}> = [
  { name: "Ejemplo Sindicato", url: "https://example.org/elecciones-sindicato", type: "union" },
  { name: "Consejo Universitario", url: "https://example.org/elecciones-consejo", type: "university" },
  { name: "Consejo de la Magistratura", url: "https://example.org/elecciones-magistratura", type: "magistrate" },
  { name: "Club Deportivo", url: "https://example.org/elecciones-club", type: "club" },
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
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; EleccionesFlashcoreBot/1.0; +https://elecciones.local)",
    },
  });
  if (!res.ok) throw new Error(`Fetch ${url} failed: ${res.status}`);
  return res.text();
}

function parseElectionFromHtml(html: string, source: (typeof SOURCES)[number]): ScrapedElection | null {
  // Placeholder: aquí se usaría cheerio para extraer datos reales de cada fuente.
  // No se inventan datos; se devuelve null si no hay parseo implementado.
  return null;
}

export async function runScrape() {
  initDb();
  const now = nowIso();
  let inserted = 0;
  let updated = 0;

  for (const source of SOURCES) {
    let scraped: ScrapedElection | null = null;
    try {
      const html = await fetchHtml(source.url);
      scraped = parseElectionFromHtml(html, source);
    } catch (err) {
      console.error(`Error scraping ${source.name}:`, err);
    }
    if (!scraped) continue;

    const id = `elec-${slugify(scraped.title)}-${slugify(source.name)}`;
    const status = scraped.status ?? "upcoming";
    const election = {
      id,
      title: scraped.title,
      organization: scraped.organization,
      type: scraped.type,
      status,
      startDate: scraped.startDate ?? null,
      endDate: scraped.endDate ?? null,
      location: scraped.location ?? null,
      description: scraped.description ?? null,
      sourceUrl: scraped.sourceUrl,
      sourceName: scraped.sourceName,
      totalVotes: null,
      eligibleVoters: null,
      updatedAt: now,
      createdAt: now,
    };
    const candRows = (scraped.candidates || []).map((c, i) => ({
      id: `cand-${id}-${i}`,
      election_id: id,
      name: c.name,
      list: c.list ?? null,
      votes: 0,
      percentage: 0,
      elected: 0,
    }));

    // detectar si ya existía para contar inserted vs updated
    const fs = await import("fs");
    const path = await import("path");
    const DB_PATH = path.join(process.cwd(), "data", "elecciones.json");
    const existing = JSON.parse(fs.readFileSync(DB_PATH, "utf-8")).elections.find((e: any) => e.id === id);

    upsertElection(election, candRows);
    if (existing) updated++; else inserted++;
  }

  return { inserted, updated, at: now };
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
