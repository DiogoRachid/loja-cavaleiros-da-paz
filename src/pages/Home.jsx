import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { BookOpen, Users, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setIsAdmin(currentUser.role === "admin");
      }
    } catch (e) {
      console.log("Não autenticado");
    }
    setLoading(false);
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B3A5F] to-[#0D1F33] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#C9A227] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B3A5F] to-[#0D1F33] relative overflow-hidden">
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

        {!user ? (
          /* Login Button */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-[#C9A227] hover:bg-[#A88420] text-[#1B3A5F] font-semibold text-lg px-12 py-6 rounded-xl shadow-2xl"
            >
              Entrar no Sistema
            </Button>
          </motion.div>
        ) : (
          /* Portal Selection */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-3xl"
          >
            <p className="text-center text-slate-300 mb-8">
              Bem-vindo, <span className="text-[#C9A227] font-semibold">{user.full_name}</span>
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Portal do Irmão */}
              <Link to={createPageUrl("IrmaoEmprestimos")}>
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

              {/* Portal Bibliotecário - só aparece para admin */}
              {isAdmin && (
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
              )}
            </div>
          </motion.div>
        )}

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