import { useState, useRef, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Loader2, CheckCircle, Barcode, BookOpen, RotateCcw, Crop, ZoomIn, ZoomOut } from "lucide-react";

// ───────────────────────────────────────────────
// Tela 1: Escolha do modo
// ───────────────────────────────────────────────
function ModoEscolha({ onModo, onClose }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 text-center">Escolha como deseja adicionar o livro:</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onModo("isbn")}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#1B3A5F]/30 rounded-xl cursor-pointer hover:border-[#C9A227] hover:bg-amber-50 transition-colors group"
        >
          <Barcode className="w-10 h-10 text-[#1B3A5F] mb-2 group-hover:text-[#C9A227]" />
          <span className="text-sm font-medium text-[#1B3A5F]">Código ISBN</span>
          <span className="text-xs text-slate-400 mt-1 text-center">Foto do código ou digitar</span>
        </button>
        <button
          onClick={() => onModo("capa")}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#1B3A5F]/30 rounded-xl cursor-pointer hover:border-[#C9A227] hover:bg-amber-50 transition-colors group"
        >
          <BookOpen className="w-10 h-10 text-[#1B3A5F] mb-2 group-hover:text-[#C9A227]" />
          <span className="text-sm font-medium text-[#1B3A5F]">Foto da Capa</span>
          <span className="text-xs text-slate-400 mt-1 text-center">IA identifica título e autor</span>
        </button>
      </div>
      <Button variant="outline" size="sm" className="w-full" onClick={onClose}>Cancelar</Button>
    </div>
  );
}

// ───────────────────────────────────────────────
// Tela 2a: ISBN
// ───────────────────────────────────────────────
function ModoISBN({ onConcluir, onVoltar }) {
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const fileInputRef = useRef(null);

  const concluirComVolume = (volume, capaExtra, isbnExtra) => {
    const thumb = volume.imageLinks?.thumbnail || volume.imageLinks?.smallThumbnail || "";
    const imagem = capaExtra || (thumb ? thumb.replace("http://", "https://").replace("zoom=1", "zoom=0").replace("zoom=5", "zoom=0").replace("&edge=curl", "") : "");
    const ano = volume.publishedDate ? volume.publishedDate.substring(0, 4) : "";
    const isbn13 = volume.industryIdentifiers?.find(i => i.type === "ISBN_13")?.identifier || "";
    const isbn10 = volume.industryIdentifiers?.find(i => i.type === "ISBN_10")?.identifier || "";
    onConcluir({
      nome: volume.title || "",
      autor: (volume.authors || []).join(", ") || volume.publisher || "",
      descricao: volume.description ? volume.description.substring(0, 500) : "",
      data_publicacao: ano ? `${ano}-01-01` : "",
      imagem_capa: imagem,
      isbn: isbn13 || isbn10 || isbnExtra || "",
    });
  };

  const buscarPorCodigo = async (cod) => {
    setLoading(true);
    setErro("");
    const clean = cod.replace(/[-\s]/g, "");
    const isIsbn = /^[0-9]{10,13}$/.test(clean);

    if (isIsbn) {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${clean}&maxResults=1`);
      const data = await res.json();
      const item = data?.items?.[0];
      if (item?.volumeInfo) {
        const capaUrl = `https://books.google.com/books/content?id=${item.id}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;
        setLoading(false);
        concluirComVolume(item.volumeInfo, capaUrl, clean);
        return;
      }
      setLoading(false);
      setErro("ISBN não encontrado no Google Books. Verifique o número e tente novamente.");
      return;
    }

    setLoading(false);
    setErro("Código não reconhecido. Use ISBN-10 (10 dígitos) ou ISBN-13 (13 dígitos).");
  };

  const handleFotoISBN = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setErro("");

    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analise esta imagem e extraia o código ISBN-10 ou ISBN-13 visível na foto (geralmente está no código de barras ou escrito como "ISBN" seguido de números). Retorne apenas o código numérico sem espaços ou hífens.`,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          codigo: { type: "string" }
        }
      }
    });

    setLoading(false);
    if (result.codigo) {
      setCodigo(result.codigo);
      buscarPorCodigo(result.codigo);
    } else {
      setErro("Não consegui ler o código na foto. Tente digitar manualmente.");
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 text-center">
        Tire uma foto do código de barras ISBN ou digite o número abaixo.
      </p>

      <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#1B3A5F]/30 rounded-xl cursor-pointer hover:border-[#1B3A5F] hover:bg-slate-50 transition-colors">
        <Barcode className="w-8 h-8 text-[#1B3A5F] mb-2" />
        <span className="text-sm font-medium text-[#1B3A5F]">Fotografar código de barras</span>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFotoISBN} />
      </label>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <div className="flex-1 h-px bg-slate-200" />
        <span>ou digitar</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Ex: 9788535902778"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && codigo && buscarPorCodigo(codigo)}
        />
        <Button
          disabled={!codigo || loading}
          onClick={() => buscarPorCodigo(codigo)}
          className="bg-[#1B3A5F] hover:bg-[#15304d] shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
        </Button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-[#1B3A5F] justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Buscando informações do livro...</span>
        </div>
      )}

      {erro && <p className="text-sm text-red-500 text-center">{erro}</p>}

      <Button variant="outline" size="sm" className="w-full" onClick={onVoltar}>← Voltar</Button>
    </div>
  );
}

// ───────────────────────────────────────────────
// Editor de Corte (Crop) via canvas
// ───────────────────────────────────────────────
function CropEditor({ imageSrc, onConfirm, onCancel }) {
  const canvasRef = useRef(null);
  const [drag, setDrag] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const imgRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Ao carregar a imagem, define crop inicial cobrindo tudo
  const handleImgLoad = () => {
    const img = imgRef.current;
    setCrop({ x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight });
    setImgLoaded(true);
  };

  const getPos = (e, rect) => {
    const client = e.touches ? e.touches[0] : e;
    const scaleX = imgRef.current.naturalWidth / rect.width;
    const scaleY = imgRef.current.naturalHeight / rect.height;
    return {
      x: (client.clientX - rect.left) * scaleX,
      y: (client.clientY - rect.top) * scaleY
    };
  };

  const onMouseDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = getPos(e, rect);
    setDrag({ startX: pos.x, startY: pos.y, rect });
    setCrop({ x: pos.x, y: pos.y, w: 0, h: 0 });
  };

  const onMouseMove = (e) => {
    if (!drag) return;
    const rect = drag.rect;
    const pos = getPos(e, rect);
    const x = Math.min(pos.x, drag.startX);
    const y = Math.min(pos.y, drag.startY);
    const w = Math.abs(pos.x - drag.startX);
    const h = Math.abs(pos.y - drag.startY);
    setCrop({ x, y, w, h });
  };

  const onMouseUp = () => setDrag(null);

  const handleConfirm = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const usedCrop = crop.w > 10 && crop.h > 10
      ? crop
      : { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight };

    canvas.width = usedCrop.w;
    canvas.height = usedCrop.h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, usedCrop.x, usedCrop.y, usedCrop.w, usedCrop.h, 0, 0, usedCrop.w, usedCrop.h);
    canvas.toBlob((blob) => {
      const file = new File([blob], "capa_cortada.jpg", { type: "image/jpeg" });
      onConfirm(file);
    }, "image/jpeg", 0.92);
  };

  // Calcula o retângulo de seleção em % para o overlay
  const imgEl = imgRef.current;
  const overlayStyle = imgEl && imgLoaded && crop.w > 10 ? (() => {
    const nw = imgEl.naturalWidth;
    const nh = imgEl.naturalHeight;
    return {
      left: `${(crop.x / nw) * 100}%`,
      top: `${(crop.y / nh) * 100}%`,
      width: `${(crop.w / nw) * 100}%`,
      height: `${(crop.h / nh) * 100}%`,
    };
  })() : null;

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 text-center">
        Arraste sobre a imagem para selecionar a área a manter. Deixe sem seleção para usar a imagem inteira.
      </p>
      <div
        className="relative select-none cursor-crosshair rounded-lg overflow-hidden border border-slate-200"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchStart={onMouseDown}
        onTouchMove={onMouseMove}
        onTouchEnd={onMouseUp}
      >
        <img
          ref={imgRef}
          src={imageSrc}
          alt="Capa"
          className="w-full"
          onLoad={handleImgLoad}
          draggable={false}
        />
        {overlayStyle && (
          <div
            className="absolute border-2 border-[#C9A227] bg-[#C9A227]/10 pointer-events-none"
            style={overlayStyle}
          />
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onCancel}>← Voltar</Button>
        <Button size="sm" className="flex-1 bg-[#1B3A5F] hover:bg-[#15304d]" onClick={handleConfirm}>
          <Crop className="w-4 h-4 mr-1" /> Confirmar Recorte
        </Button>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────
// Tela 2b: Foto da Capa
// ───────────────────────────────────────────────
function ModoCapa({ onConcluir, onVoltar }) {
  const [stage, setStage] = useState("capture"); // "capture" | "crop" | "analyzing"
  const [preview, setPreview] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [status, setStatus] = useState("");
  const fileInputRef = useRef(null);

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setRawFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      setStage("crop");
    };
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = async (croppedFile) => {
    setStage("analyzing");
    setStatus("uploading");
    const { file_url } = await base44.integrations.Core.UploadFile({ file: croppedFile });
    setStatus("analyzing");

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analise esta imagem de capa de livro, revista ou periódico.
Extraia o título completo da obra e o nome do autor/editora.
Se não conseguir identificar algum campo, deixe-o como string vazia.`,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          titulo: { type: "string" },
          autor: { type: "string" }
        }
      }
    });

    onConcluir({
      nome: result.titulo || "",
      autor: result.autor || "",
      imagem_capa: file_url
    });
  };

  const statusMsg = {
    uploading: "Enviando imagem...",
    analyzing: "IA identificando título e autor..."
  };

  if (stage === "crop" && preview) {
    return (
      <CropEditor
        imageSrc={preview}
        onConfirm={handleCropConfirm}
        onCancel={() => { setStage("capture"); setPreview(null); setRawFile(null); }}
      />
    );
  }

  if (stage === "analyzing") {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader2 className="w-10 h-10 animate-spin text-[#1B3A5F]" />
        <span className="text-sm font-medium text-[#1B3A5F]">{statusMsg[status]}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 text-center">
        Tire uma foto da capa. Você poderá ajustar o recorte antes de enviar.
      </p>
      <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#1B3A5F]/30 rounded-xl cursor-pointer hover:border-[#1B3A5F] hover:bg-slate-50 transition-colors">
        <Camera className="w-10 h-10 text-[#1B3A5F] mb-3" />
        <span className="text-sm font-medium text-[#1B3A5F]">Tirar foto / Escolher imagem</span>
        <span className="text-xs text-slate-400 mt-1">Câmera ou galeria</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFoto}
        />
      </label>
      <Button variant="outline" size="sm" className="w-full" onClick={onVoltar}>← Voltar</Button>
    </div>
  );
}

// ───────────────────────────────────────────────
// Componente principal
// ───────────────────────────────────────────────
export default function ScanCapa({ open, onClose, onConcluir }) {
  const [modo, setModo] = useState(null); // null | "isbn" | "capa"

  const handleClose = () => {
    setModo(null);
    onClose();
  };

  const handleConcluir = (dados) => {
    setModo(null);
    onConcluir(dados);
  };

  const titles = {
    null: "Adicionar Livro",
    isbn: "Buscar por ISBN",
    capa: "Fotografar Capa"
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#1B3A5F]" />
            {titles[modo]}
          </DialogTitle>
        </DialogHeader>

        {!modo && <ModoEscolha onModo={setModo} onClose={handleClose} />}
        {modo === "isbn" && <ModoISBN onConcluir={handleConcluir} onVoltar={() => setModo(null)} />}
        {modo === "capa" && <ModoCapa onConcluir={handleConcluir} onVoltar={() => setModo(null)} />}
      </DialogContent>
    </Dialog>
  );
}