import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { 
  Plus, Search, Filter, BookOpen, FileText, Newspaper, 
  Archive, Edit, Trash2, Eye, Loader2, QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import ItemForm from "@/components/biblioteca/ItemForm";
import ItemDetails from "@/components/biblioteca/ItemDetails";

export default function BibAcervo() {
  const navigate = useNavigate();
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const bibAuth = sessionStorage.getItem("bib_auth");
    if (bibAuth !== "true") {
      navigate(createPageUrl("BibLogin"));
      return;
    }
    loadItens();
  }, []);

  const loadItens = async () => {
    try {
      const data = await db.Item.list("-created_date");
      setItens(data);
    } catch (error) {
      console.error("Erro ao carregar itens:", error);
    }
    setLoading(false);
  };

  const handleSave = async (itemData) => {
    if (selectedItem) {
      await db.Item.update(selectedItem.id, itemData);
    } else {
      // Gerar código QR único
      const codigoQR = `LCP25-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      await db.Item.create({ ...itemData, codigo_qr: codigoQR });
    }
    await loadItens();
    setFormOpen(false);
    setSelectedItem(null);
  };

  const handleDelete = async () => {
    if (selectedItem) {
      await db.Item.update(selectedItem.id, { ativo: false });
      await loadItens();
    }
    setDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    setFormOpen(true);
  };

  const openDetails = (item) => {
    setSelectedItem(item);
    setDetailsOpen(true);
  };

  const openDelete = (item) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const tipoIcons = {
    "Livro": BookOpen,
    "Revista": FileText,
    "Periódico": Newspaper,
    "Outro": Archive
  };

  const tipoColors = {
    "Livro": "bg-blue-100 text-blue-700",
    "Revista": "bg-purple-100 text-purple-700",
    "Periódico": "bg-amber-100 text-amber-700",
    "Outro": "bg-slate-100 text-slate-700"
  };

  const filteredItens = itens.filter(item => {
    if (!item.ativo) return false;
    const matchSearch = item.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.autor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = tipoFiltro === "todos" || item.tipo === tipoFiltro;
    return matchSearch && matchTipo;
  });

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
          <h1 className="text-2xl font-bold text-slate-800">Acervo</h1>
          <p className="text-slate-500">Gerencie os itens da biblioteca</p>
        </div>
        <Button 
          onClick={() => { setSelectedItem(null); setFormOpen(true); }}
          className="bg-[#1B3A5F] hover:bg-[#15304d]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Item
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="Livro">Livros</SelectItem>
            <SelectItem value="Revista">Revistas</SelectItem>
            <SelectItem value="Periódico">Periódicos</SelectItem>
            <SelectItem value="Outro">Outros</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Itens */}
      {filteredItens.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Nenhum item encontrado</p>
            <Button 
              variant="link" 
              onClick={() => { setSelectedItem(null); setFormOpen(true); }}
              className="mt-2"
            >
              Cadastrar primeiro item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItens.map((item) => {
            const TipoIcon = tipoIcons[item.tipo] || Archive;
            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-20 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.imagem_capa ? (
                        <img src={item.imagem_capa} alt="" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <TipoIcon className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate">{item.nome}</h3>
                      <p className="text-sm text-slate-500 truncate">{item.autor || "Sem autor"}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {item.tipo}
                        </Badge>
                        <Badge 
                          variant={item.quantidade_disponivel > 0 ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {item.quantidade_disponivel || 0} disponíveis
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
                    <Button variant="ghost" size="icon" onClick={() => openDetails(item)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDelete(item)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Formulário */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? "Editar Item" : "Novo Item"}
            </DialogTitle>
          </DialogHeader>
          <ItemForm 
            item={selectedItem} 
            onSave={handleSave}
            onCancel={() => { setFormOpen(false); setSelectedItem(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <ItemDetails 
            item={selectedItem}
            onClose={() => { setDetailsOpen(false); setSelectedItem(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover "{selectedItem?.nome}" do acervo?
              Esta ação pode ser desfeita pelo administrador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}