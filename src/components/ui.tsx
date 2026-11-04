"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function FlashHeader() {
  return (
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
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { color: string; label: string }> = {
    upcoming: { color: "bg-neon-yellow/10 text-neon-yellow border-neon-yellow/30", label: "próxima" },
    ongoing: { color: "bg-neon-green/10 text-neon-green border-neon-green/30 animate-pulse", label: "en vivo" },
    completed: { color: "bg-white/10 text-white border-white/20", label: "finalizada" },
  };
  const v = variants[status] || variants.completed;
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${v.color}`}>
      {v.label}
    </span>
  );
}
