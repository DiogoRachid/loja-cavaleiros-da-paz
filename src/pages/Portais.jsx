import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, ArrowUpRight, Handshake } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { LOGO_LOJA_PADRAO } from "@/lib/relatorio";
import EsquadroCompasso from "@/components/landing/EsquadroCompasso";
import MasonicBackdrop from "@/components/landing/MasonicBackdrop";

const acessos = [
  { numero: "I", titulo: "Portal do Irmão", descricao: "Sua vida na Loja: sessões, frequência, mensalidades e acervo.", destino: "IrmaoLogin", simbolo: "irmao" },
  { numero: "II", titulo: "Portal do Oficial", descricao: "Acesso aos trabalhos e à gestão do seu cargo na Loja.", destino: "AdminLogin", simbolo: "oficial" },
];

export default function Portais() {
  const reduced = useReducedMotion();
  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-lodge-deep px-6 py-8 text-primary-foreground">
      <MasonicBackdrop />
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col">
        <Link to={createPageUrl("Home")} className="inline-flex w-fit items-center gap-2 text-sm text-slate-300 transition-colors hover:text-lodge-gold"><ArrowLeft className="h-4 w-4" /> Voltar à Loja</Link>
        <div className="flex flex-1 flex-col items-center justify-center py-14">
          <motion.div initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12 text-center">
            <img src={LOGO_LOJA_PADRAO} alt="Cavaleiros da Paz nº25" className="mx-auto mb-5 h-28 w-28 object-contain" />
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-lodge-gold">Cavaleiros da Paz nº25</p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Escolha seu portal</h1>
            <p className="mt-4 text-slate-300">Um só propósito, diferentes formas de servir à Loja.</p>
          </motion.div>
          <div className="grid w-full max-w-3xl gap-5 md:grid-cols-2">
            {acessos.map((acesso, index) => (
              <motion.div key={acesso.destino} initial={reduced ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12 + index * 0.1 }}>
                <Link to={createPageUrl(acesso.destino)} className="group flex h-full min-h-72 flex-col rounded-t-[5rem] rounded-b-lg border border-lodge-gold/35 bg-lodge-surface/90 p-8 transition-colors hover:border-lodge-gold hover:bg-lodge-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lodge-gold">
                  <div className="mb-7 flex items-start justify-between text-lodge-gold">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-lodge-gold/40">{acesso.simbolo === "oficial" ? <EsquadroCompasso className="h-12 w-12" /> : <Handshake className="h-8 w-8" />}</div>
                    <span className="font-serif text-2xl">{acesso.numero}</span>
                  </div>
                  <h2 className="text-2xl font-semibold">{acesso.titulo}</h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-300">{acesso.descricao}</p>
                  <span className="mt-7 inline-flex items-center gap-2 border-t border-lodge-gold/30 pt-4 text-sm font-semibold text-lodge-gold">Acessar portal <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
        <p className="relative pb-3 text-center text-xs text-slate-400">A.R.L.S. Cavaleiros da Paz nº25 · Grande Loja Maçônica do Estado do Paraná</p>
      </div>
    </main>
  );
}