import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LogIn } from "lucide-react";
import { LOGO_LOJA_PADRAO, LOGO_GLP_PADRAO } from "@/lib/relatorio";

export default function LandingFooter() {
  return (
    <footer className="border-t border-lodge-gold/20 bg-landing-surface px-6 py-14">
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
          <button className="inline-flex items-center gap-2 rounded-md bg-lodge-gold px-7 py-3.5 text-base font-semibold text-landing-deep transition-colors hover:bg-lodge-gold/80">
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