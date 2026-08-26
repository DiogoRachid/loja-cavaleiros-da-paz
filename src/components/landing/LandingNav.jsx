import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LogIn } from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
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
  const { scrollY } = useScroll();
  const [compacto, setCompacto] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => setCompacto(v > 40));

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
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
          <span className="text-white font-semibold text-base md:text-lg hidden sm:block">Cavaleiros da Paz nº25</span>
        </a>

        <nav className="hidden md:flex items-center gap-7">
          {ITENS.map((i) => (
            <a
              key={i.href}
              href={i.href}
              className="relative text-slate-300 hover:text-[#C9A227] text-base transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-[#C9A227] after:transition-all after:duration-300 hover:after:w-full"
            >
              {i.label}
            </a>
          ))}
        </nav>

        <Link to={createPageUrl("Portais")}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-[#C9A227] hover:bg-[#dcb437] text-[#1B3A5F] text-sm font-semibold px-6 py-2.5 rounded-full shadow-lg shadow-[#C9A227]/20 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Acessar o Sistema</span>
          </motion.button>
        </Link>
      </div>
    </motion.header>
  );
}