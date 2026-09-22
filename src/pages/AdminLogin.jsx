import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { db } from "@/api/db";
import { buscarSubstituicaoAtiva } from "@/lib/substituicao";
import { Lock, User, ArrowLeft, Library } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import MasonicBackdrop from "@/components/landing/MasonicBackdrop";
import EsquadroCompasso from "@/components/landing/EsquadroCompasso";
import { LOGO_LOJA_PADRAO } from "@/lib/relatorio";
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
  const reduced = useReducedMotion();
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
        sessionStorage.removeItem("admin_auth");
        sessionStorage.removeItem("admin_data");
        sessionStorage.removeItem("admin_cargo");
        sessionStorage.removeItem("admin_substituindo");
        sessionStorage.removeItem("irmao_auth");
        sessionStorage.removeItem("irmao_data");
        sessionStorage.setItem("bib_auth", "true");
        sessionStorage.setItem("bib_data", JSON.stringify({ nome: irmao.nome_completo, ...irmao }));
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
        sessionStorage.removeItem("bib_auth");
        sessionStorage.removeItem("bib_data");
        sessionStorage.removeItem("bib_auth_time");
        sessionStorage.removeItem("irmao_auth");
        sessionStorage.removeItem("irmao_data");
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
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-landing-deep p-6 text-primary-foreground">
      <MasonicBackdrop />
      <div className="relative z-10 w-full max-w-lg py-10">
        <Link to={createPageUrl("Home")} className="flex items-center gap-2 text-slate-300 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao início
        </Link>

        <motion.div initial={reduced ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} className="rounded-2xl border border-lodge-gold/30 bg-landing-surface/95 p-7 shadow-2xl backdrop-blur-sm sm:p-9">
          <div className="text-center mb-8">
            <img src={LOGO_LOJA_PADRAO} alt="Brasão da Loja Cavaleiros da Paz nº25" className="mx-auto mb-2 h-28 w-28 object-contain sm:h-32 sm:w-32" />
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-lodge-gold sm:text-base">Cavaleiros da Paz nº25</p>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-lodge-gold/50 bg-lodge-gold/10 text-lodge-gold">
              {isBibliotecario ? <Library className="h-7 w-7" /> : <EsquadroCompasso className="h-10 w-10" />}
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
                <SelectTrigger className="border-lodge-gold/30 bg-landing-deep/70 text-white focus:ring-lodge-gold [&>svg]:text-lodge-gold">
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
                      className="portal-login-input border-lodge-gold/30 bg-white pl-10 text-slate-900 placeholder:text-slate-500 focus-visible:ring-lodge-gold"
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
                      className="portal-login-input border-lodge-gold/30 bg-white pl-10 text-slate-900 placeholder:text-slate-500 focus-visible:ring-lodge-gold"
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
              className="w-full bg-lodge-gold font-semibold text-landing-deep hover:bg-lodge-gold/80"
            >
              {loading ? "Verificando..." : "Entrar"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}