import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import EnviarListaPresenca from "@/components/presenca/EnviarListaPresenca";
import RevisarLeituraPresenca from "@/components/presenca/RevisarLeituraPresenca";

export default function LeituraFotoPresenca({ sessaoId, irmaos, onAprovada }) {
  const [leituras, setLeituras] = useState([]), [podeAprovar, setPodeAprovar] = useState(false), [loading, setLoading] = useState(true), [erro, setErro] = useState("");
  useEffect(() => { let ativo = true; setLoading(true); setErro(""); base44.functions.invoke("lerListaPresenca", { acao: "listar", sessao_id: sessaoId }).then(({ data }) => { if (ativo) { setLeituras((data.leituras || []).map((item) => ({ ...item, sessao_id: sessaoId }))); setPodeAprovar(data.pode_aprovar); } }).catch((e) => ativo && setErro(e.response?.data?.error || "Não foi possível carregar as leituras." )).finally(() => ativo && setLoading(false)); return () => { ativo = false; }; }, [sessaoId]);
  const adicionar = (leitura, permissao) => { setLeituras((atuais) => [{ ...leitura, sessao_id: sessaoId }, ...atuais]); setPodeAprovar(permissao); };
  const aprovada = (leitura, registros) => { setLeituras((atuais) => atuais.map((item) => item.id === leitura.id ? { ...leitura, sessao_id: sessaoId } : item)); onAprovada(registros); };
  return <section className="space-y-4"><EnviarListaPresenca sessaoId={sessaoId} onLeitura={adicionar} />{loading && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Carregando leituras...</p>}{erro && <div className="space-y-2"><p role="alert" className="text-sm text-destructive">{erro}</p><Button variant="outline" onClick={() => { const destino = new URL(window.location.href); destino.searchParams.set("sessao", sessaoId); base44.auth.redirectToLogin(destino.toString()); }}>Autenticar minha conta</Button><p className="text-xs text-muted-foreground">Use o mesmo e-mail do cadastro de oficial. A autenticação é necessária para acessar as fotos privadas e validar a aprovação.</p></div>}{leituras.map((leitura) => <RevisarLeituraPresenca key={leitura.id} leitura={leitura} irmaos={irmaos} podeAprovar={podeAprovar} onAprovada={aprovada} />)}</section>;
}