import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { createPageUrl } from "@/utils";
import {
  Book, Search, Loader2, Star, Calendar, MessageSquare, 
  Filter, Eye, GraduationCap, MapPin, CheckCircle, XCircle
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
import { toast } from "sonner";

export default function IrmaoAcervo() {
  const [items, setItems] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [irmao, setIrmao] = useState(null);
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroOrdem, setFiltroOrdem] = useState("nome");
  const [itemSelecionado, setItemSelecionado] = useState(null);
  
  // Estado para avaliação
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState("");
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);

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
    const [itemsData, avs] = await Promise.all([
      db.Item.filter({ ativo: true }, "nome"),
      db.Avaliacao.filter({ item_id: { "$ne": null } }, "-data_avaliacao")
    ]);
    setItems(itemsData);
    setAvaliacoes(avs);
    setLoading(false);
  };

  const getMediaAvaliacao = (itemId) => {
    const itemAvaliacoes = avaliacoes.filter(av => av.item_id === itemId);
    if (itemAvaliacoes.length === 0) return 0;
    const soma = itemAvaliacoes.reduce((acc, curr) => acc + curr.nota, 0);
    return soma / itemAvaliacoes.length;
  };

  const handleEnviarAvaliacao = async (e) => {
    e.preventDefault();
    if (!itemSelecionado) return;

    setEnviandoAvaliacao(true);
    try {
      await db.Avaliacao.create({
        item_id: itemSelecionado.id,
        irmao_id: irmao.id,
        irmao_nome: irmao.nome_completo,
        nota: nota,
        comentario: comentario,
        data_avaliacao: new Date().toISOString()
      });
      
      toast.success("Avaliação enviada com sucesso!");
      setNota(5);
      setComentario("");
      loadData();
    } catch (error) {
      console.error("Erro ao avaliar:", error);
      toast.error("Erro ao enviar avaliação");
    }
    setEnviandoAvaliacao(false);
  };

  const filteredItems = () => {
    let filtered = items.filter(item => {
      const matchSearch = item.nome?.toLowerCase().includes(search.toLowerCase()) ||
                         item.autor?.toLowerCase().includes(search.toLowerCase());
      const matchTipo = filtroTipo === "todos" || item.tipo === filtroTipo;
      return matchSearch && matchTipo;
    });

    return filtered.sort((a, b) => {
      if (filtroOrdem === "nome") return a.nome.localeCompare(b.nome);
      if (filtroOrdem === "data") {
        const dateA = a.data_publicacao || a.created_date;
        const dateB = b.data_publicacao || b.created_date;
        return new Date(dateB) - new Date(dateA);
      }
      if (filtroOrdem === "nota") {
        return getMediaAvaliacao(b.id) - getMediaAvaliacao(a.id);
      }
      return 0;
    });
  };

  const itemsFiltrados = filteredItems();

  const renderStars = (rating) => {
    return (
      <div className="flex text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`w-4 h-4 ${star <= Math.round(rating) ? "fill-current" : "text-slate-200"}`} 
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B3A5F]" />
      </div>
    );
  }

  const itemComments = itemSelecionado 
    ? avaliacoes.filter(av => av.item_id === itemSelecionado.id)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Acervo Físico</h1>
        <p className="text-slate-500">
          Catálogo de livros e itens físicos disponíveis na biblioteca
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou autor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Tipos</SelectItem>
              <SelectItem value="Livro">Livro</SelectItem>
              <SelectItem value="Revista">Revista</SelectItem>
              <SelectItem value="Periódico">Periódico</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filtroOrdem} onValueChange={setFiltroOrdem}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nome">A-Z</SelectItem>
              <SelectItem value="data">Mais Recentes</SelectItem>
              <SelectItem value="nota">Melhor Avaliados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de Itens */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {itemsFiltrados.map((item) => {
          const media = getMediaAvaliacao(item.id);
          const disponivel = item.quantidade_disponivel > 0;
          
          return (
            <Card 
              key={item.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setItemSelecionado(item)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-16 h-20 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.imagem_capa ? (
                      <img src={item.imagem_capa} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Book className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">{item.nome}</h3>
                    {item.autor && (
                      <p className="text-sm text-slate-500 truncate">{item.autor}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(media)}
                      <span className="text-xs text-slate-400">({media > 0 ? media.toFixed(1) : "Sem nota"})</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">{item.tipo}</Badge>
                      <Badge className={disponivel ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                        {disponivel ? "Disponível" : "Indisponível"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {itemsFiltrados.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Book className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Nenhum item encontrado</p>
          </CardContent>
        </Card>
      )}

      {/* Dialog Detalhes */}
      <Dialog open={!!itemSelecionado} onOpenChange={() => setItemSelecionado(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{itemSelecionado?.nome}</DialogTitle>
          </DialogHeader>
          {itemSelecionado && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {itemSelecionado.imagem_capa ? (
                  <img 
                    src={itemSelecionado.imagem_capa} 
                    alt="" 
                    className="w-full sm:w-48 h-64 object-cover rounded-lg shadow-md"
                  />
                ) : (
                  <div className="w-full sm:w-48 h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Book className="w-16 h-16 text-slate-300" />
                  </div>
                )}
                <div className="space-y-4 flex-1">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-800">Detalhes do Item</h3>
                    {itemSelecionado.autor && (
                      <p className="text-slate-600">Autor: {itemSelecionado.autor}</p>
                    )}
                    <p className="text-slate-600">
                      Publicado em: {itemSelecionado.data_publicacao ? format(parseISO(itemSelecionado.data_publicacao), "dd/MM/yyyy") : "—"}
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge variant="outline">{itemSelecionado.tipo}</Badge>
                      <Badge className="bg-slate-100 text-slate-700">
                        <MapPin className="w-3 h-3 mr-1" />
                        {itemSelecionado.localizacao || "Local não informado"}
                      </Badge>
                      <Badge className="bg-slate-100 text-slate-700">
                        <GraduationCap className="w-3 h-3 mr-1" />
                        Grau {itemSelecionado.grau_minimo}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                    {itemSelecionado.quantidade_disponivel > 0 ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-slate-800">
                        {itemSelecionado.quantidade_disponivel} disponível(is)
                      </p>
                      <p className="text-xs text-slate-500">
                        Total no acervo: {itemSelecionado.quantidade_total}
                      </p>
                    </div>
                  </div>
                  
                  {itemSelecionado.descricao && (
                    <div className="text-slate-600 text-sm leading-relaxed">
                      {itemSelecionado.descricao}
                    </div>
                  )}
                </div>
              </div>

              {/* Seção de Avaliações */}
              <div className="pt-6 border-t space-y-4">
                <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Avaliações e Comentários
                </h3>

                {/* Lista de Comentários */}
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                  {itemComments.length > 0 ? (
                    itemComments.map((comment) => (
                      <div key={comment.id} className="bg-slate-50 p-3 rounded-lg text-sm">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-slate-700">{comment.irmao_nome}</span>
                          <div className="flex">{renderStars(comment.nota)}</div>
                        </div>
                        <p className="text-slate-600">{comment.comentario}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {format(parseISO(comment.data_avaliacao), "dd/MM/yyyy HH:mm")}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic">Nenhuma avaliação ainda.</p>
                  )}
                </div>

                {/* Formulário de Avaliação */}
                <form onSubmit={handleEnviarAvaliacao} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="font-medium text-slate-800 mb-3">Deixe sua avaliação</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">Sua nota:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setNota(s)}
                            className={`w-6 h-6 ${s <= nota ? "text-amber-400 fill-current" : "text-slate-300"}`}
                          >
                            <Star className={`w-6 h-6 ${s <= nota ? "fill-current" : ""}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <Textarea
                      placeholder="Escreva um comentário..."
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      className="text-sm bg-white"
                      rows={2}
                    />
                    <Button 
                      type="submit" 
                      size="sm" 
                      className="w-full bg-[#1B3A5F]"
                      disabled={enviandoAvaliacao}
                    >
                      {enviandoAvaliacao ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        "Enviar Avaliação"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}