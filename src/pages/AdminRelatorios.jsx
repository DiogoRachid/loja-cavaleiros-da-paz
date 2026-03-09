import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart2, Users, Calendar, DollarSign, TrendingUp, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const CORES = ["#1B3A5F", "#C9A227", "#2563eb", "#16a34a", "#dc2626", "#9333ea"];

export default function AdminRelatorios() {
  const [irmaos, setIrmaos] = useState([]);
  const [sessoes, setSessoes] = useState([]);
  const [mensalidades, setMensalidades] = useState([]);
  const [presencas, setPresencas] = useState([]);

  useEffect(() => { loadDados(); }, []);

  const loadDados = async () => {
    const [ir, s, m, p] = await Promise.all([
      base44.entities.Irmao.list(),
      base44.entities.Sessao.list(),
      base44.entities.Mensalidade.list("-created_date", 200),
      base44.entities.Presenca.list(),
    ]);
    setIrmaos(ir);
    setSessoes(s);
    setMensalidades(m);
    setPresencas(p);
  };

  // --- Membros por Grau ---
  const porGrau = ["Aprendiz", "Companheiro", "Mestre"].map(g => ({
    name: g,
    value: irmaos.filter(i => i.grau === g && i.ativo).length,
  }));

  // --- Membros por Situação ---
  const porSituacao = ["Regular", "Irregular", "Suspenso", "Afastado"].map(s => ({
    name: s,
    value: irmaos.filter(i => i.situacao === s).length,
  })).filter(s => s.value > 0);

  // --- Sessões por Tipo ---
  const tiposSessao = ["Ordinária", "Extraordinária", "Magna", "Pública", "De Instrução", "Fúnebre"];
  const porTipo = tiposSessao.map(t => ({
    name: t.length > 10 ? t.slice(0, 10) + "…" : t,
    value: sessoes.filter(s => s.tipo === t).length,
  })).filter(s => s.value > 0);

  // --- Arrecadação últimos 6 meses ---
  const hoje = new Date();
  const ultimos6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - (5 - i), 1);
    const comp = `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    const rec = mensalidades.filter(m => m.competencia === comp && m.status === "Pago").reduce((a, m) => a + (m.valor || 0), 0);
    return { mes: comp.slice(0, 5), recebido: rec };
  });

  // --- Top 5 Frequência ---
  const sessRealiz = sessoes.filter(s => s.status === "Realizada");
  const topFreq = irmaos
    .filter(i => i.ativo)
    .map(ir => {
      const pres = presencas.filter(p => p.irmao_id === ir.id && p.presente).length;
      const pct = sessRealiz.length > 0 ? Math.round((pres / sessRealiz.length) * 100) : 0;
      return { nome: ir.nome_completo?.split(" ")[0], pct };
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 8);

  // KPIs
  const totalRecebidoAno = mensalidades
    .filter(m => m.status === "Pago" && m.competencia?.endsWith(hoje.getFullYear().toString()))
    .reduce((a, m) => a + (m.valor || 0), 0);
  const inadimplentes = irmaos.filter(ir => {
    const mesAtual = `${String(hoje.getMonth() + 1).padStart(2, "0")}/${hoje.getFullYear()}`;
    return mensalidades.some(m => m.irmao_id === ir.id && m.competencia === mesAtual && (m.status === "Atrasado" || m.status === "Pendente"));
  }).length;

  const exportarCSV = () => {
    const linhas = irmaos.map(i => `"${i.nome_completo}","${i.cim}","${i.grau}","${i.cargo}","${i.situacao}","${i.ativo ? "Ativo" : "Inativo"}"`);
    const csv = ["Nome,CIM,Grau,Cargo,Situação,Status", ...linhas].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "relatorio_irmaos.csv"; a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
            <BarChart2 className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A5F]">Relatórios Gerais</h1>
            <p className="text-slate-500">Visão consolidada da Loja</p>
          </div>
        </div>
        <Button variant="outline" onClick={exportarCSV} className="border-[#1B3A5F] text-[#1B3A5F]">
          <Download className="w-4 h-4 mr-2" /> Exportar Irmãos CSV
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Irmãos Ativos", value: irmaos.filter(i => i.ativo).length, icon: Users, color: "bg-[#1B3A5F]" },
          { label: "Sessões Realizadas", value: sessRealiz.length, icon: Calendar, color: "bg-blue-500" },
          { label: "Arrecadado no Ano", value: `R$ ${totalRecebidoAno.toFixed(0)}`, icon: DollarSign, color: "bg-green-500" },
          { label: "Inadimplentes", value: inadimplentes, icon: TrendingUp, color: "bg-red-500" },
        ].map(c => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg ${c.color} flex items-center justify-center mb-2`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-xl font-bold text-slate-800">{c.value}</p>
                <p className="text-xs text-slate-500">{c.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficos linha 1 */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-[#1B3A5F] text-base">Membros por Grau</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={porGrau} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => `${name}: ${value}`}>
                  {porGrau.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-[#1B3A5F] text-base">Situação dos Membros</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={porSituacao} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => `${name}: ${value}`}>
                  {porSituacao.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Arrecadação */}
      <Card>
        <CardHeader><CardTitle className="text-[#1B3A5F] text-base">Arrecadação — Últimos 6 Meses</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ultimos6}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={v => `R$ ${v.toFixed(2)}`} />
              <Bar dataKey="recebido" name="Recebido" fill="#1B3A5F" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Frequência */}
      {topFreq.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-[#1B3A5F] text-base">Top Frequência (%)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topFreq} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <YAxis dataKey="nome" type="category" tick={{ fontSize: 11 }} width={70} />
                <Tooltip formatter={v => `${v}%`} />
                <Bar dataKey="pct" fill="#C9A227" name="Frequência" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Sessões por tipo */}
      {porTipo.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-[#1B3A5F] text-base">Sessões por Tipo</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={porTipo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" name="Qtd" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}