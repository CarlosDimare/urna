import { NextResponse } from "next/server";
import { initDb, getElections } from "@/lib/db";

export async function GET(request: Request) {
  initDb();
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const q = searchParams.get("q");

    let elections = getElections();

    if (type) elections = elections.filter((e: any) => e.type === type);
    if (status) elections = elections.filter((e: any) => e.status === status);
    if (q) {
      const query = q.toLowerCase();
      elections = elections.filter(
        (e: any) =>
          e.title.toLowerCase().includes(query) ||
          e.organization.toLowerCase().includes(query)
      );
    }

    elections = elections.sort(
      (a: any, b: any) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    const enriched = elections.map((e: any) => ({
      ...e,
      candidateCount: (e.candidates || []).length,
    }));

    return NextResponse.json({ elections: enriched, count: enriched.length });
  } catch (err) {
    return NextResponse.json({ error: "error interno" }, { status: 500 });
  }
}
