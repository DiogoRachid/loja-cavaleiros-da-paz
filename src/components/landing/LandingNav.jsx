import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LogIn } from "lucide-react";
import { LOGO_LOJA_PADRAO } from "@/lib/relatorio";

const ITENS = [
  { label: "A Loja", href: "#sobre" },
  { label: "Princípios", href: "#principios" },
  { label: "Atividades", href: "#atividades" },
  { label: "Reuniões", href: "#reunioes" },
  { label: "Contato", href: "#contato" },
];

export default function LandingNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0D1F33]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-3">
          <img src={LOGO_LOJA_PADRAO} alt="Cavaleiros da Paz nº25" className="w-9 h-9 object-contain" />
          <span className="text-white font-semibold text-sm hidden sm:block">Cavaleiros da Paz nº25</span>
        </a>

        <nav className="hidden md:flex items-center gap-7">
          {ITENS.map((i) => (
            <a key={i.href} href={i.href} className="text-slate-300 hover:text-[#C9A227] text-sm transition-colors">
              {i.label}
            </a>
          ))}
        </nav>

        <Link to={createPageUrl("Portais")}>
          <button className="inline-flex items-center gap-2 bg-[#C9A227] hover:bg-[#b08e1f] text-[#1B3A5F] text-sm font-semibold px-4 py-2 rounded-full transition-colors">
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Acessar o Sistema</span>
          </button>
        </Link>
      </div>
    </header>
  );
}