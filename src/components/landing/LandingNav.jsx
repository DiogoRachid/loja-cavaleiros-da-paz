import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LogIn } from "lucide-react";
import { motion, useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { LOGO_LOJA_PADRAO } from "@/lib/relatorio";

const ITENS = [
  { label: "A Loja", href: "#sobre" },
  { label: "Princípios", href: "#principios" },
  { label: "Atividades", href: "#atividades" },
  { label: "Reuniões", href: "#reunioes" },
  { label: "Contato", href: "#contato" },
];

export default function LandingNav() {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [compacto, setCompacto] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => setCompacto(v > 40));

  return (
    <motion.header
      initial={reduceMotion ? false : { y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        compacto
          ? "bg-[#0D1F33]/85 backdrop-blur-xl border-b border-[#C9A227]/20 shadow-lg shadow-black/30"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className={`max-w-6xl mx-auto px-6 flex items-center justify-between transition-all duration-500 ${compacto ? "h-20" : "h-28"}`}>
        <a href="#top" className="group flex items-center gap-3">
          <img
            src={LOGO_LOJA_PADRAO}
            alt="Cavaleiros da Paz nº25"
            className={`object-contain transition-all duration-500 group-hover:scale-110 ${compacto ? "w-12 h-12" : "w-16 h-16"}`}
          />
          <span className="text-white font-semibold text-lg md:text-2xl hidden sm:block">Cavaleiros da Paz nº25</span>
        </a>

        <nav className="hidden md:flex items-center gap-7">
          {ITENS.map((i) => (
            <a
              key={i.href}
              href={i.href}
              className="relative text-slate-300 hover:text-[#C9A227] text-lg transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-[#C9A227] after:transition-all after:duration-300 hover:after:w-full"
            >
              {i.label}
            </a>
          ))}
        </nav>

        <Link to={createPageUrl("Portais")}>
          <motion.button
            whileHover={reduceMotion ? undefined : { scale: 1.05 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            aria-label="Acessar o Sistema"
            className="inline-flex items-center gap-2 rounded-full bg-lodge-gold px-4 py-3 text-base font-semibold text-lodge-navy shadow-lg shadow-lodge-gold/20 transition-colors hover:bg-lodge-gold/90 sm:px-7"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Acessar o Sistema</span>
          </motion.button>
        </Link>
      </div>
    </motion.header>
  );
}