import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Lock, Eye, EyeOff, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function IrmaoConfiguracoes() {
  const [irmao, setIrmao] = useState(null);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    const irmaoAuth = sessionStorage.getItem("irmao_auth");
    const irmaoData = sessionStorage.getItem("irmao_data");
    if (irmaoAuth !== "true" || !irmaoData) {
      window.location.href = createPageUrl("IrmaoLogin");
      return;
    }
    setIrmao(JSON.parse(irmaoData));
  }, []);

  const handleSalvar = async (e) => {
    e.preventDefault();
    setError("");
    setSucesso(false);

    const senhaCorreta = irmao.senha || irmao.numero_glp;
    if (senhaAtual !== senhaCorreta) {
      setError("Senha atual incorreta.");
      return;
    }

    if (novaSenha.length < 4) {
      setError("A nova senha deve ter pelo menos 4 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    await base44.entities.Irmao.update(irmao.id, { senha: novaSenha, primeiro_acesso: false });
    const irmaoAtualizado = { ...irmao, senha: novaSenha, primeiro_acesso: false };
    sessionStorage.setItem("irmao_data", JSON.stringify(irmaoAtualizado));
    setIrmao(irmaoAtualizado);
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");
    setSucesso(true);
    toast.success("Senha alterada com sucesso!");
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Configurações</h1>
        <p className="text-slate-500">Altere sua senha de acesso</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#1B3A5F]" />
            Alterar Senha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSalvar} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}
            {sucesso && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />Senha alterada com sucesso!
              </div>
            )}

            <div className="space-y-2">
              <Label>Senha Atual</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type={showSenhaAtual ? "text" : "password"}
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  placeholder="Sua senha atual"
                  className="pl-10 pr-10"
                  required
                />
                <button type="button" onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showSenhaAtual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type={showNovaSenha ? "text" : "password"}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Nova senha (mín. 4 caracteres)"
                  className="pl-10 pr-10"
                  required
                />
                <button type="button" onClick={() => setShowNovaSenha(!showNovaSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showNovaSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Confirmar Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type={showNovaSenha ? "text" : "password"}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Confirme a nova senha"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#1B3A5F] hover:bg-[#15304d]"
              disabled={loading || !senhaAtual || !novaSenha || !confirmarSenha}
            >
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : "Salvar Nova Senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}