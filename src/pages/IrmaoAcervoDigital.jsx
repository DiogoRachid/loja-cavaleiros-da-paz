import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { createPageUrl } from "@/utils";
import {
  FileText, Search, Loader2, BookOpen, GraduationCap,
  Filter, Download, Eye, Lock, Star, Calendar, MessageSquare
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function IrmaoAcervoDigital() {
  const [documentos, setDocumentos] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [irmao, setIrmao] = useState(null);
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroOrdem, setFiltroOrdem] = useState("titulo");
  const [docSelecionado, setDocSelecionado] = useState(null);
  


  // Estado para avaliação
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState("");
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);

  const grauOrdem = { "Aprendiz": 1, "Companheiro": 2, "Mestre": 3 };



  useEffect(() => {
    const irmaoAuth = sessionStorage.getItem("irmao_auth");
    const irmaoData = sessionStorage.getItem("irmao_data");
    
    if (irmaoAuth !== "true" || !irmaoData) {
      window.location.href = createPageUrl("IrmaoLogin");
      return;
    }
    
    setIrmao(JSON.parse(irmaoData));
    loadData();
  }, []);

  const loadData = async () => {
    const [docs, avs] = await Promise.all([
      db.AcervoDigital.filter({ ativo: true, disponivel: true }, "-created_date"),
      db.Avaliacao.filter({ documento_id: { "$ne": null } }, "-data_avaliacao")
    ]);
    setDocumentos(docs);
    setAvaliacoes(avs);
    setLoading(false);
  };

  const getMediaAvaliacao = (docId) => {
    const docAvaliacoes = avaliacoes.filter(av => av.documento_id === docId);
    if (docAvaliacoes.length === 0) return 0;
    const soma = docAvaliacoes.reduce((acc, curr) => acc + curr.nota, 0);
    return soma / docAvaliacoes.length;
  };

  const podeAcessar = (doc) => {
    if (!irmao?.grau) return false;
    return grauOrdem[irmao.grau] >= grauOrdem[doc.grau_minimo];
  };

  const registrarDownload = (doc) => {
    window.open(doc.arquivo_url, '_blank');

    db.LogDownload.create({
      documento_id: doc.id,
      documento_titulo: doc.titulo,
      irmao_id: irmao.id,
      irmao_nome: irmao.nome_completo,
      irmao_numero_glp: irmao.numero_glp,
      data_download: new Date().toISOString()
    }).catch(console.error);
  };

  const handleEnviarAvaliacao = async (e) => {
    e.preventDefault();
    if (!docSelecionado) return;

    setEnviandoAvaliacao(true);
    try {
      await db.Avaliacao.create({
        documento_id: docSelecionado.id,
        irmao_id: irmao.id,
        irmao_nome: irmao.nome_completo,
        nota: nota,
        comentario: comentario,
        data_avaliacao: new Date().toISOString()
      });
      toast.success("Avaliação enviada com sucesso!");
      setNota(5);
      setComentario("");
      setDocSelecionado(null);
      loadData();
    } catch (err) {
      console.error("Erro ao enviar avaliação:", err);
      toast.error("Erro ao enviar avaliação");
    }
    setEnviandoAvaliacao(false);
  };

  const ordernarDocumentos = (docs) => {
    const copia = [...docs];
    
    switch(filtroOrdem) {
      case "titulo":
        return copia.sort((a, b) => (a.titulo || "").localeCompare(b.titulo || ""));
      case "data":
        return copia.sort((a, b) => {
          const dataA = a.data_publicacao ? new Date(a.data_publicacao) : new Date(0);
          const dataB = b.data_publicacao ? new Date(b.data_publicacao) : new Date(0);
          return dataB - dataA;
        });
      case "nota":
        return copia.sort((a, b) => getMediaAvaliacao(b.id) - getMediaAvaliacao(a.id));
      default:
        return copia;
    }
  };

  const filteredDocs = ordernarDocumentos(
    documentos.filter(doc => {
      const matchSearch = doc.titulo?.toLowerCase().includes(search.toLowerCase()) ||
                         doc.autor?.toLowerCase().includes(search.toLowerCase());
      const matchTipo = filtroTipo === "todos" || doc.tipo === filtroTipo;
      const temAcesso = podeAcessar(doc);
      return matchSearch && matchTipo && temAcesso;
    })
  );

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
          <p className="text-slate-500">{filteredDocs.length} documento(s) disponível(is)</p>
        </div>

        <Button
          onClick={() => window.location.href = createPageUrl("IrmaoBibliotecaChat")}
          className="bg-[#1B3A5F] hover:bg-[#15304d]"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Perguntar ao Acervo
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
        <Select value={filtroOrdem} onValueChange={setFiltroOrdem}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="titulo">Nome (A-Z)</SelectItem>
            <SelectItem value="data">Data</SelectItem>
            <SelectItem value="nota">Avaliação</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Documentos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-max">
        {filteredDocs.map((doc) => {
          const mediaAvaliacao = getMediaAvaliacao(doc.id);
          const totalAvaliacoes = avaliacoes.filter(av => av.documento_id === doc.id).length;
          
          return (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
              <CardContent className="p-4 flex flex-col gap-4 h-full">
                <div className="flex gap-4">
                  <div className="w-16 h-20 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {doc.capa_url ? (
                      <img src={doc.capa_url} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <FileText className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 line-clamp-2">{doc.titulo}</h3>
                    {doc.autor && (
                      <p className="text-xs text-slate-500 line-clamp-1 mt-1">{doc.autor}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline" className="text-xs">{doc.tipo}</Badge>
                      <Badge className={`${grauColors[doc.grau_minimo]} text-xs`}>
                        <GraduationCap className="w-2 h-2 mr-1" />
                        {doc.grau_minimo}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Avaliação */}
                  {mediaAvaliacao > 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < Math.round(mediaAvaliacao) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-slate-500">({totalAvaliacoes})</span>
                    </div>
                  )}

                  {/* Data de publicação */}
                  {doc.data_publicacao && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span>{format(parseISO(doc.data_publicacao), 'dd/MM/yyyy')}</span>
                    </div>
                  )}

                  {/* Descrição */}
                  {doc.descricao && (
                    <p className="text-xs text-slate-600 line-clamp-2">{doc.descricao}</p>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => registrarDownload(doc)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Ver PDF
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setDocSelecionado(doc)}
                  >
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Avaliar
                  </Button>

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

      <div className="text-center text-xs text-slate-400 mt-8 pb-4 border-t pt-4">
        Conteúdo protegido por direitos autorais — uso permitido apenas para fins educacionais e sem autorização para reprodução ou distribuição
      </div>




      {/* Dialog de Avaliação */}
      <Dialog open={!!docSelecionado} onOpenChange={(open) => {
        if (!open) setDocSelecionado(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Avaliar: {docSelecionado?.titulo}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleEnviarAvaliacao} className="space-y-4">
            {/* Nota */}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                Avaliação (1-5 estrelas)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNota(n)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        n <= nota ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comentário */}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                Comentário (opcional)
              </label>
              <Textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Compartilhe sua opinião sobre este documento..."
                className="h-24"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setDocSelecionado(null)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#1B3A5F] hover:bg-[#15304d]"
                disabled={enviandoAvaliacao}
              >
                {enviandoAvaliacao ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Avaliação'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
