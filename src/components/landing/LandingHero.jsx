import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { LOGO_LOJA_PADRAO, LOGO_GLP_PADRAO } from "@/lib/relatorio";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

export default function LandingHero({ loja }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 120]);
  const opacity = useTransform(scrollY, [0, 450], [1, 0]);

  return (
    <section id="top" className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
      {/* Halos animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-16 left-4 md:left-24 w-80 h-80 bg-[#C9A227]/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-4 right-4 md:right-24 w-[28rem] h-[28rem] bg-[#3F7CAC]/15 rounded-full blur-3xl"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(201,162,39,0.08),transparent_60%)]" />
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 w-full flex flex-col items-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="text-center max-w-3xl"
        >
          <motion.div variants={item} className="flex items-center justify-center mb-10">
            <motion.img
              src={LOGO_LOJA_PADRAO}
              alt="A.R.L.S. Cavaleiros da Paz nº25"
              className="w-48 md:w-64 drop-shadow-2xl"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            />
          </motion.div>

          <motion.h1
            variants={item}
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-b from-white via-white to-[#C9A227]/70 bg-clip-text text-transparent"
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
            whileHover={{ scale: 1.04 }}
            className="mt-12 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm text-slate-200 backdrop-blur-sm transition-colors hover:border-[#C9A227]/50 hover:text-[#C9A227]"
          >
            Conheça a Loja
            <motion.span animate={{ y: [0, 4, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
              <ChevronDown className="w-4 h-4" />
            </motion.span>
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
}