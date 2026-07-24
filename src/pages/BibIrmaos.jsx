import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { 
  Plus, Search, Edit, Trash2, Eye, Loader2, 
  UserCircle, Mail, Phone, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import IrmaoForm from "@/components/biblioteca/IrmaoForm";
import IrmaoDetails from "@/components/biblioteca/IrmaoDetails";

export default function BibIrmaos() {
  const navigate = useNavigate();
  const [irmaos, setIrmaos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedIrmao, setSelectedIrmao] = useState(null);

  useEffect(() => {
    const bibAuth = sessionStorage.getItem("bib_auth");
    if (bibAuth !== "true") {
      navigate(createPageUrl("BibLogin"));
      return;
    }
    loadIrmaos();
  }, []);

  const loadIrmaos = async () => {
    try {
      const data = await db.Irmao.list("-created_date");
      setIrmaos(data);
    } catch (error) {
      console.error("Erro ao carregar irmãos:", error);
    }
    setLoading(false);
  };

  const handleSave = async (irmaoData) => {
    if (selectedIrmao) {
      await db.Irmao.update(selectedIrmao.id, irmaoData);
    } else {
      await db.Irmao.create(irmaoData);
    }
    await loadIrmaos();
    setFormOpen(false);
    setSelectedIrmao(null);
  };

  const handleDelete = async () => {
    if (selectedIrmao) {
      await db.Irmao.update(selectedIrmao.id, { ativo: false });
      await loadIrmaos();
    }
    setDeleteDialogOpen(false);
    setSelectedIrmao(null);
  };

  const filteredIrmaos = irmaos.filter(irmao => {
    if (!irmao.ativo) return false;
    return irmao.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           irmao.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           irmao.numero_glp?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const grauColors = {
    "Aprendiz": "bg-blue-100 text-blue-700",
    "Companheiro": "bg-amber-100 text-amber-700",
    "Mestre": "bg-emerald-100 text-emerald-700"
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
          <h1 className="text-2xl font-bold text-slate-800">Irmãos</h1>
          <p className="text-slate-500">Cadastro dos membros da loja</p>
        </div>
        <Button 
          onClick={() => { setSelectedIrmao(null); setFormOpen(true); }}
          className="bg-[#1B3A5F] hover:bg-[#15304d]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Irmão
        </Button>
      </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Buscar por nome, email ou GLP..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista */}
      {filteredIrmaos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserCircle className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Nenhum irmão encontrado</p>
            <Button 
              variant="link" 
              onClick={() => { setSelectedIrmao(null); setFormOpen(true); }}
              className="mt-2"
            >
              Cadastrar primeiro irmão
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIrmaos.map((irmao) => (
            <Card key={irmao.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1B3A5F] to-[#2d5a8f] flex items-center justify-center text-white font-bold text-lg">
                    {irmao.nome_completo?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">
                      {irmao.nome_completo}
                    </h3>
                    {irmao.numero_glp && (
                      <p className="text-sm text-slate-500">GLP: {irmao.numero_glp}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {irmao.grau && (
                        <Badge className={grauColors[irmao.grau]}>
                          {irmao.grau}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 space-y-1 text-sm text-slate-500">
                  {irmao.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{irmao.email}</span>
                    </div>
                  )}
                  {irmao.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      <span>{irmao.telefone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => { setSelectedIrmao(irmao); setDetailsOpen(true); }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => { setSelectedIrmao(irmao); setFormOpen(true); }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => { setSelectedIrmao(irmao); setDeleteDialogOpen(true); }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Formulário */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedIrmao ? "Editar Irmão" : "Novo Irmão"}
            </DialogTitle>
          </DialogHeader>
          <IrmaoForm 
            irmao={selectedIrmao} 
            onSave={handleSave}
            onCancel={() => { setFormOpen(false); setSelectedIrmao(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Modal Detalhes */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <IrmaoDetails 
            irmao={selectedIrmao}
            onClose={() => { setDetailsOpen(false); setSelectedIrmao(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar o cadastro de "{selectedIrmao?.nome_completo}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}