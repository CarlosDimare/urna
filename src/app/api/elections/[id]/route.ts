export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { initDb, getElectionById } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  initDb();
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: "id requerido" }, { status: 400 });
    }

    const election = getElectionById(id);
    if (!election) {
      return NextResponse.json({ error: "no encontrada" }, { status: 404 });
    }

    return NextResponse.json(election);
  } catch (err) {
    return NextResponse.json({ error: "error interno" }, { status: 500 });
  }
}
