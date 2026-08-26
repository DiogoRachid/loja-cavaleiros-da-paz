import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { BarChart2, Download, TrendingUp, AlertCircle, CheckCircle, DollarSign, Printer } from "lucide-react";
import { imprimirRelatorio } from "@/lib/relatorio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminRelatorioFinanceiro() {
  const [mensalidades, setMensalidades] = useState([]);
  const [irmaos, setIrmaos] = useState([]);
  const [ano, setAno] = useState(new Date().getFullYear().toString());
  const [dadosLoja, setDadosLoja] = useState(null);

  useEffect(() => { loadDados(); }, []);

  const loadDados = async () => {
    const [m, ir, lojas] = await Promise.all([
      db.Mensalidade.list("-created_date", 200),
      db.Irmao.filter({ ativo: true }),
      db.DadosLoja.list(),
    ]);
    setMensalidades(m);
    setIrmaos(ir);
    setDadosLoja(lojas?.[0] || null);
  };

  const doAno = mensalidades.filter(m => m.competencia?.endsWith(ano));
  const pagos = doAno.filter(m => m.status === "Pago");
  const pendentes = doAno.filter(m => m.status === "Pendente");
  const atrasados = doAno.filter(m => m.status === "Atrasado");
  const totalRecebido = pagos.reduce((acc, m) => acc + (m.valor || 0), 0);
  const totalPendente = [...pendentes, ...atrasados].reduce((acc, m) => acc + (m.valor || 0), 0);

  // Dados por mês
  const meses = ["01","02","03","04","05","06","07","08","09","10","11","12"];
  const nomeMeses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const porMes = meses.map((m, i) => {
    const comp = `${m}/${ano}`;
    const pagosM = mensalidades.filter(mn => mn.competencia === comp && mn.status === "Pago");
    const pendentesM = mensalidades.filter(mn => mn.competencia === comp && mn.status !== "Pago");
    return {
      mes: nomeMeses[i],
      recebido: pagosM.reduce((acc, mn) => acc + (mn.valor || 0), 0),
      pendente: pendentesM.reduce((acc, mn) => acc + (mn.valor || 0), 0),
    };
  });

  // Inadimplentes
  const inadimplentes = irmaos.filter(ir => {
    const mesAtual = `${String(new Date().getMonth() + 1).padStart(2, "0")}/${new Date().getFullYear()}`;
    return mensalidades.some(m => m.irmao_id === ir.id && m.competencia === mesAtual && (m.status === "Atrasado" || m.status === "Pendente"));
  });

  const exportarCSV = () => {
    const linhas = doAno.map(m => `"${m.irmao_nome}","${m.irmao_cim}","${m.competencia}","${m.status}","${m.valor}","${m.data_pagamento || ""}","${m.forma_pagamento || ""}"`);
    const csv = ["Irmão,CIM,Competência,Status,Valor,Data Pagamento,Forma", ...linhas].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `financeiro_${ano}.csv`; a.click();
  };

  const imprimir = () => {
    const rowsMes = porMes
      .map(
        (m) =>
          `<tr><td>${m.mes}/${ano}</td><td>R$ ${m.recebido.toFixed(2)}</td><td>R$ ${m.pendente.toFixed(2)}</td></tr>`
      )
      .join("");
    const rowsInadim = inadimplentes
      .map((ir) => `<tr><td>${ir.nome_completo}</td><td>${ir.numero_glp || "—"}</td></tr>`)
      .join("");

    imprimirRelatorio({
      dadosLoja,
      titulo: "Relatório Financeiro",
      subtitulo: `Exercício ${ano} — Emitido em ${new Date().toLocaleDateString("pt-BR")}`,
      corpo: `
        <p style="font-size:12px">Total recebido: <strong>R$ ${totalRecebido.toFixed(2)}</strong> —
        A receber: <strong>R$ ${totalPendente.toFixed(2)}</strong> —
        Quitações: <strong>${pagos.length}</strong> —
        Inadimplentes: <strong>${inadimplentes.length}</strong></p>
        <table class="rel" style="margin-bottom:24px">
          <thead><tr><th>Competência</th><th>Recebido</th><th>Pendente</th></tr></thead>
          <tbody>${rowsMes}</tbody>
        </table>
        ${inadimplentes.length ? `
        <h3 style="font-size:13px;color:#dc2626;text-transform:uppercase;margin:0 0 8px">Inadimplentes do mês atual</h3>
        <table class="rel"><thead><tr><th>Irmão</th><th>Nº GLP</th></tr></thead><tbody>${rowsInadim}</tbody></table>` : ""}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
            <BarChart2 className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A5F]">Relatório Financeiro</h1>
            <p className="text-slate-500">Exercício {ano}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label>Ano:</Label>
            <Input value={ano} onChange={e => setAno(e.target.value)} className="w-24" />
          </div>
          <Button variant="outline" onClick={exportarCSV} className="border-[#1B3A5F] text-[#1B3A5F]">
            <Download className="w-4 h-4 mr-2" /> Exportar CSV
          </Button>
          <Button onClick={imprimir} className="bg-[#1B3A5F] hover:bg-[#152e4d]">
            <Printer className="w-4 h-4 mr-2" /> Imprimir / PDF
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Recebido", value: `R$ ${totalRecebido.toFixed(2)}`, icon: TrendingUp, color: "bg-green-500" },
          { label: "A Receber", value: `R$ ${totalPendente.toFixed(2)}`, icon: AlertCircle, color: "bg-yellow-500" },
          { label: "Quitações", value: pagos.length, icon: CheckCircle, color: "bg-blue-500" },
          { label: "Inadimplentes", value: inadimplentes.length, icon: DollarSign, color: "bg-red-500" },
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

      {/* Gráfico Mensal */}
      <Card>
        <CardHeader><CardTitle className="text-[#1B3A5F]">Arrecadação Mensal — {ano}</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={porMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `R$ ${v.toFixed(2)}`} />
              <Bar dataKey="recebido" name="Recebido" fill="#1B3A5F" />
              <Bar dataKey="pendente" name="Pendente" fill="#C9A227" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Lista de Inadimplentes */}
      {inadimplentes.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-red-600 text-base">Inadimplentes do Mês Atual</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {inadimplentes.map(ir => (
              <div key={ir.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800 text-sm">{ir.nome_completo}</p>
                  <p className="text-xs text-slate-500">CIM: {ir.cim}</p>
                </div>
                <span className="text-xs text-red-600 font-medium">Em atraso</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}