import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { createPageUrl } from "@/utils";
import { 
  Loader2, Search, Calendar, Download, Clock, FileText, User, Trash2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import { toast } from "sonner";

export default function BibLogDownloads() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [irmaos, setIrmaos] = useState([]);
  const [filtroIrmao, setFiltroIrmao] = useState("todos");
  const [filtroDoc, setFiltroDoc] = useState("todos");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState(null); // 'single' or 'all'
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    const bibAuth = sessionStorage.getItem("bib_auth");
    if (bibAuth !== "true") {
      window.location.href = createPageUrl("BibLogin");
      return;
    }
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const [data, listaIrmaos] = await Promise.all([
      db.LogDownload.list("-data_download", 500),
      db.Irmao.list("nome_completo", 1000)
    ]);
    setLogs(data);
    setIrmaos(listaIrmaos);
    setLoading(false);
  };

  const filteredLogs = logs.filter(log => {
    const matchSearch = log.irmao_nome?.toLowerCase().includes(search.toLowerCase()) ||
                        log.documento_titulo?.toLowerCase().includes(search.toLowerCase()) ||
                        log.irmao_numero_glp?.toLowerCase().includes(search.toLowerCase());
    const matchIrmao = filtroIrmao === "todos" || log.irmao_id === filtroIrmao;
    const matchDoc = filtroDoc === "todos" || log.documento_titulo === filtroDoc;
    return matchSearch && matchIrmao && matchDoc;
  });

  const handleDelete = async () => {
    try {
      if (deleteMode === 'all') {
        const promises = filteredLogs.map(log => db.LogDownload.delete(log.id));
        await Promise.all(promises);
        toast.success("Histórico apagado com sucesso");
      } else if (deleteMode === 'single' && itemToDelete) {
        await db.LogDownload.delete(itemToDelete.id);
        toast.success("Registro apagado");
      }
      setDeleteDialogOpen(false);
      loadLogs();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      toast.error("Erro ao apagar registros");
    }
  };

  // Extrair lista única de documentos dos logs para o filtro
  const uniqueDocs = [...new Set(logs.map(log => log.documento_titulo))].sort();

  // Agrupar por data
  const groupedLogs = filteredLogs.reduce((acc, log) => {
    const date = format(parseISO(log.data_download), "yyyy-MM-dd");
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

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
          <h1 className="text-2xl font-bold text-slate-800">Downloads do Acervo Digital</h1>
          <p className="text-slate-500">{logs.length} download(s) registrado(s)</p>
        </div>
        <Button 
          variant="destructive"
          onClick={() => { setDeleteMode('all'); setDeleteDialogOpen(true); }}
          disabled={filteredLogs.length === 0}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Limpar Filtro Atual
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome, GLP ou documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filtroIrmao} onValueChange={setFiltroIrmao}>
          <SelectTrigger className="w-full lg:w-48">
            <User className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Irmão" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Irmãos</SelectItem>
            {irmaos.map((irmao) => (
              <SelectItem key={irmao.id} value={irmao.id}>
                {irmao.nome_completo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroDoc} onValueChange={setFiltroDoc}>
          <SelectTrigger className="w-full lg:w-48">
            <FileText className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Documento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Docs</SelectItem>
            {uniqueDocs.map((doc, idx) => (
              <SelectItem key={idx} value={doc}>
                {doc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {Object.keys(groupedLogs).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Download className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Nenhum download registrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedLogs).map(([date, dayLogs]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-[#1B3A5F]" />
                <h2 className="font-semibold text-slate-800">
                  {format(parseISO(date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </h2>
                <Badge variant="outline">{dayLogs.length} download(s)</Badge>
              </div>
              <Card>
                <CardContent className="p-0 divide-y">
                  {dayLogs.map((log) => (
                    <div key={log.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">{log.documento_titulo}</p>
                        <p className="text-sm text-slate-500">
                          {log.irmao_nome} • GLP: {log.irmao_numero_glp}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-sm text-slate-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(parseISO(log.data_download), "HH:mm")}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
                        onClick={() => { 
                          setItemToDelete(log); 
                          setDeleteMode('single'); 
                          setDeleteDialogOpen(true); 
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteMode === 'all' 
                ? `Tem certeza que deseja apagar ${filteredLogs.length} registros listados? Esta ação não pode ser desfeita.`
                : "Tem certeza que deseja apagar este registro de download?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}