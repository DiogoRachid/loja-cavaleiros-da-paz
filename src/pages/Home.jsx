import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calendar, LogIn, Music, BookOpen, Users } from "lucide-react";
import { motion } from "framer-motion";
import { LOGO_LOJA_PADRAO, LOGO_GLP_PADRAO } from "@/lib/relatorio";

const DESTAQUES = [
  { icon: Users, titulo: "Gestão dos Irmãos", texto: "Cadastro, movimentação maçônica, frequência e mensalidades." },
  { icon: BookOpen, titulo: "Secretaria e Acervo", texto: "Balaústres, expedientes, pareceres e biblioteca digital." },
  { icon: Music, titulo: "Cerimonial e Harmonia", texto: "Roteiros ritualísticos, ordem de entrada e trilha musical." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B3A5F] to-[#0D1F33] relative overflow-hidden">
      {/* Calendário */}
      <a
        href="webcal://p133-caldav.icloud.com/published/2/MTE4OTcxMzcyMDExODk3MXpVMJXwr2vT2q1xXrvKY5Bo-F7nDiToCpUvjRHTwqnLuU7OWhwX0meCb2Ies0FOUS0jjoAPV67ObmqfQ85CmGg"
        className="fixed top-6 right-6 z-50 w-12 h-12 bg-[#C9A227] hover:bg-[#8B7019] rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
        title="Calendário"
      >
        <Calendar className="w-6 h-6 text-[#1B3A5F]" />
      </a>

      {/* Decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#C9A227]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#C9A227]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl"
        >
          <div className="flex items-center justify-center gap-8 mb-8">
            <img src={LOGO_GLP_PADRAO} alt="Grande Loja do Paraná" className="w-20 md:w-24 drop-shadow-2xl" />
            <img src={LOGO_LOJA_PADRAO} alt="A.R.L.S. Cavaleiros da Paz nº25" className="w-36 md:w-48 drop-shadow-2xl" />
          </div>

          <p className="text-[#C9A227] text-xs md:text-sm uppercase tracking-[0.25em] mb-4">
            Grande Loja Maçônica do Estado do Paraná
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            A.R.L.S. Cavaleiros da Paz nº25
          </h1>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed">
            Sistema oficial de gestão da Loja — reunindo secretaria, tesouraria, cerimonial,
            harmonia, ação social e o portal do Irmão em um único ambiente.
          </p>

          <Link to={createPageUrl("Portais")}>
            <button className="mt-10 inline-flex items-center gap-3 bg-[#C9A227] hover:bg-[#b08e1f] text-[#1B3A5F] font-semibold px-8 py-4 rounded-full shadow-xl transition-all duration-200 hover:scale-105">
              <LogIn className="w-5 h-5" />
              Acessar o Sistema
            </button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="grid md:grid-cols-3 gap-5 w-full max-w-4xl mt-16"
        >
          {DESTAQUES.map(({ icon: Icon, titulo, texto }) => (
            <div key={titulo} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-left">
              <div className="w-11 h-11 mb-4 rounded-xl bg-[#C9A227]/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#C9A227]" />
              </div>
              <h3 className="text-white font-semibold mb-1">{titulo}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{texto}</p>
            </div>
          ))}
        </motion.div>

        <p className="text-slate-500 text-xs mt-16 text-center">
          Loja Cavaleiros da Paz nº25 • Grande Loja do Paraná
        </p>
      </div>
    </div>
  );
}