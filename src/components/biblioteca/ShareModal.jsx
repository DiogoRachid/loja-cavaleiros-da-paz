import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Copy, Check, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const grauEmoji = {
  "Aprendiz": "🔵",
  "Companheiro": "🟡",
  "Mestre": "🔴"
};

const tipoEmoji = {
  "digital": "📄",
  "fisico": "📚"
};

const tipoLabel = {
  "digital": "Novo documento disponível no acervo digital!",
  "fisico": "Novo item disponível no acervo físico!"
};

export default function ShareModal({ open, onClose, titulo, capa, tipo, autor, grau, tipoAcervo = "digital", itemId }) {
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const buildMessage = () => {
    const emoji = tipoEmoji[tipoAcervo] || "📄";
    const header = tipoLabel[tipoAcervo] || tipoLabel["digital"];
    const grauStr = grau ? `${grauEmoji[grau] || ""} ${grau}` : "—";

    let msg = `${emoji} ${header}\n\n`;
    if (tipo) msg += `Tipo: ${tipo}\n`;
    msg += `Título: ${titulo || "—"}\n`;
    if (autor) msg += `Autor: ${autor}\n`;
    msg += `Grau mínimo: ${grauStr}\n`;
    const link = itemId
      ? `https://biblioteca-cavaleiros.base44.app/acervo-publico?id=${itemId}&tipo=${tipoAcervo}`
      : `https://biblioteca-cavaleiros.base44.app/`;
    msg += `\nLoja Cavaleiros da Paz nº25\n${link}`;
    return msg;
  };

  const handleShare = async () => {
    setSharing(true);
    const message = buildMessage();

    // Tenta Web Share API com imagem (funciona bem em mobile)
    if (navigator.share && capa) {
      try {
        const response = await fetch(capa);
        const blob = await response.blob();
        const ext = blob.type.includes("png") ? "png" : "jpg";
        const file = new File([blob], `capa.${ext}`, { type: blob.type });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text: message });
          setSharing(false);
          return;
        }
      } catch (e) {
        // Fallback abaixo
      }
    }

    // Tenta Web Share API só com texto
    if (navigator.share) {
      try {
        await navigator.share({ text: message });
        setSharing(false);
        return;
      } catch (e) {
        // Usuário cancelou ou erro — fallback
      }
    }

    // Fallback desktop: copia texto + abre imagem
    await navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success("Mensagem copiada! Salve a capa acima para enviar junto.");
    if (capa) window.open(capa, "_blank");
    setTimeout(() => setCopied(false), 3000);

    setSharing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#1B3A5F]" />
            Compartilhar
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Capa */}
          <div className="flex flex-col items-center gap-2">
            {capa ? (
              <>
                <img
                  src={capa}
                  alt={titulo}
                  className="w-32 h-44 object-cover rounded-xl shadow-md"
                />
                <button
                  className="text-xs text-[#1B3A5F] underline hover:text-[#C9A227]"
                  onClick={() => window.open(capa, "_blank")}
                >
                  Abrir capa separadamente
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center w-32 h-44 bg-slate-100 rounded-xl">
                <BookOpen className="w-10 h-10 text-slate-300" />
              </div>
            )}
          </div>

          {/* Preview da mensagem */}
          <div className="bg-slate-50 border rounded-xl p-3 text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
            {buildMessage()}
          </div>

          {/* Botão principal */}
          <Button
            className="w-full bg-[#1B3A5F] hover:bg-[#15304d]"
            onClick={handleShare}
            disabled={sharing}
          >
            {sharing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Aguarde...</>
            ) : copied ? (
              <><Check className="w-4 h-4 mr-2" /> Copiado!</>
            ) : (
              <><Share2 className="w-4 h-4 mr-2" /> Compartilhar</>
            )}
          </Button>

          <p className="text-xs text-slate-400 text-center">
            No celular, abre o menu de compartilhamento com a imagem e mensagem juntas.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}