import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Users, Crown, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { LOGO_LOJA_PADRAO } from "@/lib/relatorio";

export default function Portais() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B3A5F] to-[#0D1F33] relative overflow-hidden">
      <Link
        to={createPageUrl("Home")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 text-slate-300 hover:text-[#C9A227] text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#C9A227]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C9A227]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <img
            src={LOGO_LOJA_PADRAO}
            alt="A.R.L.S. Cavaleiros da Paz nº25"
            className="w-32 md:w-40 mx-auto mb-6 drop-shadow-2xl"
          />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Selecione o Portal</h1>
          <h2 className="text-lg font-light text-[#C9A227]">Escolha a forma de acesso ao sistema</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="w-full max-w-4xl"
        >
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link to={createPageUrl("IrmaoLogin")}>
              <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 cursor-pointer h-full">
                <div className="w-16 h-16 mb-6 rounded-xl bg-[#C9A227]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-[#C9A227]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Portal do Irmão</h3>
                <p className="text-slate-300 text-sm">
                  Acesse seus dados, mensalidades, frequência e biblioteca
                </p>
              </div>
            </Link>

            <Link to={createPageUrl("AdminLogin")}>
              <div className="group bg-white/10 backdrop-blur-sm border border-[#C9A227]/40 rounded-2xl p-8 hover:bg-[#C9A227]/10 transition-all duration-300 cursor-pointer h-full">
                <div className="w-16 h-16 mb-6 rounded-xl bg-[#C9A227]/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Crown className="w-8 h-8 text-[#C9A227]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Portal Administrativo</h3>
                <p className="text-slate-300 text-sm">
                  Acesso exclusivo para oficiais e cargos da loja
                </p>
              </div>
            </Link>
          </div>
        </motion.div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="absolute bottom-6 text-center"
        >
          <p className="text-slate-400 text-sm">
            Loja Cavaleiros da Paz nº25 • Grande Loja do Paraná
          </p>
        </motion.footer>
      </div>
    </div>
  );
}