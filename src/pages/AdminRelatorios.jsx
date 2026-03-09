import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart as BarChartIcon, Download, Users, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#1B3A5F", "#C9A227", "#22c55e", "#ef4444"];

export default function AdminRelatorios() {
  const [dados, setDados] = useState({ irmaos: [], mensalidades: [], sessoes: [] });

  useEffect(() => { loadDados(); }, []);

  const loadDados = async () => {
    const [irmaos, mensalidades, sessoes] = await Promise.all([
      base44.entities.Irmao.filter({ ativo: true }),
      base44.entities.Mensalidade.list("-created_date", 100),
      base44.entities.Sessao.list("-data", 20),
    ]);
    setDados({ irmaos, mensalidades, sessoes });
  };

  const porGrau = [
    { name: "Aprendiz", value: dados.irmaos.filter(i => i.grau === "Aprendiz").length },
    { name: "Companheiro", value: dados.irmaos.filter(i => i.grau === "Companheiro").length },
    { name: "Mestre", value: dados.irmaos.filter(i => i.grau === "Mestre").length },
  ];

  const porSituacao = [
    { name: "Regular", value: dados.irmaos.filter(i => i.situacao === "Regular").length },
    { name: "Irregular", value: dados.irmaos.filter(i => i.situacao === "Irregular").length },
    { name: "Suspenso", value: dados.irmaos.filter(i => i.situacao === "Suspenso").length },
    { name: "Afastado", value: dados.irmaos.filter(i => i.situacao === "Afastado").length },
  ];

  const mensalidadesPorStatus = [
    { name: "Pago", value: dados.mensalidades.filter(m => m.status === "Pago").length },
    { name: "Pendente", value: dados.mensalidades.filter(m => m.status === "Pendente").length },
    { name: "Atrasado", value: dados.mensalidades.filter(m => m.status === "Atrasado").length },
  ];

  const sessoesPorTipo = ["Ordinária","Extraordinária","Magna","Pública"].map(tipo => ({
    name: tipo, value: dados.sessoes.filter(s => s.tipo === tipo).length
  }));

  const exportarCSV = (lista, nome) => {
    if (!lista.length) return;
    const keys = Object.keys(lista[0]);
    const csv = [keys.join(","), ...lista.map(row => keys.map(k => `"${row[k] || ""}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${nome}.csv`; a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
            <BarChartIcon className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A5F]">Relatórios Executivos</h1>
            <p className="text-slate-500">Visão consolidada da loja</p>
          </div>
        </div>
      </div>

      {/* Cards KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Irmãos", value: dados.irmaos.length, icon: Users },
          { label: "Mensalidades OK", value: dados.mensalidades.filter(m => m.status === "Pago").length, icon: DollarSign },
          { label: "Sessões Realizadas", value: dados.sessoes.filter(s => s.status === "Realizada").length, icon: Calendar },
          { label: "Taxa Regularidade", value: dados.irmaos.length > 0 ? `${Math.round((dados.irmaos.filter(i => i.situacao === "Regular").length / dados.irmaos.length) * 100)}%` : "0%", icon: TrendingUp },
        ].map(c => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#1B3A5F] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#C9A227]" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-800">{c.value}</p>
                  <p className="text-xs text-slate-500">{c.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Membros por Grau */}
        <Card>
          <CardHeader><CardTitle className="text-[#1B3A5F] text-base">Membros por Grau</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={porGrau} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                  {porGrau.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Mensalidades por Status */}
        <Card>
          <CardHeader><CardTitle className="text-[#1B3A5F] text-base">Mensalidades por Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={mensalidadesPorStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#1B3A5F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Situação dos Membros */}
        <Card>
          <CardHeader><CardTitle className="text-[#1B3A5F] text-base">Situação dos Membros</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={porSituacao}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#C9A227" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sessões por Tipo */}
        <Card>
          <CardHeader><CardTitle className="text-[#1B3A5F] text-base">Sessões por Tipo</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sessoesPorTipo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Exportações */}
      <Card>
        <CardHeader><CardTitle className="text-[#1B3A5F]">Exportar Dados</CardTitle></CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          <Button variant="outline" onClick={() => exportarCSV(dados.irmaos, "membros")} className="border-[#1B3A5F] text-[#1B3A5F]">
            <Download className="w-4 h-4 mr-2" /> Membros CSV
          </Button>
          <Button variant="outline" onClick={() => exportarCSV(dados.mensalidades, "mensalidades")} className="border-[#1B3A5F] text-[#1B3A5F]">
            <Download className="w-4 h-4 mr-2" /> Mensalidades CSV
          </Button>
          <Button variant="outline" onClick={() => exportarCSV(dados.sessoes, "sessoes")} className="border-[#1B3A5F] text-[#1B3A5F]">
            <Download className="w-4 h-4 mr-2" /> Sessões CSV
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}