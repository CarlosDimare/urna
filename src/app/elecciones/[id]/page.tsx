import { notFound } from "next/navigation";
import { getElectionById } from "@/lib/server-data";
import { FlashHeader } from "@/components/ui";

import electionsData from "@/data/elections.json";

export function generateStaticParams() {
  const elections = electionsData.elections as Array<{ id: string }>;
  return elections.map((e) => ({ id: e.id }));
}

export default function ElectionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const election = getElectionById(params.id);
  if (!election) notFound();

  const candidates = (election.candidates || [])
    .slice()
    .sort((a: any, b: any) => (b.votes || 0) - (a.votes || 0));

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <FlashHeader />
      <main className="pt-20 pb-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tighter mb-6 bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent">
          {election.title}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 p-4 rounded border border-white/10">
            <p className="text-[10px] font-bold text-neon-magenta uppercase mb-1">
              organización
            </p>
            <p className="text-white">{election.organization}</p>
          </div>
          <div className="bg-white/5 p-4 rounded border border-white/10">
            <p className="text-[10px] font-bold text-neon-cyan uppercase mb-1">
              tipo
            </p>
            <p className="text-white">{election.type}</p>
          </div>
          <div className="bg-white/5 p-4 rounded border border-white/10">
            <p className="text-[10px] font-bold text-white/60 uppercase mb-1">
              estado
            </p>
            <p className="text-neon-green font-bold">{election.status}</p>
          </div>
          <div className="bg-white/5 p-4 rounded border border-white/10">
            <p className="text-[10px] font-bold text-white/60 uppercase mb-1">
              fecha
            </p>
            <p className="text-white">
              {election.startDate
                ? new Date(election.startDate).toLocaleString("es-ES")
                : "—"}
            </p>
          </div>
        </div>
        {election.description && (
          <div className="mb-8">
            <p className="text-[10px] font-bold text-white/60 uppercase mb-2">
              descripción
            </p>
            <p className="text-white/90 leading-relaxed">
              {election.description}
            </p>
          </div>
        )}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 border-b border-white/10 pb-2">
            candidaturas
          </h2>
          <div className="space-y-3">
            {candidates.map((c: any) => (
              <div
                key={c.id}
                className="p-3 bg-white/5 rounded border border-white/10 flex justify-between items-start"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white">{c.name}</span>
                    {c.list && (
                      <span className="text-xs bg-neon-cyan/20 text-neon-cyan px-2 py-0.5 rounded">
                        {c.list}
                      </span>
                    )}
                    {c.elected && (
                      <span className="text-xs bg-neon-green/20 text-neon-green px-2 py-0.5 rounded">
                        electo
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neon-cyan"
                      style={{ width: c.percentage ? `${c.percentage}%` : "0%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-white/50 mt-1">
                    <span>{c.votes} votos</span>
                    <span>{c.percentage?.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {election.sourceUrl && (
          <div className="mt-8 pt-8 border-t border-white/10">
            <a
              href={election.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-cyan text-xs underline hover:text-white transition-colors"
            >
              ver fuente: {election.sourceName || election.sourceUrl}
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
