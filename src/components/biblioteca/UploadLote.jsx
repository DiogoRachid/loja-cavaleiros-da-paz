import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, X, FileText, Loader2, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

// Gera capa do PDF (primeira página)
async function gerarCapa(arquivo_url) {
  try {
    const pdf = await pdfjsLib.getDocument({
      url: arquivo_url,
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
    const { file_url } = await base44.integrations.Core.UploadFile({ file: capaFile });
    return file_url;
  } catch (e) {
    console.error('Erro ao gerar capa:', e);
    return null;
  }
}

// Modo: "bib" = bibliotecário (salva direto em AcervoDigital, disponivel=false)
//       "irmao" = membro (salva em SugestaoAcervo, status=Pendente)
export default function UploadLote({ modo = "bib", irmao = null, onConcluido }) {
  const inputRef = useRef();
  const [arquivos, setArquivos] = useState([]); // { file, titulo, tipo, grau_minimo, status, erro, capa_url, arquivo_url }
  const [processando, setProcessando] = useState(false);
  const [expandido, setExpandido] = useState(true);

  const handleFiles = (files) => {
    const pdfs = Array.from(files).filter(f => f.type === "application/pdf");
    if (pdfs.length === 0) {
      toast.error("Selecione arquivos PDF.");
      return;
    }
    const novos = pdfs.map(f => ({
      file: f,
      titulo: f.name.replace(/\.pdf$/i, ""),
      tipo: "Trabalho",
      grau_minimo: "Aprendiz",
      status: "pendente", // pendente | enviando | ok | erro
      erro: null,
      capa_url: null,
      arquivo_url: null,
    }));
    setArquivos(prev => [...prev, ...novos]);
  };

  const remover = (idx) => setArquivos(prev => prev.filter((_, i) => i !== idx));

  const atualizar = (idx, campo, valor) => {
    setArquivos(prev => prev.map((a, i) => i === idx ? { ...a, [campo]: valor } : a));
  };

  const enviar = async () => {
    // Captura snapshot local para evitar leitura de estado stale no loop
    const lista = arquivos.map(a => ({ ...a }));
    const pendentes = lista.filter(a => a.status === "pendente");
    if (pendentes.length === 0) return;
    setProcessando(true);

    for (let i = 0; i < lista.length; i++) {
      if (lista[i].status !== "pendente") continue;

      lista[i].status = "enviando";
      setArquivos(lista.map(a => ({ ...a })));

      try {
        // 1. Upload do PDF
        const { file_url } = await base44.integrations.Core.UploadFile({ file: lista[i].file });

        // 2. Gerar capa
        const capa_url = await gerarCapa(file_url);

        // 3. Salvar
        if (modo === "bib") {
          await base44.entities.AcervoDigital.create({
            titulo: lista[i].titulo,
            tipo: lista[i].tipo,
            grau_minimo: lista[i].grau_minimo,
            arquivo_url: file_url,
            capa_url: capa_url || undefined,
            ativo: true,
            disponivel: false,
          });
        } else {
          await base44.entities.SugestaoAcervo.create({
            titulo: lista[i].titulo,
            tipo: lista[i].tipo,
            grau_minimo: lista[i].grau_minimo,
            arquivo_url: file_url,
            capa_url: capa_url || undefined,
            irmao_id: irmao?.id,
            irmao_nome: irmao?.nome_completo,
            irmao_numero_glp: irmao?.numero_glp,
            status: "Pendente",
          });
        }

        lista[i] = { ...lista[i], status: "ok", arquivo_url: file_url, capa_url };
        setArquivos(lista.map(a => ({ ...a })));
      } catch (e) {
        lista[i] = { ...lista[i], status: "erro", erro: e.message };
        setArquivos(lista.map(a => ({ ...a })));
      }
    }

    setProcessando(false);
    toast.success(`Upload concluído!`);
    if (onConcluido) onConcluido();
  };

  const pendentes = arquivos.filter(a => a.status === "pendente").length;
  const enviados = arquivos.filter(a => a.status === "ok").length;
  const erros = arquivos.filter(a => a.status === "erro").length;

  return (
    <div className="border border-dashed border-slate-300 rounded-xl bg-slate-50">
      {/* Header colapsável */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setExpandido(e => !e)}
      >
        <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
          <Upload className="w-4 h-4 text-[#1B3A5F]" />
          Upload em Lote
          {arquivos.length > 0 && (
            <span className="text-xs text-slate-500">
              ({arquivos.length} arquivo{arquivos.length !== 1 ? 's' : ''})
            </span>
          )}
          {enviados > 0 && <Badge className="bg-emerald-100 text-emerald-700 text-xs">{enviados} enviado{enviados !== 1 ? 's' : ''}</Badge>}
          {erros > 0 && <Badge className="bg-red-100 text-red-700 text-xs">{erros} erro{erros !== 1 ? 's' : ''}</Badge>}
        </div>
        {expandido ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {expandido && (
        <div className="px-4 pb-4 space-y-3">
          {/* Drop zone */}
          <div
            className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center cursor-pointer hover:border-[#1B3A5F] transition-colors"
            onClick={() => inputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          >
            <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">Clique ou arraste arquivos <strong>PDF</strong> aqui</p>
            <p className="text-xs text-slate-400 mt-1">Múltiplos arquivos suportados</p>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />
          </div>

          {/* Lista de arquivos */}
          {arquivos.length > 0 && (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {arquivos.map((arq, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    {arq.status === "enviando" && <Loader2 className="w-4 h-4 animate-spin text-[#1B3A5F] flex-shrink-0" />}
                    {arq.status === "ok" && <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                    {arq.status === "erro" && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                    {arq.status === "pendente" && <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                    <span className="text-xs text-slate-500 truncate flex-1">{arq.file.name}</span>
                    {arq.status === "pendente" && (
                      <button onClick={() => remover(idx)} className="text-slate-400 hover:text-red-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {arq.status === "pendente" && (
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                      <Input
                        value={arq.titulo}
                        onChange={e => atualizar(idx, 'titulo', e.target.value)}
                        placeholder="Título"
                        className="text-xs h-8"
                      />
                      <Select value={arq.tipo} onValueChange={v => atualizar(idx, 'tipo', v)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Livro">Livro</SelectItem>
                          <SelectItem value="Trabalho">Trabalho</SelectItem>
                          <SelectItem value="Artigo">Artigo</SelectItem>
                          <SelectItem value="Instrução">Instrução</SelectItem>
                          <SelectItem value="Ritual">Ritual</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={arq.grau_minimo} onValueChange={v => atualizar(idx, 'grau_minimo', v)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Aprendiz">Aprendiz</SelectItem>
                          <SelectItem value="Companheiro">Companheiro</SelectItem>
                          <SelectItem value="Mestre">Mestre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {arq.status === "ok" && (
                    <p className="text-xs text-emerald-600">
                      {modo === "bib" ? "Adicionado ao acervo (aguarda liberação)" : "Enviado para aprovação"}
                    </p>
                  )}
                  {arq.status === "erro" && (
                    <p className="text-xs text-red-500">Erro: {arq.erro}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {pendentes > 0 && (
            <Button
              className="w-full bg-[#1B3A5F] hover:bg-[#15304d]"
              onClick={enviar}
              disabled={processando}
            >
              {processando
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</>
                : <><Upload className="w-4 h-4 mr-2" />Enviar {pendentes} arquivo{pendentes !== 1 ? 's' : ''}</>
              }
            </Button>
          )}

          {modo === "bib" && arquivos.some(a => a.status === "ok") && (
            <p className="text-xs text-center text-slate-500">
              ⚠️ Documentos enviados ficam <strong>indisponíveis</strong> até liberação manual.
            </p>
          )}
          {modo === "irmao" && arquivos.some(a => a.status === "ok") && (
            <p className="text-xs text-center text-slate-500">
              ✅ Sugestões enviadas ficam <strong>pendentes</strong> até aprovação do bibliotecário.
            </p>
          )}
        </div>
      )}
    </div>
  );
}