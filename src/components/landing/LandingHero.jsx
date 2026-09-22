import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { LOGO_LOJA_PADRAO } from "@/lib/relatorio";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

export default function LandingHero({ loja }) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 120]);
  const opacity = useTransform(scrollY, [0, 450], [1, 0]);

  return (
    <section id="top" className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-32">
      {/* Halos animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={reduceMotion ? undefined : { scale: [1, 1.18, 1], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-16 left-4 md:left-24 w-80 h-80 bg-[#C9A227]/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={reduceMotion ? undefined : { scale: [1.1, 1, 1.1], opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-4 right-4 md:right-24 w-[28rem] h-[28rem] bg-[#3F7CAC]/15 rounded-full blur-3xl"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(201,162,39,0.08),transparent_60%)]" />
      </div>

      <motion.div style={reduceMotion ? undefined : { y, opacity }} className="relative z-10 w-full flex flex-col items-center">
        <motion.div
        variants={container}
          initial={reduceMotion ? false : "hidden"}
          animate="show"
          className="text-center max-w-3xl"
        >
          <motion.div variants={item} className="relative mb-10 flex items-center justify-center">
            <motion.svg viewBox="0 0 360 310" aria-hidden="true" className="pointer-events-none absolute h-72 w-80 max-w-[90vw] md:h-80 md:w-96" fill="none" stroke="currentColor">
              <motion.path d="M35 275V145C35 66 100 18 180 18S325 66 325 145V275" className="text-lodge-gold/45" strokeWidth="1.5" initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2.1, ease: [0.22, 1, 0.36, 1] }} />
              <motion.path d="M53 275V146C53 79 107 37 180 37S307 79 307 146V275" className="text-white/20" strokeWidth="1" initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} />
            </motion.svg>
            <img src={LOGO_LOJA_PADRAO} alt="A.R.L.S. Cavaleiros da Paz nº25" className="relative w-48 drop-shadow-2xl md:w-64" />
          </motion.div>

          <motion.h1
            variants={item}
            className="mb-6 bg-gradient-to-b from-white via-white to-lodge-gold/70 bg-clip-text text-4xl font-bold leading-tight text-transparent md:text-6xl"
          >
            A.R.L.S. Cavaleiros da Paz nº25
          </motion.h1>

          <motion.div variants={item} className="flex items-center justify-center gap-3 mb-7">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#C9A227]/60" />
            <span className="w-1.5 h-1.5 rotate-45 bg-[#C9A227]" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#C9A227]/60" />
          </motion.div>

          <motion.p variants={item} className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Uma Oficina dedicada ao aperfeiçoamento do Homem e ao bem da sociedade, trabalhando
            sob os princípios da Liberdade, Igualdade e Fraternidade
            {loja?.oriente ? ` no Oriente de ${loja.oriente}` : ""}.
          </motion.p>

          <motion.a
            variants={item}
            href="#sobre"
            whileHover={reduceMotion ? undefined : { scale: 1.04 }}
            className="mt-12 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm text-slate-200 backdrop-blur-sm transition-colors hover:border-[#C9A227]/50 hover:text-[#C9A227]"
          >
            Conheça a Loja
            <motion.span animate={reduceMotion ? undefined : { y: [0, 4, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
              <ChevronDown className="w-4 h-4" />
            </motion.span>
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
}