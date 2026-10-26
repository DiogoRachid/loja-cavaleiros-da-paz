import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import FotoLeituraPresenca from "@/components/presenca/FotoLeituraPresenca";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import LinhaLeituraPresenca from "@/components/presenca/LinhaLeituraPresenca";

export default function RevisarLeituraPresenca({ leitura, irmaos, podeAprovar, onAprovada }) {
  const [linhas, setLinhas] = useState(leitura.linhas || []), [salvando, setSalvando] = useState(false), [erro, setErro] = useState("");
  const atualizar = (linha) => setLinhas((atuais) => atuais.map((item) => item.id === linha.id ? linha : item));
  const aprovar = async () => { setSalvando(true); setErro(""); try { const { data } = await base44.functions.invoke("lerListaPresenca", { acao: "aprovar", sessao_id: leitura.sessao_id, leitura_id: leitura.id, linhas: linhas.map(({ id, irmao_id, presente }) => ({ id, irmao_id, presente })) }); onAprovada(data.leitura, data.presencas); } catch (e) { setErro(e.response?.data?.error || "Não foi possível aprovar."); } finally { setSalvando(false); } };
  const bloqueada = leitura.status === "Aprovada";
  return <div className="space-y-3 rounded-lg border border-border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><Badge variant={bloqueada ? "default" : "secondary"}>{leitura.status}</Badge><p className="mt-1 text-xs text-muted-foreground">Enviada por {leitura.enviado_por}</p></div><FotoLeituraPresenca sessaoId={leitura.sessao_id} leituraId={leitura.id} /></div>
    {leitura.aviso && <p className="rounded-md border border-border bg-muted p-3 text-sm text-foreground">{leitura.aviso}</p>}
    {!linhas.length && <p className="text-sm text-muted-foreground">Nenhuma linha identificada. Envie uma foto mais nítida da lista.</p>}
    {!bloqueada && <p className="text-sm text-muted-foreground">Sugestões com assinatura e X estão selecionadas. Confira a foto, corrija o cadastro e ajuste as seleções; as demais presenças já registradas serão mantidas.</p>}
    {bloqueada && <p className="text-sm text-muted-foreground">Aprovada por {leitura.aprovado_por} em {new Date(leitura.aprovado_em).toLocaleString("pt-BR")}.</p>}
    <div className="space-y-2">{linhas.map((linha) => <LinhaLeituraPresenca key={linha.id} linha={linha} irmaos={irmaos} onChange={atualizar} bloqueada={bloqueada || !podeAprovar || salvando} />)}</div>
    {!bloqueada && <div><Button onClick={aprovar} disabled={!podeAprovar || salvando || !linhas.some((linha) => linha.presente)}>{salvando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}Aprovar selecionados</Button>{!podeAprovar && <p className="mt-2 text-xs text-muted-foreground">A aprovação exige a conta vinculada ao Chanceler titular ou designado nesta sessão.</p>}</div>}{erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
  </div>;
}