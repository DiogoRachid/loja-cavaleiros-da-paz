import { useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function FotoLeituraPresenca({ sessaoId, leituraId }) {
  const [aberta, setAberta] = useState(false), [imagem, setImagem] = useState(""), [loading, setLoading] = useState(false), [erro, setErro] = useState("");
  const abrir = async () => {
    setAberta(true); setErro(""); setLoading(true);
    try { const { data } = await base44.functions.invoke("lerListaPresenca", { acao: "imagem", sessao_id: sessaoId, leitura_id: leituraId }); setImagem(data.imagem); }
    catch (e) { setErro(e.response?.data?.error || "Não foi possível abrir a foto."); }
    finally { setLoading(false); }
  };
  return <><Button size="sm" variant="outline" onClick={abrir}><Eye className="mr-2 h-4 w-4" />Ver foto</Button><Dialog open={aberta} onOpenChange={setAberta}><DialogContent className="flex max-h-[90vh] max-w-5xl flex-col"><DialogHeader><DialogTitle>Lista de presença fotografada</DialogTitle><DialogDescription>Confira a assinatura e o X de cada linha antes da aprovação.</DialogDescription></DialogHeader><div className="overflow-auto">{loading && <Loader2 className="mx-auto h-6 w-6 animate-spin" />}{erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}{!loading && imagem && <img src={imagem} alt="Foto original da lista de presença" className="w-full" />}</div></DialogContent></Dialog></>;
}