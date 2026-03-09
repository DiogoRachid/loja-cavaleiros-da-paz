import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Crown, Lock, User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CARGOS_ADMIN = [
  "Venerável Mestre",
  "Primeiro Vigilante",
  "Segundo Vigilante",
  "Orador",
  "Secretário",
  "Tesoureiro",
  "Chanceler",
  "Mestre de Cerimônias",
  "Primeiro Diácono",
  "Segundo Diácono",
  "Bibliotecário",
];

export default function AdminLogin() {
  const navigate = useNavigate();
  const [cargo, setCargo] = useState("");
  const [numeroGlp, setNumeroGlp] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!cargo || !numeroGlp || !senha) {
      setErro("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    setErro("");

    try {
      const irmaos = await base44.entities.Irmao.filter({ numero_glp: numeroGlp, ativo: true });
      if (!irmaos || irmaos.length === 0) {
        setErro("Número GLP não encontrado ou irmão inativo.");
        setLoading(false);
        return;
      }

      const irmao = irmaos[0];

      if (irmao.cargo !== cargo) {
        setErro("Cargo informado não corresponde ao cadastro.");
        setLoading(false);
        return;
      }

      const senhaValida = irmao.senha ? irmao.senha === senha : irmao.numero_glp === senha;
      if (!senhaValida) {
        setErro("Senha incorreta.");
        setLoading(false);
        return;
      }

      sessionStorage.setItem("admin_auth", "true");
      sessionStorage.setItem("admin_data", JSON.stringify(irmao));
      sessionStorage.setItem("admin_cargo", cargo);

      // Redirecionar conforme o cargo
      const cargoRoutes = {
        "Venerável Mestre": "AdminVM",
        "Mestre de Cerimônias": "AdminMC",
        "Tesoureiro": "AdminTesoureiro",
        "Secretário": "AdminSecretario",
        "Chanceler": "AdminChanceler",
        "Bibliotecário": "BibDashboard",
      };

      const destino = cargoRoutes[cargo] || "AdminVM";
      navigate(createPageUrl(destino));
    } catch (err) {
      setErro("Erro ao realizar login. Tente novamente.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B3A5F] to-[#0D1F33] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to={createPageUrl("Home")} className="flex items-center gap-2 text-slate-300 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao início
        </Link>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#C9A227]/20 flex items-center justify-center">
              <Crown className="w-8 h-8 text-[#C9A227]" />
            </div>
            <h1 className="text-2xl font-bold text-white">Portal Administrativo</h1>
            <p className="text-slate-300 text-sm mt-1">Acesso exclusivo para oficiais</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-slate-200">Cargo</Label>
              <Select value={cargo} onValueChange={setCargo}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Selecione seu cargo" />
                </SelectTrigger>
                <SelectContent>
                  {CARGOS_ADMIN.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">CIM</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={cim}
                  onChange={e => setCim(e.target.value)}
                  placeholder="Seu número CIM"
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="password"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="Sua senha"
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            {erro && (
              <div className="bg-red-500/20 border border-red-500/40 rounded-lg px-4 py-3 text-red-200 text-sm">
                {erro}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A227] hover:bg-[#8B7019] text-[#1B3A5F] font-semibold"
            >
              {loading ? "Verificando..." : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}