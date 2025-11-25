import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { 
  Loader2, Search, Calendar, Download, Clock, FileText
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BibLogDownloads() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const bibAuth = sessionStorage.getItem("bib_auth");
    if (bibAuth !== "true") {
      window.location.href = createPageUrl("BibLogin");
      return;
    }
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const data = await base44.entities.LogDownload.list("-data_download", 200);
    setLogs(data);
    setLoading(false);
  };

  const filteredLogs = logs.filter(log => 
    log.irmao_nome?.toLowerCase().includes(search.toLowerCase()) ||
    log.documento_titulo?.toLowerCase().includes(search.toLowerCase()) ||
    log.irmao_numero_glp?.toLowerCase().includes(search.toLowerCase())
  );

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
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Downloads do Acervo Digital</h1>
        <p className="text-slate-500">{logs.length} download(s) registrado(s)</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Buscar por nome, GLP ou documento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
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
                    <div key={log.id} className="flex items-center gap-4 p-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">{log.documento_titulo}</p>
                        <p className="text-sm text-slate-500">
                          {log.irmao_nome} • GLP: {log.irmao_numero_glp}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Clock className="w-4 h-4" />
                          {format(parseISO(log.data_download), "HH:mm")}
                        </div>
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