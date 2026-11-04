"use client";

import Link from "next/link";
import { StatusBadge } from "./ui";
import type { Election } from "@/types/election";

export function ElectionCard({ election }: { election: Election }) {
  const isOngoing = election.status === "ongoing";
  const top = election.candidates[0];
  return (
    <article
      className="group relative p-4 bg-white/5 border border-white/10 rounded-lg hover:border-neon-cyan/50 transition-all duration-300 hover:bg-white/10"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-mono font-bold text-neon-magenta uppercase tracking-wider">
          {election.type}
        </span>
        <StatusBadge status={election.status} />
      </div>
      <Link href={`/elecciones/${election.id}`} className="block">
        <h3 className="text-lg font-mono font-bold text-white mb-1 group-hover:text-neon-cyan transition-colors">
          {election.title}
        </h3>
        <p className="text-xs text-white/60 leading-tight mb-3">
          {election.organization}
        </p>
      </Link>
      <div className="flex items-center justify-between text-xs text-white/50 mb-2">
        <span>{election.startDate ? new Date(election.startDate).toLocaleDateString("es-ES") : "—"}</span>
        <span>{election.location || "—"}</span>
      </div>
      {top && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-white/40">lider:</span>
          <span className="text-neon-cyan font-mono text-xs font-bold">{top.name}</span>
          {top.votes != null && (
            <span className="text-white/40 text-[10px]">· {top.votes} votos</span>
          )}
        </div>
      )}
      {isOngoing && (
        <div className="absolute top-0 right-0 p-2">
          <div className="w-2 h-2 bg-neon-red rounded-full animate-pulse"></div>
        </div>
      )}
    </article>
  );
}

export function ElectionList({ elections }: { elections: Election[] }) {
  if (elections.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-white/40 font-mono text-lg">no hay elecciones registradas</p>
        <p className="text-white/30 font-mono text-xs mt-2">ejecuta `npm run scrape` o espera la próxima actualización horaria</p>
      </div>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {elections.map((e) => (
        <ElectionCard key={e.id} election={e} />
      ))}
    </div>
  );
}
