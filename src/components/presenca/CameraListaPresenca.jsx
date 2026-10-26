import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function CameraListaPresenca({ onFoto, onClose }) {
  const video = useRef(null), stream = useRef(null);
  const [erro, setErro] = useState(""), [pronta, setPronta] = useState(false);
  useEffect(() => {
    let ativo = true;
    const iniciar = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("A câmera não está disponível neste navegador. Utilize Subir foto.");
        const midia = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 2800 }, height: { ideal: 2000 } }, audio: false });
        if (!ativo) { midia.getTracks().forEach((faixa) => faixa.stop()); return; }
        stream.current = midia;
        video.current.srcObject = midia;
      } catch { if (ativo) setErro("Não foi possível acessar a câmera. Libere a permissão do navegador ou utilize Subir foto."); }
    };
    iniciar();
    return () => { ativo = false; stream.current?.getTracks().forEach((faixa) => faixa.stop()); };
  }, []);
  const capturar = () => {
    const canvas = document.createElement("canvas");
    canvas.width = video.current.videoWidth; canvas.height = video.current.videoHeight;
    if (!canvas.width || !canvas.height) return;
    canvas.getContext("2d").drawImage(video.current, 0, 0);
    canvas.toBlob((blob) => { if (blob) { onFoto(new File([blob], "lista-presenca.jpg", { type: "image/jpeg" })); onClose(); } }, "image/jpeg", 0.95);
  };
  return <Dialog open onOpenChange={(aberto) => { if (!aberto) onClose(); }}><DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>Fotografar lista de presença</DialogTitle><DialogDescription>Enquadre os nomes, as assinaturas e a coluna de X, sem cortar as linhas.</DialogDescription></DialogHeader><video ref={video} autoPlay muted playsInline onLoadedData={() => setPronta(true)} className="max-h-[60vh] w-full rounded-md bg-muted" />{erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}<Button onClick={capturar} disabled={!pronta}><Camera className="mr-2 h-4 w-4" />Capturar foto</Button></DialogContent></Dialog>;
}