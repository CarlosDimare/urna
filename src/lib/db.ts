import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "elecciones.json");

function ensureDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readDb(): any {
  ensureDir();
  if (!fs.existsSync(DB_PATH)) {
    return { elections: [], candidates: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } catch {
    return { elections: [], candidates: [] };
  }
}

function writeDb(data: any) {
  ensureDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function initDb() {
  const data = readDb();
  if (!data.elections) data.elections = [];
  if (!data.candidates) data.candidates = [];
  writeDb(data);
}

export function getElections() {
  return readDb().elections || [];
}

export function getElectionById(id: string) {
  const data = readDb();
  const election = (data.elections || []).find((e: any) => e.id === id);
  if (!election) return null;
  const candidates = (data.candidates || []).filter(
    (c: any) => c.election_id === id
  );
  return { ...election, candidates };
}

export function upsertElection(election: any, candidates: any[] = []) {
  const data = readDb();
  data.elections = data.elections || [];
  data.candidates = data.candidates || [];

  const idx = data.elections.findIndex((e: any) => e.id === election.id);
  if (idx === -1) {
    data.elections.push(election);
  } else {
    data.elections[idx] = election;
  }

  data.candidates = data.candidates.filter((c: any) => c.election_id !== election.id);
  data.candidates.push(...candidates);

  writeDb(data);
}

export function closeDb() {
  // no-op for JSON storage
}
