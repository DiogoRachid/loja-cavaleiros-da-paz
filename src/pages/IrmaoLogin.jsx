import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { BookOpen, User, Lock, ArrowLeft, Loader2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function IrmaoLogin() {
  const [numeroGlp, setNumeroGlp] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Estado para troca de senha
  const [trocaSenha, setTrocaSenha] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [irmaoLogado, setIrmaoLogado] = useState(null);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Buscar irmão pelo número GLP
      const irmaos = await base44.entities.Irmao.filter({ numero_glp: numeroGlp.trim(), ativo: true });
      
      if (irmaos.length === 0) {
        setError("Número GLP não encontrado. Verifique com o bibliotecário.");
        setLoading(false);
        return;
      }

      const irmao = irmaos[0];
      
      // Verificar senha (se não tem senha, usa o número GLP como senha inicial)
      const senhaCorreta = irmao.senha || irmao.numero_glp;
      
      if (senha !== senhaCorreta) {
        setError("Senha incorreta.");
        setLoading(false);
        return;
      }

      // Se é primeiro acesso ou não tem senha personalizada, pedir troca
      if (irmao.primeiro_acesso !== false || !irmao.senha) {
        setIrmaoLogado(irmao);
        setTrocaSenha(true);
        setLoading(false);
        return;
      }

      // Registrar log de acesso
      await base44.entities.LogAcesso.create({
        irmao_id: irmao.id,
        irmao_nome: irmao.nome_completo,
        irmao_numero_glp: irmao.numero_glp,
        data_acesso: new Date().toISOString(),
        tipo_acesso: "Login"
      });

      // Login normal
      sessionStorage.setItem("irmao_auth", "true");
      sessionStorage.setItem("irmao_data", JSON.stringify(irmao));
      navigate(createPageUrl("IrmaoPortal"));
    } catch (err) {
      console.error("Erro:", err);
      setError("Erro ao verificar cadastro. Tente novamente.");
    }
    
    setLoading(false);
  };

  const handleTrocaSenha = async (e) => {
    e.preventDefault();
    setError("");

    if (novaSenha.length < 4) {
      setError("A senha deve ter pelo menos 4 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      await base44.entities.Irmao.update(irmaoLogado.id, {
        senha: novaSenha,
        primeiro_acesso: false
      });

      // Registrar log de acesso
      await base44.entities.LogAcesso.create({
        irmao_id: irmaoLogado.id,
        irmao_nome: irmaoLogado.nome_completo,
        irmao_numero_glp: irmaoLogado.numero_glp,
        data_acesso: new Date().toISOString(),
        tipo_acesso: "Login"
      });

      const irmaoAtualizado = { ...irmaoLogado, senha: novaSenha, primeiro_acesso: false };
      sessionStorage.setItem("irmao_auth", "true");
      sessionStorage.setItem("irmao_data", JSON.stringify(irmaoAtualizado));
      navigate(createPageUrl("IrmaoPortal"));
    } catch (err) {
      console.error("Erro:", err);
      setError("Erro ao atualizar senha. Tente novamente.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B3A5F] to-[#0D1F33] flex items-center justify-center p-6">
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
              <BookOpen className="w-8 h-8 text-[#1B3A5F]" />
            </div>
            <CardTitle className="text-2xl text-[#1B3A5F]">Portal do Irmão</CardTitle>
            <CardDescription>
              {trocaSenha 
                ? "Crie uma nova senha para continuar" 
                : "Digite seu número GLP e senha"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!trocaSenha ? (
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
                  <Label htmlFor="glp">Número GLP</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="glp"
                      type="text"
                      value={numeroGlp}
                      onChange={(e) => setNumeroGlp(e.target.value)}
                      placeholder="Seu número de cadastro GLP"
                      className="pl-10"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senha">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="senha"
                      type={showPassword ? "text" : "password"}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Sua senha"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">No primeiro acesso, use seu número GLP como senha</p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#1B3A5F] hover:bg-[#15304d]"
                  disabled={loading || !numeroGlp || !senha}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleTrocaSenha} className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                  Olá, {irmaoLogado?.nome_completo}! Por segurança, crie uma nova senha.
                </div>

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
                  <Label htmlFor="novaSenha">Nova Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="novaSenha"
                      type={showPassword ? "text" : "password"}
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder="Digite sua nova senha"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="confirmarSenha"
                      type={showPassword ? "text" : "password"}
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      placeholder="Confirme sua nova senha"
                      className="pl-10 pr-10"
                      required
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
                  disabled={loading || !novaSenha || !confirmarSenha}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar e Entrar"
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 pt-4 border-t text-center">
              <Link 
                to={createPageUrl("Home")}
                className="text-sm text-slate-500 hover:text-[#1B3A5F] flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o início
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-slate-400 text-xs mt-6">
          Loja Cavaleiros da Paz nº25
        </p>
      </motion.div>
    </div>
  );
}