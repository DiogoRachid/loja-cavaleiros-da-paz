import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Share2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { notificarWhatsApp } from "@/lib/whatsapp";
import PreviaCompartilhamento from "@/components/biblioteca/PreviaCompartilhamento";

export default function ShareModal({ open, onClose, tipoAcervo = "digital", itemId, ...obra }) {
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [login, setLogin] = useState(false);
  const emCurso = useRef(false);
  useEffect(() => { setEnviado(false); setErro(""); setLogin(false); }, [open, itemId]);
  const compartilhar = async () => {
    if (emCurso.current || enviado) return;
    emCurso.current = true; setEnviando(true); setErro(""); setLogin(false);
    try {
      await notificarWhatsApp({ tipoAcervo, itemId });
      setEnviado(true);
    } catch (error) {
      setErro(error.response?.data?.error || error.message || "Não foi possível enviar a divulgação.");
      setLogin((error.response?.status || error.status) === 401);
    } finally { emCurso.current = false; setEnviando(false); }
  };
  return <Dialog open={open} onOpenChange={valor => { if (!valor && !emCurso.current) onClose(); }}>
    <DialogContent className="max-h-[90vh] max-w-sm overflow-y-auto">
      <DialogHeader><DialogTitle className="flex items-center gap-2"><Share2 className="h-5 w-5 text-primary" /> Compartilhar</DialogTitle></DialogHeader>
      <div className="space-y-4">
        <PreviaCompartilhamento {...obra} tipoAcervo={tipoAcervo} itemId={itemId} />
        <p className="text-center text-xs text-muted-foreground">Envia esta mensagem e o link de acesso ao grupo da Loja configurado na Evolution API. A capa não é anexada.</p>
        {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
        {login ? <Button className="w-full" onClick={() => base44.auth.redirectToLogin(window.location.href)}>Entrar para compartilhar</Button> :
          <Button className="w-full" onClick={compartilhar} disabled={enviando || enviado || !itemId}>
            {enviando ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</> : enviado ? <><Check className="mr-2 h-4 w-4" /> Envio confirmado</> : <><Share2 className="mr-2 h-4 w-4" /> Compartilhar no grupo</>}
          </Button>}
        {enviado && <p role="status" className="text-center text-sm text-muted-foreground">Mensagem aceita pela Evolution para envio ao grupo da Loja.</p>}
      </div>
    </DialogContent>
  </Dialog>;
}