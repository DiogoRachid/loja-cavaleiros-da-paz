import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, Users, Shield, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B3A5F] to-[#0D1F33] relative overflow-hidden">
      {/* Calendar Button */}
      <a 
        href="webcal://p133-caldav.icloud.com/published/2/MTE4OTcxMzcyMDExODk3MXpVMJXwr2vT2q1xXrvKY5Bo-F7nDiToCpUvjRHTwqnLuU7OWhwX0meCb2Ies0FOUS0jjoAPV67ObmqfQ85CmGg"
        className="fixed top-6 right-6 z-50 w-12 h-12 bg-[#C9A227] hover:bg-[#8B7019] rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
        title="Calendário"
      >
        <Calendar className="w-6 h-6 text-[#1B3A5F]" />
      </a>

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#C9A227]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C9A227]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Logo and Title */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#C9A227] to-[#8B7019] flex items-center justify-center shadow-2xl">
            <BookOpen className="w-12 h-12 text-[#1B3A5F]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Biblioteca
          </h1>
          <h2 className="text-2xl md:text-3xl font-light text-[#C9A227]">
            Cavaleiros da Paz nº25
          </h2>
          <p className="text-slate-300 mt-4 text-lg">
            Sistema de Gestão do Acervo
          </p>
        </motion.div>

        {/* Portal Selection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-3xl"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Portal do Irmão */}
            <Link to={createPageUrl("IrmaoLogin")}>
              <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 cursor-pointer">
                <div className="w-16 h-16 mb-6 rounded-xl bg-[#C9A227]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="w-8 h-8 text-[#C9A227]" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  Portal do Irmão
                </h3>
                <p className="text-slate-300">
                  Consulte seus empréstimos, faça retiradas e devoluções via QR Code
                </p>
              </div>
            </Link>

            {/* Portal Bibliotecário */}
            <Link to={createPageUrl("BibLogin")}>
              <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 cursor-pointer">
                <div className="w-16 h-16 mb-6 rounded-xl bg-[#C9A227]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8 text-[#C9A227]" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  Portal Bibliotecário
                </h3>
                <p className="text-slate-300">
                  Gerencie o acervo, cadastre irmãos e controle empréstimos
                </p>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
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