import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { 
  Loader2, Search, Calendar, User, Clock, LogIn, Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BibLogAcessos() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [irmaos, setIrmaos] = useState([]);
  const [filtroIrmao, setFiltroIrmao] = useState("todos");

  useEffect(() => {
    const bibAuth = sessionStorage.getItem("bib_auth");
    if (bibAuth !== "true") {
      window.location.href = createPageUrl("BibLogin");
      return;
    }
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const [data, listaIrmaos] = await Promise.all([
      base44.entities.LogAcesso.list("-data_acesso", 200),
      base44.entities.Irmao.list("nome_completo", 1000)
    ]);
    setLogs(data);
    setIrmaos(listaIrmaos);
    setLoading(false);
  };

  const filteredLogs = logs.filter(log => {
    const matchSearch = log.irmao_nome?.toLowerCase().includes(search.toLowerCase()) ||
                        log.irmao_numero_glp?.toLowerCase().includes(search.toLowerCase());
    const matchIrmao = filtroIrmao === "todos" || log.irmao_id === filtroIrmao;
    return matchSearch && matchIrmao;
  });

  // Agrupar por data
  const groupedLogs = filteredLogs.reduce((acc, log) => {
    const date = format(parseISO(log.data_acesso), "yyyy-MM-dd");
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
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Registro de Acessos</h1>
        <p className="text-slate-500">{logs.length} acesso(s) registrado(s)</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou número GLP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filtroIrmao} onValueChange={setFiltroIrmao}>
          <SelectTrigger className="w-full sm:w-64">
            <User className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar por Irmão" />
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
      </div>

      {Object.keys(groupedLogs).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <LogIn className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Nenhum acesso registrado</p>
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
                <Badge variant="outline">{dayLogs.length} acesso(s)</Badge>
              </div>
              <Card>
                <CardContent className="p-0 divide-y">
                  {dayLogs.map((log) => (
                    <div key={log.id} className="flex items-center gap-4 p-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <LogIn className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{log.irmao_nome}</p>
                        <p className="text-sm text-slate-500">GLP: {log.irmao_numero_glp}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Clock className="w-4 h-4" />
                          {format(parseISO(log.data_acesso), "HH:mm")}
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 mt-1">
                          {log.tipo_acesso}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}