import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { BookOpen, User, Lock, ArrowLeft, Loader2, AlertTriangle, Eye, EyeOff, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion, useReducedMotion } from "framer-motion";
import MasonicBackdrop from "@/components/landing/MasonicBackdrop";
import { LOGO_LOJA_PADRAO } from "@/lib/relatorio";

export default function IrmaoLogin() {
  const reduced = useReducedMotion();
  const [numeroGlp, setNumeroGlp] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Estado para recuperar senha
  const [recuperarSenha, setRecuperarSenha] = useState(false);
  const [glpRecuperar, setGlpRecuperar] = useState("");
  const [msgRecuperar, setMsgRecuperar] = useState("");

  const handleRecuperarSenha = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMsgRecuperar("");
    try {
      const irmaos = await db.Irmao.filter({ numero_glp: glpRecuperar.trim(), ativo: true });
      if (irmaos.length === 0) {
        setError("Número GLP não encontrado.");
        setLoading(false);
        return;
      }
      const irmao = irmaos[0];
      await db.Irmao.update(irmao.id, { senha: irmao.numero_glp, primeiro_acesso: true });
      setMsgRecuperar(`Senha redefinida com sucesso! Use o número GLP (${irmao.numero_glp}) como senha.`);
    } catch (err) {
      setError("Erro ao redefinir senha. Tente novamente.");
    }
    setLoading(false);
  };

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
      const irmaos = await db.Irmao.filter({ numero_glp: numeroGlp.trim(), ativo: true });
      
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

      // Registrar log de acesso
      await db.LogAcesso.create({
        irmao_id: irmao.id,
        irmao_nome: irmao.nome_completo,
        irmao_numero_glp: irmao.numero_glp,
        data_acesso: new Date().toISOString(),
        tipo_acesso: "Login"
      });

      // Login normal: mantém somente o portal escolhido nesta sessão.
      sessionStorage.removeItem("admin_auth");
      sessionStorage.removeItem("admin_data");
      sessionStorage.removeItem("admin_cargo");
      sessionStorage.removeItem("admin_substituindo");
      sessionStorage.removeItem("bib_auth");
      sessionStorage.removeItem("bib_data");
      sessionStorage.removeItem("bib_auth_time");
      sessionStorage.setItem("irmao_auth", "true");
      sessionStorage.setItem("irmao_data", JSON.stringify(irmao));
      navigate(createPageUrl("IrmaoEmprestimos"));
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
      await db.Irmao.update(irmaoLogado.id, {
        senha: novaSenha,
        primeiro_acesso: false
      });

      // Registrar log de acesso
      await db.LogAcesso.create({
        irmao_id: irmaoLogado.id,
        irmao_nome: irmaoLogado.nome_completo,
        irmao_numero_glp: irmaoLogado.numero_glp,
        data_acesso: new Date().toISOString(),
        tipo_acesso: "Login"
      });

      const irmaoAtualizado = { ...irmaoLogado, senha: novaSenha, primeiro_acesso: false };
      sessionStorage.removeItem("admin_auth");
      sessionStorage.removeItem("admin_data");
      sessionStorage.removeItem("admin_cargo");
      sessionStorage.removeItem("admin_substituindo");
      sessionStorage.removeItem("bib_auth");
      sessionStorage.removeItem("bib_data");
      sessionStorage.removeItem("bib_auth_time");
      sessionStorage.setItem("irmao_auth", "true");
      sessionStorage.setItem("irmao_data", JSON.stringify(irmaoAtualizado));
      navigate(createPageUrl("IrmaoEmprestimos"));
    } catch (err) {
      console.error("Erro:", err);
      setError("Erro ao atualizar senha. Tente novamente.");
    }

    setLoading(false);
  };

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-landing-deep p-6 text-primary-foreground">
      <MasonicBackdrop />

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg py-10"
      >
        <Card className="border border-lodge-gold/30 bg-landing-surface/95 text-primary-foreground shadow-2xl backdrop-blur-sm">
          <CardHeader className="pb-2 text-center">
            <img src={LOGO_LOJA_PADRAO} alt="Brasão da Loja Cavaleiros da Paz nº25" className="mx-auto mb-2 h-28 w-28 object-contain sm:h-32 sm:w-32" />
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-lodge-gold sm:text-base">Cavaleiros da Paz nº25</p>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-lodge-gold/50 bg-lodge-gold/10">
              <BookOpen className="h-7 w-7 text-lodge-gold" />
            </div>
            <CardTitle className="text-2xl text-primary-foreground">Portal do Irmão</CardTitle>
            <CardDescription className="text-slate-300">
              {trocaSenha 
                ? "Crie uma nova senha para continuar" 
                : "Digite seu número GLP e senha"}
            </CardDescription>
          </CardHeader>
          <CardContent className="[&_label]:text-slate-200 [&_input]:border-lodge-gold/30 [&_input]:bg-landing-deep/70 [&_input]:text-primary-foreground [&_input]:placeholder:text-slate-400 [&_input]:focus-visible:ring-lodge-gold">
            {recuperarSenha ? (
              <form onSubmit={handleRecuperarSenha} className="space-y-4">
                <p className="text-sm text-slate-300">Informe seu número GLP. A senha será redefinida para o número GLP.</p>
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}
                  </div>
                )}
                {msgRecuperar && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">{msgRecuperar}</div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="glpRecuperar">Número GLP</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="glpRecuperar"
                      value={glpRecuperar}
                      onChange={(e) => setGlpRecuperar(e.target.value)}
                      placeholder="Seu número GLP"
                      className="pl-10"
                      autoFocus
                      required
                    />
                  </div>
                </div>
                {!msgRecuperar && (
                  <Button type="submit" className="w-full bg-lodge-gold font-semibold text-landing-deep hover:bg-lodge-gold/80" disabled={loading || !glpRecuperar}>
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Redefinindo...</> : "Redefinir Senha"}
                  </Button>
                )}
                <Button type="button" variant="outline" className="w-full border-lodge-gold/40 bg-transparent text-primary-foreground hover:bg-landing-bright/50 hover:text-primary-foreground" onClick={() => { setRecuperarSenha(false); setError(""); setMsgRecuperar(""); }}>
                  Voltar ao login
                </Button>
              </form>
            ) : !trocaSenha ? (
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
                  <p className="text-xs text-slate-300">No primeiro acesso, use seu número GLP como senha</p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-lodge-gold font-semibold text-landing-deep hover:bg-lodge-gold/80"
                  disabled={loading || !numeroGlp || !senha}
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verificando...</>
                  ) : "Entrar"}
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
                  className="w-full bg-lodge-gold font-semibold text-landing-deep hover:bg-lodge-gold/80"
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

            <div className="mt-6 pt-4 border-t space-y-2 text-center">
              {!trocaSenha && !recuperarSenha && (
                <button
                  type="button"
                  onClick={() => { setRecuperarSenha(true); setError(""); }}
                  className="flex w-full items-center justify-center gap-1 text-sm text-lodge-gold hover:text-primary-foreground"
                >
                  <RotateCcw className="w-4 h-4" />
                  Recuperar senha
                </button>
              )}
              <Link 
                to={createPageUrl("Home")}
                className="flex items-center justify-center gap-1 text-sm text-slate-300 hover:text-lodge-gold"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o início
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-slate-300">
          Loja Cavaleiros da Paz nº25
        </p>
      </motion.div>
    </div>
  );
}