import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LogIn } from "lucide-react";
import { LOGO_LOJA_PADRAO, LOGO_GLP_PADRAO } from "@/lib/relatorio";

export default function LandingFooter() {
  return (
    <footer className="bg-[#0A1725] border-t border-white/10 py-14 px-6">
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center gap-6">
        <div className="flex items-center gap-6">
          <img src={LOGO_GLP_PADRAO} alt="Grande Loja do Paraná" className="w-20" />
          <img src={LOGO_LOJA_PADRAO} alt="Cavaleiros da Paz nº25" className="w-28" />
        </div>

        <p className="text-slate-300 text-base md:text-lg max-w-2xl leading-relaxed">
          A.R.L.S. Cavaleiros da Paz nº25 — Grande Loja Maçônica do Estado do Paraná.
          <br />
          Área restrita destinada aos Irmãos e Oficiais da Loja.
        </p>

        <Link to={createPageUrl("Portais")}>
          <button className="inline-flex items-center gap-2 bg-[#C9A227] hover:bg-[#b08e1f] text-[#1B3A5F] text-base font-semibold px-7 py-3.5 rounded-full transition-colors">
            <LogIn className="w-4 h-4" />
            Acessar o Sistema
          </button>
        </Link>

        <p className="text-slate-500 text-sm mt-4">
          © {new Date().getFullYear()} Loja Cavaleiros da Paz nº25 • Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}