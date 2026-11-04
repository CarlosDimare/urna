import electionsData from "@/data/elections.json";

const raw = electionsData as { elections: any[] };

export function getAllElections(): any[] {
  return raw.elections;
}

export function getElectionById(id: string): any | undefined {
  return raw.elections.find((e) => e.id === id);
}

export function getElectionsCount(): number {
  return raw.elections.length;
}
