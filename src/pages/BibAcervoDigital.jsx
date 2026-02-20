import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  FileText, Plus, Search, Loader2, Upload, Trash2, Eye, Pencil,
  BookOpen, GraduationCap, Filter, Eye as EyeOff
} from "lucide-react";
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

export default function BibAcervoDigital() {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docParaDeletar, setDocParaDeletar] = useState(null);

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
     await base44.entities.AcervoDigital.update(doc.id, {
       disponivel: !doc.disponivel
     });
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
        <Button 
          className="bg-[#1B3A5F] hover:bg-[#15304d]"
          onClick={() => { setEditando(null); setFormOpen(true); }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Documento
        </Button>
      </div>

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
          <Card key={doc.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-16 h-20 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {doc.capa_url ? (
                    <img src={doc.capa_url} alt="" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <FileText className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">{doc.titulo}</h3>
                  {doc.autor && (
                    <p className="text-sm text-slate-500 truncate">{doc.autor}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">{doc.tipo}</Badge>
                    <Badge className={grauColors[doc.grau_minimo]}>
                      <GraduationCap className="w-3 h-3 mr-1" />
                      {doc.grau_minimo}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(doc.arquivo_url, '_blank')}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver PDF
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
               
               <div className="flex items-center justify-between mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                 <span className="text-sm text-slate-600">Disponível para irmãos</span>
                 <Switch 
                   checked={doc.disponivel !== false}
                   onCheckedChange={() => handleToggleDisponibilidade(doc)}
                 />
               </div>

                </Button>
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
            onCancel={() => { setFormOpen(false); setEditando(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{docParaDeletar?.titulo}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}