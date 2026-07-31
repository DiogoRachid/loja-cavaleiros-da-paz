import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
import {
  FileText, Plus, Search, Loader2, Upload, Trash2, Eye, Pencil,
  BookOpen, GraduationCap, Filter, Share2, ImagePlus, FileArchive, CopyCheck
} from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AcervoDigitalForm from "@/components/biblioteca/AcervoDigitalForm";
import { notificarWhatsApp } from "@/lib/whatsapp";
import ShareModal from "@/components/biblioteca/ShareModal";
import UploadLote from "@/components/biblioteca/UploadLote";
import DuplicatasModal from "@/components/biblioteca/DuplicatasModal";

export default function BibAcervoDigital() {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docParaDeletar, setDocParaDeletar] = useState(null);
  const [shareItem, setShareItem] = useState(null);
  const [gerandoCapas, setGerandoCapas] = useState(false);
  const [duplicatasOpen, setDuplicatasOpen] = useState(false);
  const [progressoCapas, setProgressoCapas] = useState("");


  useEffect(() => {
    const bibAuth = sessionStorage.getItem("bib_auth");
    if (bibAuth !== "true") {
      window.location.href = createPageUrl("BibLogin");
      return;
    }
    loadDocumentos();
  }, []);

  const loadDocumentos = async () => {
    const docs = await base44.entities.AcervoDigital.list("-created_date");
    setDocumentos(docs);
    setLoading(false);
  };

  const handleSave = async (data) => {
    if (editando) {
      await base44.entities.AcervoDigital.update(editando.id, data);
    } else {
      await base44.entities.AcervoDigital.create(data);
      notificarWhatsApp({
        tipo: data.tipo || "Documento",
        nome: data.titulo,
        grau: data.grau_minimo || "Aprendiz",
        autor: data.autor,
      });
    }
    setFormOpen(false);
    setEditando(null);
    loadDocumentos();
  };

  const handleDelete = async () => {
    if (docParaDeletar) {
      await base44.entities.AcervoDigital.delete(docParaDeletar.id);
      setDeleteDialogOpen(false);
      setDocParaDeletar(null);
      loadDocumentos();
    }
  };

   const handleToggleDisponibilidade = async (doc) => {
     const novoStatus = !doc.disponivel;
     await base44.entities.AcervoDigital.update(doc.id, { disponivel: novoStatus });
     if (novoStatus) {
       notificarWhatsApp({
         tipo: doc.tipo || "Documento",
         nome: doc.titulo,
         grau: doc.grau_minimo || "Aprendiz",
         autor: doc.autor,
       });
     }
     loadDocumentos();
   };


  const gerarCapasDePDFs = async () => {
    const semCapa = documentos.filter(d => d.arquivo_url && !d.capa_url);
    if (semCapa.length === 0) {
      toast.info("Todos os documentos já possuem capa.");
      return;
    }
    setGerandoCapas(true);
    let ok = 0;
    for (const doc of semCapa) {
      setProgressoCapas(`Gerando capa: ${doc.titulo} (${ok + 1}/${semCapa.length})`);
      try {
        const pdf = await pdfjsLib.getDocument({ url: doc.arquivo_url, withCredentials: false }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.85));
        const capaFile = new File([blob], 'capa.jpg', { type: 'image/jpeg' });
        const { file_url } = await base44.integrations.Core.UploadFile({ file: capaFile });
        await base44.entities.AcervoDigital.update(doc.id, { capa_url: file_url });
        ok++;
      } catch (e) {
        console.error('Erro ao gerar capa para', doc.titulo, e);
      }
    }
    setGerandoCapas(false);
    setProgressoCapas("");
    toast.success(`${ok} capa(s) gerada(s) com sucesso!`);
    loadDocumentos();
  };

  const filteredDocs = documentos.filter(doc => {
    const matchSearch = doc.titulo?.toLowerCase().includes(search.toLowerCase()) ||
                       doc.autor?.toLowerCase().includes(search.toLowerCase());
    const matchTipo = filtroTipo === "todos" || doc.tipo === filtroTipo;
    return matchSearch && matchTipo;
  });

  const grauColors = {
    "Aprendiz": "bg-blue-100 text-blue-700",
    "Companheiro": "bg-amber-100 text-amber-700",
    "Mestre": "bg-purple-100 text-purple-700"
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B3A5F]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Acervo Digital</h1>
          <p className="text-slate-500">{documentos.length} documento(s) cadastrado(s)</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setDuplicatasOpen(true)}
            className="border-amber-500 text-amber-600 hover:bg-amber-50"
          >
            <CopyCheck className="w-4 h-4 mr-2" />
            Duplicatas
          </Button>
          <Button
            variant="outline"
            onClick={gerarCapasDePDFs}
            disabled={gerandoCapas}
            title="Gerar capas para documentos sem capa"
          >
            {gerandoCapas ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{progressoCapas || "Gerando..."}</> : <><ImagePlus className="w-4 h-4 mr-2" />Gerar Capas</>}
          </Button>
          <Button 
            className="bg-[#1B3A5F] hover:bg-[#15304d]"
            onClick={() => { setEditando(null); setFormOpen(true); }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Documento
          </Button>
        </div>
      </div>

      {/* Upload em Lote */}
      <UploadLote modo="bib" onConcluido={loadDocumentos} />

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por título ou autor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="Livro">Livro</SelectItem>
            <SelectItem value="Trabalho">Trabalho</SelectItem>
            <SelectItem value="Artigo">Artigo</SelectItem>
            <SelectItem value="Instrução">Instrução</SelectItem>
            <SelectItem value="Ritual">Ritual</SelectItem>
            <SelectItem value="Outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Documentos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDocs.map((doc) => (
          <Card key={doc.id} className="hover:shadow-lg transition-shadow overflow-hidden">
            <CardContent className="p-4">
              <div className="flex gap-3 min-w-0">
                <div className="w-14 h-18 min-w-[56px] bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0" style={{height:'72px'}}>
                  {doc.capa_url ? (
                    <img src={doc.capa_url} alt="" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <FileText className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <h3 className="font-semibold text-slate-800 truncate text-sm">{doc.titulo}</h3>
                  {doc.autor && (
                    <p className="text-xs text-slate-500 truncate">{doc.autor}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <Badge variant="outline" className="text-xs">{doc.tipo}</Badge>
                    <Badge className={`${grauColors[doc.grau_minimo]} text-xs`}>
                      <GraduationCap className="w-3 h-3 mr-1" />
                      {doc.grau_minimo}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-1 mt-3 pt-3 border-t justify-end flex-wrap">
                <Button
                  variant="ghost"
                  size="icon"
                  title="Compartilhar"
                  onClick={() => setShareItem(doc)}
                >
                  <Share2 className="w-4 h-4 text-[#1B3A5F]" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(doc.arquivo_url, '_blank')}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setEditando(doc); setFormOpen(true); }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => { setDocParaDeletar(doc); setDeleteDialogOpen(true); }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-sm text-slate-600">Disponível para irmãos</span>
                <Switch 
                  checked={doc.disponivel !== false}
                  onCheckedChange={() => handleToggleDisponibilidade(doc)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Nenhum documento encontrado</p>
          </CardContent>
        </Card>
      )}

      <div className="text-center text-xs text-slate-400 mt-8 pb-4 border-t pt-4">
        Conteúdo protegido por direitos autorais — uso permitido apenas para fins educacionais e sem autorização para reprodução ou distribuição
      </div>

      <ShareModal
        open={!!shareItem}
        onClose={() => setShareItem(null)}
        titulo={shareItem?.titulo}
        capa={shareItem?.capa_url}
        tipo={shareItem?.tipo}
        autor={shareItem?.autor}
        grau={shareItem?.grau_minimo}
        tipoAcervo="digital"
        itemId={shareItem?.id}
      />

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editando ? "Editar Documento" : "Novo Documento"}
            </DialogTitle>
          </DialogHeader>
          <AcervoDigitalForm
            documento={editando}
            onSave={handleSave}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <DuplicatasModal
        open={duplicatasOpen}
        onClose={() => setDuplicatasOpen(false)}
        itens={documentos}
        modo="digital"
        onConcluido={() => { loadDocumentos(); }}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o documento "{docParaDeletar?.titulo}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}