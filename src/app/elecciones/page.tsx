import Link from "next/link";
import { getAllElections } from "@/lib/server-data";
import { ElectionCard } from "@/components/ElectionCard";

export default function ElectionsIndexPage() {
  const elections = getAllElections();
  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-neon-cyan selection:text-black">
      <header className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-neon-cyan font-mono font-bold text-xl tracking-tighter group-hover:glitch transition-all">
                ELEC
              </span>
              <span className="text-white font-mono font-bold text-xl tracking-tighter">
                CORE
              </span>
            </Link>
            <nav className="flex items-center gap-6 hidden md:flex">
              <Link
                href="/elecciones"
                className="text-neon-magenta font-mono text-sm uppercase tracking-widest hover:text-white transition-colors"
              >
                elecciones
              </Link>
              <a
                href="#feed"
                className="text-white/60 font-mono text-xs uppercase tracking-widest hover:text-white transition-colors"
              >
                feed en vivo
              </a>
            </nav>
            <div className="flex items-center gap-2">
              <span className="hidden md:block w-1 h-1 bg-neon-green rounded-full animate-pulse"></span>
              <span className="text-neon-green font-mono text-xs">vivo</span>
            </div>
          </div>
        </div>
      </header>
      <main className="pt-20 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-2 bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent">
              elecciones
            </h1>
            <p className="text-white/60 text-lg">
              sindicatos · universidades · magistratura · clubes · todo tipo de
              elecciones
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/elecciones"
              className="px-4 py-2 rounded bg-white text-black font-bold text-xs uppercase hover:bg-neon-cyan transition-colors"
            >
              actualizar
            </Link>
          </div>
        </div>

        <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-2">
          <div className="text-white/50 font-mono text-sm">
            {elections.length} elección{elections.length !== 1 ? "es" : ""}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {elections.map((e) => (
            <ElectionCard key={e.id} election={e} />
          ))}
        </div>
      </main>
    </div>
  );
}
