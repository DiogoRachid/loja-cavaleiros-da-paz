import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  FileText, Search, Loader2, BookOpen, GraduationCap,
  Filter, Download, Eye, Lock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function IrmaoAcervoDigital() {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [irmao, setIrmao] = useState(null);
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [docSelecionado, setDocSelecionado] = useState(null);

  const grauOrdem = { "Aprendiz": 1, "Companheiro": 2, "Mestre": 3 };

  useEffect(() => {
    const irmaoAuth = sessionStorage.getItem("irmao_auth");
    const irmaoData = sessionStorage.getItem("irmao_data");
    
    if (irmaoAuth !== "true" || !irmaoData) {
      window.location.href = createPageUrl("IrmaoLogin");
      return;
    }
    
    setIrmao(JSON.parse(irmaoData));
    loadDocumentos();
  }, []);

  const loadDocumentos = async () => {
    const docs = await base44.entities.AcervoDigital.filter({ ativo: true }, "-created_date");
    setDocumentos(docs);
    setLoading(false);
  };

  const podeAcessar = (doc) => {
    if (!irmao?.grau) return false;
    return grauOrdem[irmao.grau] >= grauOrdem[doc.grau_minimo];
  };

  const registrarDownload = async (doc) => {
    await base44.entities.LogDownload.create({
      documento_id: doc.id,
      documento_titulo: doc.titulo,
      irmao_id: irmao.id,
      irmao_nome: irmao.nome_completo,
      irmao_numero_glp: irmao.numero_glp,
      data_download: new Date().toISOString()
    });
    // Abrir no leitor de PDF do Google Docs
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(doc.arquivo_url)}&embedded=true`;
    window.open(viewerUrl, '_blank');
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
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Acervo Digital</h1>
        <p className="text-slate-500">
          Livros e trabalhos disponíveis para leitura • Seu grau: {irmao?.grau || "—"}
        </p>
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
        {filteredDocs.map((doc) => {
          const temAcesso = podeAcessar(doc);
          return (
            <Card 
              key={doc.id} 
              className={`hover:shadow-lg transition-shadow ${!temAcesso ? 'opacity-60' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-16 h-20 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 relative">
                    {doc.capa_url ? (
                      <img src={doc.capa_url} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <FileText className="w-8 h-8 text-slate-400" />
                    )}
                    {!temAcesso && (
                      <div className="absolute inset-0 bg-slate-900/50 rounded-lg flex items-center justify-center">
                        <Lock className="w-5 h-5 text-white" />
                      </div>
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
                
                <div className="mt-4 pt-4 border-t">
                  {temAcesso ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setDocSelecionado(doc)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detalhes
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-[#1B3A5F] hover:bg-[#15304d]"
                        onClick={() => registrarDownload(doc)}
                      >
                        <BookOpen className="w-4 h-4 mr-1" />
                        Ler PDF
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Lock className="w-4 h-4" />
                      Disponível para {doc.grau_minimo}s
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDocs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Nenhum documento encontrado</p>
          </CardContent>
        </Card>
      )}

      {/* Dialog Detalhes */}
      <Dialog open={!!docSelecionado} onOpenChange={() => setDocSelecionado(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{docSelecionado?.titulo}</DialogTitle>
          </DialogHeader>
          {docSelecionado && (
            <div className="space-y-4">
              <div className="flex gap-4">
                {docSelecionado.capa_url && (
                  <img 
                    src={docSelecionado.capa_url} 
                    alt="" 
                    className="w-24 h-32 object-cover rounded-lg"
                  />
                )}
                <div className="space-y-2">
                  {docSelecionado.autor && (
                    <p className="text-slate-600">
                      <span className="font-medium">Autor:</span> {docSelecionado.autor}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Badge variant="outline">{docSelecionado.tipo}</Badge>
                    <Badge className={grauColors[docSelecionado.grau_minimo]}>
                      {docSelecionado.grau_minimo}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {docSelecionado.descricao && (
                <div>
                  <h4 className="font-medium text-slate-800 mb-1">Descrição</h4>
                  <p className="text-slate-600 text-sm">{docSelecionado.descricao}</p>
                </div>
              )}

              <Button
                className="w-full bg-[#1B3A5F] hover:bg-[#15304d]"
                onClick={() => registrarDownload(docSelecionado)}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Abrir PDF
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}