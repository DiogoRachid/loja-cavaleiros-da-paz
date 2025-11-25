import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Shield, Lock, Eye, EyeOff, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function BibLogin() {
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  // Senha do bibliotecário (em produção, isso deveria vir de uma configuração segura)
  const SENHA_BIBLIOTECARIO = "CavPaz25Bib";

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      // Verificar se já está autenticado como bibliotecário
      const bibAuth = sessionStorage.getItem("bib_auth");
      if (bibAuth === "true") {
        navigate(createPageUrl("BibDashboard"));
        return;
      }

      // Verificar se o usuário é admin
      const user = await base44.auth.me();
      if (user.role !== "admin") {
        navigate(createPageUrl("Home"));
        return;
      }
    } catch (e) {
      navigate(createPageUrl("Home"));
    }
    setCheckingAuth(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simular delay de verificação
    await new Promise(resolve => setTimeout(resolve, 500));

    if (senha === SENHA_BIBLIOTECARIO) {
      // Salvar autenticação na sessão
      sessionStorage.setItem("bib_auth", "true");
      sessionStorage.setItem("bib_auth_time", Date.now().toString());
      navigate(createPageUrl("BibDashboard"));
    } else {
      setError("Senha incorreta. Tente novamente.");
    }

    setLoading(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B3A5F] to-[#0D1F33] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C9A227] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B3A5F] to-[#0D1F33] flex items-center justify-center p-6">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#C9A227]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C9A227]/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#C9A227] to-[#8B7019] flex items-center justify-center">
              <Shield className="w-8 h-8 text-[#1B3A5F]" />
            </div>
            <CardTitle className="text-2xl text-[#1B3A5F]">Portal Bibliotecário</CardTitle>
            <CardDescription>
              Digite a senha de acesso para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="senha">Senha do Bibliotecário</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite a senha"
                    className="pl-10 pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#1B3A5F] hover:bg-[#15304d]"
                disabled={loading || !senha}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Acessar Portal"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t text-center">
              <a 
                href={createPageUrl("Home")}
                className="text-sm text-slate-500 hover:text-[#1B3A5F]"
              >
                ← Voltar para o início
              </a>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-slate-400 text-xs mt-6">
          Loja Cavaleiros da Paz nº25 • Acesso Restrito
        </p>
      </motion.div>
    </div>
  );
}