import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, CheckCircle, Clock, MapPin, FileText, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const statusColors = {
  Agendada: "bg-blue-100 text-blue-800",
  Realizada: "bg-green-100 text-green-800",
  Cancelada: "bg-red-100 text-red-800"
};

const tipoColors = {
  "Ordinária": "bg-slate-100 text-slate-700",
  "Extraordinária": "bg-yellow-100 text-yellow-800",
  "Magna": "bg-purple-100 text-purple-800",
  "Pública": "bg-green-100 text-green-800",
  "De Instrução": "bg-blue-100 text-blue-800",
  "Fúnebre": "bg-gray-100 text-gray-700",
};

export default function AdminAgendaRitual() {
  const [sessoes, setSessoes] = useState([]);
  const [selecionada, setSelecionada] = useState(null);
  const [ordemCount, setOrdemCount] = useState({});

  useEffect(() => { loadDados(); }, []);

  const loadDados = async () => {
    const data = await base44.entities.Sessao.list("-data", 30);
    setSessoes(data);
    // Contar participantes por sessão
    const ordens = await base44.entities.OrdemEntrada.list();
    const counts = {};
    ordens.forEach(o => { counts[o.sessao_id] = (counts[o.sessao_id] || 0) + 1; });
    setOrdemCount(counts);
  };

  const agendadas = sessoes.filter(s => s.status === "Agendada");
  const realizadas = sessoes.filter(s => s.status === "Realizada");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
            <Calendar className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A5F]">Agenda Ritual</h1>
            <p className="text-slate-500">{agendadas.length} sessões agendadas</p>
          </div>
        </div>
      </div>

      {/* Próximas Sessões */}
      {agendadas.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[#1B3A5F] mb-3">Próximas Sessões</h2>
          <div className="space-y-3">
            {agendadas.map(s => (
              <Card key={s.id} className={`cursor-pointer hover:shadow-md transition-all ${selecionada?.id === s.id ? "border-[#C9A227]" : ""}`}
                onClick={() => setSelecionada(selecionada?.id === s.id ? null : s)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-[#1B3A5F] flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-[#C9A227] text-xs font-medium">{s.data?.split("-")[1] && ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][parseInt(s.data.split("-")[1]) - 1]}</span>
                        <span className="text-white text-xl font-bold">{s.data?.split("-")[2]}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-slate-800">{s.tipo}</p>
                          {s.numero && <span className="text-slate-400 text-sm">Nº {s.numero}</span>}
                          <Badge className={tipoColors[s.tipo] || ""}>{s.grau}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.hora}</span>
                          {s.local && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.local}</span>}
                          {ordemCount[s.id] > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{ordemCount[s.id]} na ordem</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={statusColors[s.status]}>{s.status}</Badge>
                    </div>
                  </div>

                  {selecionada?.id === s.id && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      {s.pauta && (
                        <div>
                          <p className="text-sm font-medium text-slate-700 flex items-center gap-1 mb-1"><FileText className="w-3 h-3" /> Pauta</p>
                          <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap">{s.pauta}</p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Link to={createPageUrl(`AdminOrdemEntrada`)}>
                          <Button size="sm" className="bg-[#1B3A5F] text-white">
                            <Users className="w-3 h-3 mr-1" /> Preparar Ordem de Entrada
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Sessões Realizadas */}
      {realizadas.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-500 mb-3">Sessões Realizadas</h2>
          <div className="space-y-2">
            {realizadas.slice(0, 5).map(s => (
              <Card key={s.id} className="opacity-75">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-700 text-sm">{s.tipo} {s.numero && `Nº ${s.numero}`}</p>
                      <p className="text-xs text-slate-400">{s.data} às {s.hora}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Realizada</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {sessoes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-slate-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhuma sessão cadastrada.</p>
            <Link to={createPageUrl("AdminSessoes")}>
              <Button className="mt-3 bg-[#1B3A5F] text-white">Cadastrar Sessão</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}