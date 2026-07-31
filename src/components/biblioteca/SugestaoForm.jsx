import { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { uploadFile } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, FileText, ImagePlus } from "lucide-react";
import { toast } from "sonner";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const DEFAULT = {
  titulo: "", autor: "", tipo: "Livro", descricao: "",
  data_publicacao: "", grau_minimo: "Aprendiz", arquivo_url: "", capa_url: ""
};

export default function SugestaoForm({ sugestao, onSave, onCancel }) {
  const [form, setForm] = useState(DEFAULT);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingCapa, setUploadingCapa] = useState(false);
  const [gerandoCapa, setGerandoCapa] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sugestao) setForm({ ...DEFAULT, ...sugestao });
    else setForm(DEFAULT);
  }, [sugestao]);

  const handle = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const gerarCapaDoPDF = async (pdfUrl) => {
    const pdf = await pdfjsLib.getDocument({
      url: pdfUrl,
      withCredentials: false,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist/cmaps/',
      cMapPacked: true,
    }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.85));
    const capaFile = new File([blob], 'capa.jpg', { type: 'image/jpeg' });
    const { file_url } = await uploadFile({ file: capaFile });
    return file_url;
  };

  const handleGerarCapa = async () => {
    if (!form.arquivo_url) return;
    setGerandoCapa(true);
    try {
      const capa = await gerarCapaDoPDF(form.arquivo_url);
      if (capa) { setForm(f => ({ ...f, capa_url: capa })); toast.success('Capa gerada!'); }
      else toast.error('Não foi possível gerar a capa.');
    } catch (e) {
      toast.error('Erro ao gerar capa: ' + e.message);
    }
    setGerandoCapa(false);
  };

  const handlePDF = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPdf(true);
    const { file_url } = await uploadFile({ file });
    setForm(f => ({ ...f, arquivo_url: file_url }));
    if (!form.capa_url) {
      const capa = await gerarCapaDoPDF(file_url);
      if (capa) setForm(f => ({ ...f, arquivo_url: file_url, capa_url: capa }));
    }
    setUploadingPdf(false);
  };

  const handleCapa = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCapa(true);
    const { file_url } = await uploadFile({ file });
    setForm(f => ({ ...f, capa_url: file_url }));
    setUploadingCapa(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.arquivo_url) { toast.error("Envie o arquivo PDF."); return; }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 space-y-1">
          <Label>Título *</Label>
          <Input value={form.titulo} onChange={e => handle("titulo", e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label>Autor</Label>
          <Input value={form.autor} onChange={e => handle("autor", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Tipo *</Label>
          <Select value={form.tipo} onValueChange={v => handle("tipo", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Livro","Trabalho","Artigo","Instrução","Ritual","Outro"].map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Grau mínimo</Label>
          <Select value={form.grau_minimo} onValueChange={v => handle("grau_minimo", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Aprendiz">Aprendiz</SelectItem>
              <SelectItem value="Companheiro">Companheiro</SelectItem>
              <SelectItem value="Mestre">Mestre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Data de publicação</Label>
          <Input type="date" value={form.data_publicacao} onChange={e => handle("data_publicacao", e.target.value)} />
        </div>
        <div className="sm:col-span-2 space-y-1">
          <Label>Descrição</Label>
          <Textarea rows={3} value={form.descricao} onChange={e => handle("descricao", e.target.value)} />
        </div>
      </div>

      {/* Upload PDF */}
      <div className="space-y-1">
        <Label>Arquivo PDF *</Label>
        <label className="flex items-center gap-3 p-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 transition">
          {uploadingPdf ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : <Upload className="w-5 h-5 text-slate-400" />}
          <span className="text-sm text-slate-500">
            {form.arquivo_url ? "PDF enviado ✓" : "Clique para enviar o PDF"}
          </span>
          <input type="file" accept=".pdf" className="hidden" onChange={handlePDF} />
        </label>
      </div>

      {/* Botão Gerar Capa */}
      {form.arquivo_url && (
        <Button type="button" variant="outline" className="w-full" onClick={handleGerarCapa} disabled={gerandoCapa}>
          {gerandoCapa ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Gerando...</> : <><ImagePlus className="w-4 h-4 mr-2" />Gerar Capa do PDF</>}
        </Button>
      )}

      {/* Upload Capa */}
      <div className="space-y-1">
        <Label>Imagem de capa <span className="text-slate-400 text-xs">(gerada automaticamente se não enviada)</span></Label>
        <label className="flex items-center gap-3 p-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 transition">
          {uploadingCapa ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : <ImagePlus className="w-5 h-5 text-slate-400" />}
          {form.capa_url
            ? <img src={form.capa_url} alt="capa" className="w-10 h-14 object-cover rounded" />
            : <span className="text-sm text-slate-500">Clique para enviar a capa</span>}
          <input type="file" accept="image/*" className="hidden" onChange={handleCapa} />
        </label>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" className="bg-[#1B3A5F] hover:bg-[#15304d]" disabled={saving || uploadingPdf || uploadingCapa}>
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</> : "Enviar para Aprovação"}
        </Button>
      </div>
    </form>
  );
}