import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { 
  Plus, Search, Filter, Loader2, BookMarked, 
  ArrowLeftRight, CheckCircle, AlertTriangle, User, Library
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { format, parseISO, isAfter } from "date-fns";
import EmprestimoForm from "@/components/biblioteca/EmprestimoForm";
import DevolucaoForm from "@/components/biblioteca/DevolucaoForm";

export default function BibEmprestimos() {
  const navigate = useNavigate();
  const [emprestimos, setEmprestimos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [filtroIrmao, setFiltroIrmao] = useState("todos");
  const [filtroItem, setFiltroItem] = useState("todos");
  const [irmaos, setIrmaos] = useState([]);
  const [items, setItems] = useState([]);
  const [emprestimoFormOpen, setEmprestimoFormOpen] = useState(false);
  const [devolucaoFormOpen, setDevolucaoFormOpen] = useState(false);
  const [selectedEmprestimo, setSelectedEmprestimo] = useState(null);

  useEffect(() => {
    const bibAuth = sessionStorage.getItem("bib_auth");
    if (bibAuth !== "true") {
      navigate(createPageUrl("BibLogin"));
      return;
    }
    loadEmprestimos();
  }, []);

  const loadEmprestimos = async () => {
    try {
      const [data, listaIrmaos, listaItems] = await Promise.all([
        base44.entities.Emprestimo.list("-data_retirada", 200),
        base44.entities.Irmao.list("nome_completo", 1000),
        base44.entities.Item.list("nome", 1000)
      ]);
      
      setIrmaos(listaIrmaos);
      setItems(listaItems);

      // Verificar atrasos
      const hoje = new Date();
      const updated = data.map(emp => {
        if (emp.status === "Ativo" && emp.data_prevista_devolucao) {
          const dataPrevista = parseISO(emp.data_prevista_devolucao);
          if (isAfter(hoje, dataPrevista)) {
            return { ...emp, status: "Atrasado" };
          }
        }
        return emp;
      });
      
      setEmprestimos(updated);
    } catch (error) {
      console.error("Erro ao carregar empréstimos:", error);
    }
    setLoading(false);
  };

  const handleNovoEmprestimo = async (data) => {
    await loadEmprestimos();
    setEmprestimoFormOpen(false);
  };

  const handleDevolucao = async () => {
    await loadEmprestimos();
    setDevolucaoFormOpen(false);
    setSelectedEmprestimo(null);
  };

  const openDevolucao = (emp) => {
    setSelectedEmprestimo(emp);
    setDevolucaoFormOpen(true);
  };

  const filteredEmprestimos = emprestimos.filter(emp => {
    const matchSearch = emp.item_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       emp.irmao_nome?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFiltro === "todos" || emp.status === statusFiltro;
    const matchIrmao = filtroIrmao === "todos" || emp.irmao_id === filtroIrmao;
    const matchItem = filtroItem === "todos" || emp.item_id === filtroItem;
    return matchSearch && matchStatus && matchIrmao && matchItem;
  });

  const statusColors = {
    "Ativo": "bg-blue-100 text-blue-700",
    "Devolvido": "bg-emerald-100 text-emerald-700",
    "Atrasado": "bg-red-100 text-red-700"
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
          <h1 className="text-2xl font-bold text-slate-800">Empréstimos</h1>
          <p className="text-slate-500">Registre retiradas e devoluções</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setEmprestimoFormOpen(true)}
            className="bg-[#1B3A5F] hover:bg-[#15304d]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Retirada
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full md:w-auto">
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger>
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="Ativo">Ativos</SelectItem>
              <SelectItem value="Atrasado">Atrasados</SelectItem>
              <SelectItem value="Devolvido">Devolvidos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtroIrmao} onValueChange={setFiltroIrmao}>
            <SelectTrigger>
              <User className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Irmão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Irmãos</SelectItem>
              {irmaos.map((irmao) => (
                <SelectItem key={irmao.id} value={irmao.id}>{irmao.nome_completo}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtroItem} onValueChange={setFiltroItem}>
            <SelectTrigger>
              <Library className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Item" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Itens</SelectItem>
              {items.map((item) => (
                <SelectItem key={item.id} value={item.id}>{item.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista */}
      {filteredEmprestimos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookMarked className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Nenhum empréstimo encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredEmprestimos.map((emp) => (
            <Card 
              key={emp.id} 
              className={`hover:shadow-md transition-shadow ${
                emp.status === "Atrasado" ? "border-red-200" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      emp.status === "Ativo" ? "bg-blue-100" :
                      emp.status === "Atrasado" ? "bg-red-100" : "bg-emerald-100"
                    }`}>
                      {emp.status === "Atrasado" ? (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      ) : emp.status === "Devolvido" ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <ArrowLeftRight className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{emp.item_nome}</h3>
                      <p className="text-sm text-slate-500">{emp.irmao_nome}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge className={statusColors[emp.status]}>
                          {emp.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {emp.tipo_operacao}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:items-end gap-2">
                    <div className="text-sm text-slate-500">
                      <p>Retirada: {emp.data_retirada && format(parseISO(emp.data_retirada), "dd/MM/yyyy")}</p>
                      {emp.data_prevista_devolucao && (
                        <p className={emp.status === "Atrasado" ? "text-red-500" : ""}>
                          Previsto: {format(parseISO(emp.data_prevista_devolucao), "dd/MM/yyyy")}
                        </p>
                      )}
                      {emp.data_devolucao && (
                        <p className="text-emerald-600">
                          Devolvido: {format(parseISO(emp.data_devolucao), "dd/MM/yyyy")}
                        </p>
                      )}
                    </div>
                    {(emp.status === "Ativo" || emp.status === "Atrasado") && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openDevolucao(emp)}
                      >
                        Registrar Devolução
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Novo Empréstimo */}
      <Dialog open={emprestimoFormOpen} onOpenChange={setEmprestimoFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Retirada (Manual)</DialogTitle>
          </DialogHeader>
          <EmprestimoForm 
            onSave={handleNovoEmprestimo}
            onCancel={() => setEmprestimoFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal Devolução */}
      <Dialog open={devolucaoFormOpen} onOpenChange={setDevolucaoFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Devolução</DialogTitle>
          </DialogHeader>
          <DevolucaoForm 
            emprestimo={selectedEmprestimo}
            onSave={handleDevolucao}
            onCancel={() => { setDevolucaoFormOpen(false); setSelectedEmprestimo(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}