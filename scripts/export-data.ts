import fs from "fs";
import path from "path";

const SRC = path.join(process.cwd(), "data", "elecciones.json");
const DEST = path.join(process.cwd(), "public", "data", "elections.json");
const SRC_DATA = path.join(process.cwd(), "src", "data", "elections.json");

fs.mkdirSync(path.dirname(DEST), { recursive: true });
fs.mkdirSync(path.dirname(SRC_DATA), { recursive: true });

if (!fs.existsSync(SRC)) {
  const empty = { elections: [] };
  fs.writeFileSync(DEST, JSON.stringify(empty, null, 2));
  fs.writeFileSync(SRC_DATA, JSON.stringify(empty, null, 2));
  console.log("Datos exportados (vacíos) a", DEST);
  process.exit(0);
}

const raw = JSON.parse(fs.readFileSync(SRC, "utf-8"));
const elections = raw.elections || [];
const candidates = raw.candidates || [];

const enriched = elections.map((e: any) => ({
  ...e,
  candidates: candidates.filter((c: any) => c.election_id === e.id),
}));

const out = { elections: enriched };
fs.writeFileSync(DEST, JSON.stringify(out, null, 2));
fs.writeFileSync(SRC_DATA, JSON.stringify(out, null, 2));
console.log(`Datos exportados a ${DEST} y ${SRC_DATA} (${enriched.length} elecciones)`);
