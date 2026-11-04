export type ElectionStatus = "upcoming" | "ongoing" | "completed";

export interface ElectionCandidate {
  id: string;
  name: string;
  list?: string;
  votes?: number;
  percentage?: number;
  elected?: boolean;
}

export interface Election {
  id: string;
  title: string;
  organization: string;
  type: "union" | "university" | "magistrate" | "club" | "other";
  status: ElectionStatus;
  startDate?: string;
  endDate?: string;
  location?: string;
  description?: string;
  sourceUrl?: string;
  sourceName?: string;
  candidates: ElectionCandidate[];
  totalVotes?: number;
  eligibleVoters?: number;
  updatedAt: string;
  createdAt: string;
}

export interface ScrapedElection {
  title: string;
  organization: string;
  type: Election["type"];
  status?: ElectionStatus;
  startDate?: string;
  endDate?: string;
  location?: string;
  description?: string;
  sourceUrl: string;
  sourceName: string;
  candidates?: ScrapedCandidate[];
}

export interface ScrapedCandidate {
  name: string;
  list?: string;
}
