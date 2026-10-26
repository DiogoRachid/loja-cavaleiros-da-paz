import useAcessoOficial from "@/components/irmaos/useAcessoOficial";
import { createPageUrl } from "@/utils";
import { ArrowLeft } from "lucide-react";
import EscolhaCargoAcesso from "@/components/irmaos/EscolhaCargoAcesso";
import CredenciaisOficial from "@/components/irmaos/CredenciaisOficial";
import { motion, useReducedMotion } from "framer-motion";
import MasonicBackdrop from "@/components/landing/MasonicBackdrop";
import EsquadroCompasso from "@/components/landing/EsquadroCompasso";
import { LOGO_LOJA_PADRAO } from "@/lib/relatorio";
import { Link } from "react-router-dom";


export default function AdminLogin() {
  const reduced = useReducedMotion();
  const { numeroGlp, setNumeroGlp, senha, setSenha, loading, erro, irmaoValidado, opcoes, handleLogin, confirmarCargo, voltar } = useAcessoOficial();

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-landing-deep p-6 text-primary-foreground">
      <MasonicBackdrop />
      <div className="relative z-10 w-full max-w-lg py-10">
        <Link to={createPageUrl("Home")} className="flex items-center gap-2 text-slate-300 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao início
        </Link>

        <motion.div initial={reduced ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} className="rounded-2xl border border-lodge-gold/30 bg-landing-surface/95 p-7 shadow-2xl backdrop-blur-sm sm:p-9">
          <div className="text-center mb-8">
            <img src={LOGO_LOJA_PADRAO} alt="Brasão da Loja Cavaleiros da Paz nº25" className="mx-auto mb-2 h-28 w-28 object-contain sm:h-32 sm:w-32" />
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-lodge-gold sm:text-base">Cavaleiros da Paz nº25</p>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-lodge-gold/50 bg-lodge-gold/10 text-lodge-gold">
              <EsquadroCompasso className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Portal Administrativo
            </h1>
            <p className="text-slate-300 text-sm mt-1">Acesso exclusivo para oficiais</p>
          </div>

          <div className="space-y-5">
            {erro && <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/20 px-4 py-3 text-sm text-primary-foreground">{erro}</div>}
            {irmaoValidado ? <EscolhaCargoAcesso nome={irmaoValidado.nome_completo} opcoes={opcoes} loading={loading} onConfirmar={confirmarCargo} onVoltar={voltar} /> : <CredenciaisOficial numeroGlp={numeroGlp} senha={senha} loading={loading} onNumeroGlp={setNumeroGlp} onSenha={setSenha} onSubmit={handleLogin} />}
          </div>
        </motion.div>
      </div>
    </div>
  );
}