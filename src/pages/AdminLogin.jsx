import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { db } from "@/api/db";
import { buscarSubstituicaoAtiva } from "@/lib/substituicao";
import { Crown, Lock, User, ArrowLeft, Library } from "lucide-react";
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
  "Secretário de Ação Social",
  "Tesoureiro",
  "Chanceler",
  "Bibliotecário",
  "Mestre de Cerimônias",
  "Mestre de Harmonia",
  "Hospitaleiro",
  "Primeiro Diácono",
  "Segundo Diácono",
];

export default function AdminLogin() {
  const navigate = useNavigate();
  const [cargo, setCargo] = useState("");
  const [numeroGlp, setNumeroGlp] = useState("");
  const [senha, setSenha] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const isBibliotecario = cargo === "Bibliotecário";

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!cargo) { setErro("Selecione um cargo."); return; }
    setLoading(true);
    setErro("");

    try {
      if (isBibliotecario) {
        // Login via entidade Irmao com cargo Bibliotecário
        if (!numeroGlp || !senha) { setErro("Preencha todos os campos."); setLoading(false); return; }
        const irmaos = await db.Irmao.filter({ numero_glp: numeroGlp, ativo: true });
        if (!irmaos || irmaos.length === 0) {
          setErro("Número GLP não encontrado ou irmão inativo.");
          setLoading(false);
          return;
        }
        const irmao = irmaos[0];
        if (irmao.cargo !== "Bibliotecário") {
          setErro("Este irmão não possui cargo de Bibliotecário.");
          setLoading(false);
          return;
        }
        const senhaValida = irmao.senha ? irmao.senha === senha : irmao.numero_glp === senha;
        if (!senhaValida) {
          setErro("Senha incorreta.");
          setLoading(false);
          return;
        }
        sessionStorage.setItem("bib_auth", "true");
        sessionStorage.setItem("bib_data", JSON.stringify({ nome: irmao.nome_completo, ...irmao }));
        sessionStorage.setItem("admin_cargo", "Bibliotecário");
        navigate(createPageUrl("BibDashboard"));
      } else {
        // Login via entidade Irmao
        if (!numeroGlp || !senha) { setErro("Preencha todos os campos."); setLoading(false); return; }
        const irmaos = await db.Irmao.filter({ numero_glp: numeroGlp, ativo: true });
        if (!irmaos || irmaos.length === 0) {
          setErro("Número GLP não encontrado ou irmão inativo.");
          setLoading(false);
          return;
        }
        const irmao = irmaos[0];
        let sessaoSubstituicao = null;
        if (irmao.cargo !== cargo) {
          sessaoSubstituicao = await buscarSubstituicaoAtiva(cargo, irmao.id);
          if (!sessaoSubstituicao) {
            setErro("Cargo informado não corresponde ao cadastro.");
            setLoading(false);
            return;
          }
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
        if (sessaoSubstituicao) {
          sessionStorage.setItem("admin_substituindo", JSON.stringify({ cargo, sessao_id: sessaoSubstituicao.id, sessao_data: sessaoSubstituicao.data }));
        } else {
          sessionStorage.removeItem("admin_substituindo");
        }
        const cargoRoutes = {
          "Venerável Mestre": "AdminVM",
          "Primeiro Vigilante": "AdminVigilantes",
          "Segundo Vigilante": "AdminVigilantes",
          "Mestre de Cerimônias": "AdminMC",
          "Mestre de Harmonia": "AdminMestreHarmonia",
          "Tesoureiro": "AdminTesoureiro",
          "Secretário": "AdminSecretario",
          "Chanceler": "AdminChanceler",
          "Orador": "AdminOrador",
          "Secretário de Ação Social": "AdminAcaoSocial",
          "Hospitaleiro": "AdminHospitaleiro",
        };
        const destino = cargoRoutes[cargo] || "AdminVM";
        navigate(createPageUrl(destino));
      }
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
              {isBibliotecario ? <Library className="w-8 h-8 text-[#C9A227]" /> : <Crown className="w-8 h-8 text-[#C9A227]" />}
            </div>
            <h1 className="text-2xl font-bold text-white">
              {isBibliotecario ? "Portal Bibliotecário" : "Portal Administrativo"}
            </h1>
            <p className="text-slate-300 text-sm mt-1">Acesso exclusivo para oficiais</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-slate-200">Cargo</Label>
              <Select value={cargo} onValueChange={(v) => { setCargo(v); setErro(""); }}>
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

            {cargo ? (
              <>
                <div className="space-y-2">
                  <Label className="text-slate-200">Número GLP</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={numeroGlp}
                      onChange={e => setNumeroGlp(e.target.value)}
                      placeholder="Seu número de cadastro GLP"
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
              </>
            ) : null}

            {erro && (
              <div className="bg-red-500/20 border border-red-500/40 rounded-lg px-4 py-3 text-red-200 text-sm">
                {erro}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !cargo}
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