"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ElectionCard, ElectionList } from "./ElectionCard";
import { FlashHeader } from "./ui";

export function ElectionsPage() {
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/elections")
      .then((r) => r.json())
      .then((data) => {
        setElections(data.elections || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-neon-cyan selection:text-black">
      <FlashHeader />
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
            <button
              className="px-4 py-2 rounded bg-white text-black font-bold text-xs uppercase hover:bg-neon-cyan transition-colors"
              onClick={() => location.reload()}
            >
              actualizar
            </button>
          </div>
        </div>

        <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-2">
          <div className="text-white/50 font-mono text-sm">
            {elections.length} elección{elections.length !== 1 ? "es" : ""} activa{/* */}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-[spin_1s_linear_infinite] mb-4"></div>
              <p className="text-neon-cyan font-mono text-sm uppercase tracking-widest">cargando datos en vivo...</p>
            </div>
          ) : (
            <ElectionList elections={elections} />
          )}
        </motion.div>
      </main>
    </div>
  );
}
