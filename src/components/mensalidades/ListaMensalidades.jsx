import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { Check, Search } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusColors = {
  Pago: "bg-green-100 text-green-800",
  Pendente: "bg-yellow-100 text-yellow-800",
  Atrasado: "bg-red-100 text-red-800",
  Isento: "bg-slate-100 text-slate-600",
};

export default function ListaMensalidades({ mensalidades, centros, onAtualizar }) {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroComp, setFiltroComp] = useState("");

  const registrarPagamento = async (m) => {
    await db.Mensalidade.update(m.id, {
      status: "Pago",
      data_pagamento: new Date().toISOString().split("T")[0],
    });
    onAtualizar();
  };

  const filtradas = mensalidades.filter(m => {
    const matchBusca = !busca || m.irmao_nome?.toLowerCase().includes(busca.toLowerCase()) || m.irmao_cim?.includes(busca);
    const matchStatus = filtroStatus === "Todos" || m.status === filtroStatus;
    const matchComp = !filtroComp || m.competencia?.includes(filtroComp);
    return matchBusca && matchStatus && matchComp;
  });

  const totalPago = filtradas.filter(m => m.status === "Pago").reduce((a, m) => a + (m.valor || 0), 0);
  const totalGeral = filtradas.reduce((a, m) => a + (m.valor || 0), 0);

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome..." className="pl-9" />
        </div>
        <Input value={filtroComp} onChange={e => setFiltroComp(e.target.value)} placeholder="Competência (03/2026)" className="w-44" />
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>{["Todos","Pago","Pendente","Atrasado","Isento"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {/* Resumo */}
      <div className="flex gap-3 flex-wrap text-sm">
        <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-600">{filtradas.length} registros</span>
        <span className="bg-green-100 px-3 py-1 rounded-full text-green-700 font-medium">Pago: R$ {totalPago.toFixed(2)}</span>
        <span className="bg-[#1B3A5F]/10 px-3 py-1 rounded-full text-[#1B3A5F] font-medium">Total: R$ {totalGeral.toFixed(2)}</span>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {filtradas.length === 0 && (
          <Card><CardContent className="p-8 text-center text-slate-400">Nenhum lançamento encontrado.</CardContent></Card>
        )}
        {filtradas.map(m => {
          const cc = m.centros_custo || {};
          const temCC = Object.keys(cc).length > 0;
          return (
            <Card key={m.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{m.irmao_nome}</p>
                    <p className="text-xs text-slate-500">GLP: {m.irmao_cim} • Competência: {m.competencia} • Venc: {m.vencimento}</p>
                    {temCC && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {m.valor_mensalidade > 0 && (
                          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
                            Mensalidade: R$ {(m.valor_mensalidade || 0).toFixed(2)}
                          </span>
                        )}
                        {Object.entries(cc).map(([id, val]) => {
                          const centro = centros.find(c => c.id === id);
                          return val > 0 ? (
                            <span key={id} className="text-xs bg-blue-50 px-2 py-0.5 rounded-full text-blue-700">
                              {centro?.nome || id}: R$ {parseFloat(val).toFixed(2)}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-bold text-slate-800">R$ {(m.valor || 0).toFixed(2)}</p>
                      {m.forma_pagamento && <p className="text-xs text-slate-400">{m.forma_pagamento}</p>}
                    </div>
                    <Badge className={statusColors[m.status]}>{m.status}</Badge>
                    {m.status !== "Pago" && m.status !== "Isento" && (
                      <Button size="sm" variant="outline" onClick={() => registrarPagamento(m)} className="border-green-500 text-green-600 hover:bg-green-50">
                        <Check className="w-3 h-3 mr-1" /> Pago
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}