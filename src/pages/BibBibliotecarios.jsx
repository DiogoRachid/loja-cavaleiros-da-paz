import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { 
  Plus, Search, Edit, Trash2, Loader2, 
  UserCog, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

export default function BibBibliotecarios() {
  const navigate = useNavigate();
  const [bibliotecarios, setBibliotecarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBib, setSelectedBib] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});
  
  const [formData, setFormData] = useState({
    nome: "",
    login: "",
    senha: "",
    ativo: true
  });

  useEffect(() => {
    const bibAuth = sessionStorage.getItem("bib_auth");
    if (bibAuth !== "true") {
      navigate(createPageUrl("BibLogin"));
      return;
    }
    loadBibliotecarios();
  }, []);

  const loadBibliotecarios = async () => {
    try {
      const data = await base44.entities.Bibliotecario.list("-created_date");
      setBibliotecarios(data);
    } catch (error) {
      console.error("Erro ao carregar bibliotecários:", error);
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (selectedBib) {
        await base44.entities.Bibliotecario.update(selectedBib.id, formData);
      } else {
        await base44.entities.Bibliotecario.create(formData);
      }
      await loadBibliotecarios();
      setFormOpen(false);
      setSelectedBib(null);
      setFormData({ nome: "", login: "", senha: "", ativo: true });
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
    
    setSaving(false);
  };

  const handleDelete = async () => {
    if (selectedBib) {
      await base44.entities.Bibliotecario.delete(selectedBib.id);
      await loadBibliotecarios();
    }
    setDeleteDialogOpen(false);
    setSelectedBib(null);
  };

  const openEdit = (bib) => {
    setSelectedBib(bib);
    setFormData({
      nome: bib.nome || "",
      login: bib.login || "",
      senha: bib.senha || "",
      ativo: bib.ativo !== false
    });
    setFormOpen(true);
  };

  const openNew = () => {
    setSelectedBib(null);
    setFormData({ nome: "", login: "", senha: "", ativo: true });
    setFormOpen(true);
  };

  const toggleShowPassword = (id) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredBibliotecarios = bibliotecarios.filter(bib =>
    bib.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bib.login?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-slate-800">Bibliotecários</h1>
          <p className="text-slate-500">Gerencie os acessos ao portal</p>
        </div>
        <Button 
          onClick={openNew}
          className="bg-[#1B3A5F] hover:bg-[#15304d]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Bibliotecário
        </Button>
      </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Buscar por nome ou login..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista */}
      {filteredBibliotecarios.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserCog className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Nenhum bibliotecário cadastrado</p>
            <Button variant="link" onClick={openNew} className="mt-2">
              Cadastrar primeiro bibliotecário
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBibliotecarios.map((bib) => (
            <Card key={bib.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1B3A5F] to-[#2d5a8f] flex items-center justify-center text-white font-bold text-lg">
                    {bib.nome?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-800 truncate">
                        {bib.nome}
                      </h3>
                      <Badge variant={bib.ativo ? "default" : "secondary"}>
                        {bib.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      Login: <span className="font-mono">{bib.login}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-slate-500">
                        Senha: <span className="font-mono">
                          {showPasswords[bib.id] ? bib.senha : "••••••••"}
                        </span>
                      </p>
                      <button 
                        onClick={() => toggleShowPassword(bib.id)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords[bib.id] ? 
                          <EyeOff className="w-3 h-3" /> : 
                          <Eye className="w-3 h-3" />
                        }
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(bib)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => { setSelectedBib(bib); setDeleteDialogOpen(true); }}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedBib ? "Editar Bibliotecário" : "Novo Bibliotecário"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Nome completo"
                required
              />
            </div>

            <div>
              <Label htmlFor="login">Login *</Label>
              <Input
                id="login"
                value={formData.login}
                onChange={(e) => setFormData(prev => ({ ...prev, login: e.target.value }))}
                placeholder="Login de acesso"
                required
              />
            </div>

            <div>
              <Label htmlFor="senha">Senha *</Label>
              <Input
                id="senha"
                type="text"
                value={formData.senha}
                onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                placeholder="Senha de acesso"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="ativo">Ativo</Label>
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="bg-[#1B3A5F] hover:bg-[#15304d]">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o bibliotecário "{selectedBib?.nome}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}