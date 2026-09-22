import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { LOGO_LOJA_PADRAO } from "@/lib/relatorio";
import MasonicBackdrop from "@/components/landing/MasonicBackdrop";

export default function LandingHero({ loja }) {
  const reduced = useReducedMotion();
  return (
    <section id="top" className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-lodge-deep px-6 pb-20 pt-32 text-center text-primary-foreground">
      <MasonicBackdrop />
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center">
        <motion.div initial={reduced ? false : { opacity: 0, scale: 0.86 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9 }} className="mb-9 flex h-40 w-40 items-center justify-center rounded-t-full border border-lodge-gold/40 bg-lodge-deep/80 p-3 md:h-52 md:w-52">
          <img src={LOGO_LOJA_PADRAO} alt="Símbolo da A.R.L.S. Cavaleiros da Paz nº25" className="h-32 w-32 object-contain md:h-44 md:w-44" />
        </motion.div>
        <motion.p initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }} className="mb-5 text-xs font-medium uppercase tracking-[0.35em] text-lodge-gold sm:text-sm">Augusta e Respeitável Loja Simbólica</motion.p>
        <motion.h1 initial={reduced ? false : { opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.85 }} className="max-w-4xl text-4xl font-semibold leading-[1.12] tracking-tight md:text-6xl lg:text-7xl">A.R.L.S. Cavaleiros <span className="text-lodge-gold">da Paz</span> nº25</motion.h1>
        <motion.p initial={reduced ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.75 }} className="mt-8 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">Uma Oficina dedicada ao aperfeiçoamento do Homem e ao bem da sociedade, trabalhando sob os princípios da Liberdade, Igualdade e Fraternidade{loja?.oriente ? ` no Oriente de ${loja.oriente}` : ""}.</motion.p>
        <motion.a href="#sobre" initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.7 }} className="mt-11 inline-flex items-center gap-3 border-b border-lodge-gold pb-2 text-sm font-medium uppercase tracking-widest text-lodge-gold transition-colors hover:text-primary-foreground">Conheça a Loja <ArrowDown className="h-4 w-4" /></motion.a>
      </div>
    </section>
  );
}