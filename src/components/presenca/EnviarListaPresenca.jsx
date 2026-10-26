import { useRef, useState } from "react";
import { Camera, ImageUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import prepararFotoPresenca from "@/components/presenca/prepararFotoPresenca";
import CameraListaPresenca from "@/components/presenca/CameraListaPresenca";

export default function EnviarListaPresenca({ sessaoId, onLeitura }) {
  const input = useRef(null);
  const [analisando, setAnalisando] = useState(false);
  const [erro, setErro] = useState("");
  const [cameraAberta, setCameraAberta] = useState(false);
  const enviar = async (arquivo) => {
    if (!arquivo) return;
    setAnalisando(true); setErro("");
    try {
      const imagem = await prepararFotoPresenca(arquivo);
      const { data } = await base44.functions.invoke("lerListaPresenca", { acao: "processar", sessao_id: sessaoId, imagem });
      onLeitura(data.leitura, data.pode_aprovar);
      input.current.value = "";
    } catch (e) { setErro(e.response?.data?.error || e.message || "Não foi possível analisar a foto."); }
    finally { setAnalisando(false); }
  };
  return <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 space-y-3">
    <div><h3 className="font-semibold text-foreground">Foto da lista assinada</h3><p className="text-sm text-muted-foreground">Fotografe uma página por vez, inteira e bem iluminada. A IA procura assinatura e X na mesma linha; nada é registrado sem a aprovação do Chanceler.</p></div>
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => enviar(e.target.files?.[0])} />
    <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => input.current?.click()} disabled={analisando}>{analisando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageUp className="mr-2 h-4 w-4" />}{analisando ? "Analisando a lista..." : "Subir foto"}</Button><Button type="button" variant="outline" onClick={() => setCameraAberta(true)} disabled={analisando}><Camera className="mr-2 h-4 w-4" />Tirar foto</Button></div>
    {cameraAberta && <CameraListaPresenca onFoto={enviar} onClose={() => setCameraAberta(false)} />}
    {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
    <p className="flex items-center gap-1 text-xs text-muted-foreground"><ImageUp className="h-3.5 w-3.5" />A foto fica privada e é usada somente para conferência desta sessão.</p>
  </div>;
}