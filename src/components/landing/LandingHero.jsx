import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { LOGO_LOJA_PADRAO, LOGO_GLP_PADRAO } from "@/lib/relatorio";

export default function LandingHero({ loja }) {
  return (
    <section id="top" className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-24 left-10 w-72 h-72 bg-[#C9A227]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#C9A227]/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-3xl"
      >
        <div className="flex items-center justify-center gap-8 mb-8">
          <img src={LOGO_GLP_PADRAO} alt="Grande Loja do Paraná" className="w-20 md:w-24 drop-shadow-2xl" />
          <img src={LOGO_LOJA_PADRAO} alt="A.R.L.S. Cavaleiros da Paz nº25" className="w-36 md:w-48 drop-shadow-2xl" />
        </div>

        <p className="text-[#C9A227] text-xs md:text-sm uppercase tracking-[0.25em] mb-4">
          Grande Loja Maçônica do Estado do Paraná
        </p>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          A.R.L.S. Cavaleiros da Paz nº25
        </h1>
        <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
          Uma Oficina dedicada ao aperfeiçoamento do Homem e ao bem da sociedade, trabalhando
          sob os princípios da Liberdade, Igualdade e Fraternidade
          {loja?.oriente ? ` no Oriente de ${loja.oriente}` : ""}.
        </p>

        <a
          href="#sobre"
          className="mt-12 inline-flex items-center gap-2 text-slate-400 hover:text-[#C9A227] text-sm transition-colors"
        >
          Conheça a Loja
          <ChevronDown className="w-4 h-4" />
        </a>
      </motion.div>
    </section>
  );
}