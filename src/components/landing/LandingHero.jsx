import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { LOGO_LOJA_PADRAO } from "@/lib/relatorio";
import { createPageUrl } from "@/utils";
import MasonicBackdrop from "@/components/landing/MasonicBackdrop";

export default function LandingHero({ loja }) {
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 60, damping: 18 });
  const y = useSpring(my, { stiffness: 60, damping: 18 });
  return (
    <section id="top" onPointerMove={(e) => { if (reduced || e.pointerType !== "mouse") return; const rect = e.currentTarget.getBoundingClientRect(); mx.set((e.clientX - rect.left - rect.width / 2) / 24); my.set((e.clientY - rect.top - rect.height / 2) / 24); }} onPointerLeave={() => { mx.set(0); my.set(0); }} className="relative isolate flex min-h-screen items-center overflow-hidden bg-landing-deep px-6 pb-20 pt-36 text-primary-foreground">
      <MasonicBackdrop />
      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="text-center lg:text-left">
          <motion.p initial={reduced ? false : { opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-5 text-xs font-medium uppercase tracking-[0.28em] text-lodge-gold sm:text-sm">Augusta e Respeitável Loja Simbólica</motion.p>
          <motion.h1 initial={reduced ? false : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }} className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl xl:text-7xl">Cavaleiros <span className="text-lodge-gold">da Paz</span><span className="block">nº25</span></motion.h1>
          <motion.div initial={reduced ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.85, delay: 0.45 }} className="mx-auto mt-8 h-px w-24 origin-left bg-lodge-gold lg:mx-0" />
          <motion.p initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-slate-200 lg:mx-0 md:text-lg">Uma Oficina dedicada ao aperfeiçoamento do Homem e ao bem da sociedade, trabalhando sob os princípios da Liberdade, Igualdade e Fraternidade{loja?.oriente ? ` no Oriente de ${loja.oriente}` : ""}.</motion.p>
          <motion.div initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.58 }} className="mt-10 flex flex-wrap justify-center gap-3 lg:justify-start">
            <a href="#sobre" className="inline-flex items-center gap-2 rounded-md bg-lodge-gold px-6 py-3 font-semibold text-landing-deep transition-colors hover:bg-lodge-gold/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground">Conheça a Loja <ArrowDown className="h-4 w-4" /></a>
            <Link to={createPageUrl("Portais")} className="inline-flex items-center gap-2 rounded-md border border-slate-300/40 px-6 py-3 font-semibold text-primary-foreground transition-colors hover:border-lodge-gold hover:bg-landing-bright/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground">Acessar portais <ArrowUpRight className="h-4 w-4" /></Link>
          </motion.div>
        </div>
        <motion.div initial={reduced ? false : { opacity: 0, scale: 0.8, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1.1, delay: 0.25 }} className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center">
          <motion.div animate={reduced ? undefined : { rotate: 360 }} transition={{ duration: 70, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border border-dashed border-lodge-gold/35" />
          <div className="absolute inset-8 rounded-full border border-lodge-gold/20 bg-landing-bright/20 shadow-[0_0_100px_hsl(var(--landing-bright)/0.5)]" />
          <div className="absolute inset-16 rounded-full border border-lodge-gold/35" />
          <motion.div style={reduced ? undefined : { x, y }} className="relative flex h-2/3 w-2/3 items-center justify-center rounded-full bg-landing-deep/80 p-8 shadow-2xl"><img src={LOGO_LOJA_PADRAO} alt="Símbolo da A.R.L.S. Cavaleiros da Paz nº25" className="h-full w-full object-contain" /></motion.div>
        </motion.div>
      </div>
    </section>
  );
}