import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { BarChart2, Users, Calendar, DollarSign, TrendingUp, FileText, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const CORES = ["#1B3A5F", "#C9A227", "#2563eb", "#16a34a", "#dc2626", "#9333ea"];
const LOGO_LOJA = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69aea997b473b479398fe231/0745f3cd0_logolojafundotransparente.png";
const LOGO_GLP = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69aea997b473b479398fe231/a206157c9_LOGOGLP2023.png";

export default function AdminRelatorios() {
  const [irmaos, setIrmaos] = useState([]);
  const [sessoes, setSessoes] = useState([]);
  const [mensalidades, setMensalidades] = useState([]);
  const [presencas, setPresencas] = useState([]);
  const [dadosLoja, setDadosLoja] = useState(null);
  const [gerandoPdf, setGerandoPdf] = useState(false);

  useEffect(() => { loadDados(); }, []);

  const loadDados = async () => {
    const [ir, s, m, p, loja] = await Promise.all([
      db.Irmao.list(),
      db.Sessao.list(),
      db.Mensalidade.list("-created_date", 200),
      db.Presenca.list(),
      db.DadosLoja.list(),
    ]);
    setIrmaos(ir);
    setSessoes(s);
    setMensalidades(m);
    setPresencas(p);
    setDadosLoja(loja[0] || null);
  };

  const porGrau = ["Aprendiz", "Companheiro", "Mestre"].map(g => ({
    name: g,
    value: irmaos.filter(i => i.grau === g && i.ativo).length,
  }));

  const porSituacao = ["Regular", "Irregular", "Suspenso", "Afastado"].map(s => ({
    name: s,
    value: irmaos.filter(i => i.situacao === s).length,
  })).filter(s => s.value > 0);

  const tiposSessao = ["Ordinária", "Extraordinária", "Magna", "Pública", "De Instrução", "Fúnebre"];
  const porTipo = tiposSessao.map(t => ({
    name: t.length > 10 ? t.slice(0, 10) + "…" : t,
    value: sessoes.filter(s => s.tipo === t).length,
  })).filter(s => s.value > 0);

  const hoje = new Date();
  const ultimos6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - (5 - i), 1);
    const comp = `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    const rec = mensalidades.filter(m => m.competencia === comp && m.status === "Pago").reduce((a, m) => a + (m.valor || 0), 0);
    return { mes: comp.slice(0, 5), recebido: rec };
  });

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

  const totalRecebidoAno = mensalidades
    .filter(m => m.status === "Pago" && m.competencia?.endsWith(hoje.getFullYear().toString()))
    .reduce((a, m) => a + (m.valor || 0), 0);

  const inadimplentes = irmaos.filter(ir => {
    const mesAtual = `${String(hoje.getMonth() + 1).padStart(2, "0")}/${hoje.getFullYear()}`;
    return mensalidades.some(m => m.irmao_id === ir.id && m.competencia === mesAtual && (m.status === "Atrasado" || m.status === "Pendente"));
  }).length;

  const gerarPdfIrmaos = () => {
    setGerandoPdf(true);
    const loja = dadosLoja;
    const dataHoje = hoje.toLocaleDateString("pt-BR");
    const rows = irmaos.map((i, idx) => `
      <tr style="background:${idx % 2 === 0 ? "#fff" : "#f8f9fa"}">
        <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:12px">${idx + 1}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:12px;font-weight:500">${i.nome_completo || ""}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:12px">${i.numero_glp || "—"}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:12px">${i.grau || ""}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:12px">${i.cargo && i.cargo !== "Nenhum" ? i.cargo : "—"}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:12px">${i.situacao || ""}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:12px">${i.ativo ? "Ativo" : "Inativo"}</td>
      </tr>`).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Relatorio de Irmaos</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #1a202c; }
      @media print { body { padding: 10px; } }
    </style>
    </head><body>
    <!-- Cabeçalho -->
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1B3A5F;padding-bottom:16px;margin-bottom:16px">
      <img src="${LOGO_LOJA}" style="height:80px;object-fit:contain" />
      <div style="text-align:center;flex:1;padding:0 20px">
        <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px">${loja?.potencia || "Grande Loja Maçônica do Paraná"}</p>
        <h1 style="margin:4px 0;font-size:18px;color:#1B3A5F;font-weight:bold">${loja?.nome || "Loja Cavaleiros da Paz"} Nº ${loja?.numero || "25"}</h1>
        <p style="margin:0;font-size:12px;color:#475569">${loja?.oriente ? `Oriente de ${loja.oriente}` : ""}</p>
        <p style="margin:0;font-size:12px;color:#475569">${loja?.endereco || ""}</p>
      </div>
      <img src="${LOGO_GLP}" style="height:80px;object-fit:contain" />
    </div>
    <!-- Título do relatório -->
    <div style="text-align:center;margin-bottom:20px">
      <h2 style="margin:0;font-size:16px;color:#1B3A5F;font-weight:bold;text-transform:uppercase;letter-spacing:1px">Quadro de Irmãos</h2>
      <p style="margin:4px 0 0;font-size:11px;color:#64748b">Exercício ${hoje.getFullYear()} — Emitido em ${dataHoje}</p>
    </div>
    <!-- Resumo -->
    <div style="display:flex;gap:16px;margin-bottom:20px;flex-wrap:wrap">
      <div style="flex:1;min-width:120px;background:#1B3A5F;color:white;border-radius:8px;padding:12px;text-align:center">
        <p style="margin:0;font-size:22px;font-weight:bold">${irmaos.filter(i => i.ativo).length}</p>
        <p style="margin:0;font-size:11px;opacity:0.8">Irmãos Ativos</p>
      </div>
      <div style="flex:1;min-width:120px;background:#16a34a;color:white;border-radius:8px;padding:12px;text-align:center">
        <p style="margin:0;font-size:22px;font-weight:bold">${irmaos.filter(i => i.situacao === "Regular").length}</p>
        <p style="margin:0;font-size:11px;opacity:0.8">Regulares</p>
      </div>
      <div style="flex:1;min-width:120px;background:#dc2626;color:white;border-radius:8px;padding:12px;text-align:center">
        <p style="margin:0;font-size:22px;font-weight:bold">${irmaos.filter(i => i.situacao === "Irregular").length}</p>
        <p style="margin:0;font-size:11px;opacity:0.8">Irregulares</p>
      </div>
      <div style="flex:1;min-width:120px;background:#C9A227;color:#1B3A5F;border-radius:8px;padding:12px;text-align:center">
        <p style="margin:0;font-size:22px;font-weight:bold">${irmaos.filter(i => i.grau === "Mestre").length}</p>
        <p style="margin:0;font-size:11px">Mestres</p>
      </div>
    </div>
    <!-- Tabela -->
    <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0">
      <thead>
        <tr style="background:#1B3A5F;color:white">
          <th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:600">#</th>
          <th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:600">Nome Completo</th>
          <th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:600">Nº GLP</th>
          <th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:600">Grau</th>
          <th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:600">Cargo</th>
          <th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:600">Situação</th>
          <th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:600">Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <!-- Rodapé -->
    <div style="margin-top:32px;border-top:1px solid #e2e8f0;padding-top:12px;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8">
      <span>${loja?.nome || "Loja Cavaleiros da Paz"} Nº ${loja?.numero || "25"} — ${loja?.potencia || "GLPR"}</span>
      <span>Documento gerado em ${dataHoje}</span>
    </div>
    <script>window.onload = function(){ window.print(); }</script>
    </body></html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    setGerandoPdf(false);
  };

  const gerarPdfFinanceiro = () => {
    const loja = dadosLoja;
    const dataHoje = hoje.toLocaleDateString("pt-BR");
    const mesAtual = `${String(hoje.getMonth() + 1).padStart(2, "0")}/${hoje.getFullYear()}`;

    const inadimList = irmaos.filter(ir =>
      mensalidades.some(m => m.irmao_id === ir.id && m.competencia === mesAtual && (m.status === "Atrasado" || m.status === "Pendente"))
    );

    const rows6meses = ultimos6.map(m => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:12px">${m.mes}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:12px;font-weight:600;color:#16a34a">R$ ${m.recebido.toFixed(2)}</td>
      </tr>`).join("");

    const rowsInadim = inadimList.map((ir, idx) => `
      <tr style="background:${idx % 2 === 0 ? "#fff" : "#fef2f2"}">
        <td style="padding:6px 10px;border-bottom:1px solid #fecaca;font-size:12px">${ir.nome_completo}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #fecaca;font-size:12px">${ir.numero_glp || "—"}</td>
      </tr>`).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Relatorio Financeiro</title>
    <style>body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #1a202c; } @media print { body { padding:10px; }}</style>
    </head><body>
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1B3A5F;padding-bottom:16px;margin-bottom:16px">
      <img src="${LOGO_LOJA}" style="height:80px;object-fit:contain" />
      <div style="text-align:center;flex:1;padding:0 20px">
        <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px">${loja?.potencia || "Grande Loja Maçônica do Paraná"}</p>
        <h1 style="margin:4px 0;font-size:18px;color:#1B3A5F;font-weight:bold">${loja?.nome || "Loja Cavaleiros da Paz"} Nº ${loja?.numero || "25"}</h1>
        <p style="margin:0;font-size:12px;color:#475569">${loja?.oriente ? `Oriente de ${loja.oriente}` : ""}</p>
      </div>
      <img src="${LOGO_GLP}" style="height:80px;object-fit:contain" />
    </div>
    <div style="text-align:center;margin-bottom:20px">
      <h2 style="margin:0;font-size:16px;color:#1B3A5F;font-weight:bold;text-transform:uppercase;letter-spacing:1px">Relatório Financeiro</h2>
      <p style="margin:4px 0 0;font-size:11px;color:#64748b">Exercício ${hoje.getFullYear()} — Emitido em ${dataHoje}</p>
    </div>
    <div style="display:flex;gap:16px;margin-bottom:24px;flex-wrap:wrap">
      <div style="flex:1;min-width:140px;background:#1B3A5F;color:white;border-radius:8px;padding:14px;text-align:center">
        <p style="margin:0;font-size:20px;font-weight:bold">R$ ${totalRecebidoAno.toFixed(2)}</p>
        <p style="margin:0;font-size:11px;opacity:0.8">Arrecadado em ${hoje.getFullYear()}</p>
      </div>
      <div style="flex:1;min-width:140px;background:#dc2626;color:white;border-radius:8px;padding:14px;text-align:center">
        <p style="margin:0;font-size:20px;font-weight:bold">${inadimList.length}</p>
        <p style="margin:0;font-size:11px;opacity:0.8">Inadimplentes (${mesAtual})</p>
      </div>
    </div>
    <h3 style="font-size:13px;font-weight:bold;color:#1B3A5F;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.5px">Arrecadação — Últimos 6 Meses</h3>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;margin-bottom:24px">
      <thead><tr style="background:#1B3A5F;color:white">
        <th style="padding:8px 12px;text-align:left;font-size:11px">Mês</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px">Recebido</th>
      </tr></thead>
      <tbody>${rows6meses}</tbody>
    </table>
    ${inadimList.length > 0 ? `
    <h3 style="font-size:13px;font-weight:bold;color:#dc2626;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.5px">Inadimplentes — ${mesAtual}</h3>
    <table style="width:100%;border-collapse:collapse;border:1px solid #fecaca">
      <thead><tr style="background:#dc2626;color:white">
        <th style="padding:8px 10px;text-align:left;font-size:11px">Nome</th>
        <th style="padding:8px 10px;text-align:left;font-size:11px">Nº GLP</th>
      </tr></thead>
      <tbody>${rowsInadim}</tbody>
    </table>` : ""}
    <div style="margin-top:32px;border-top:1px solid #e2e8f0;padding-top:12px;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8">
      <span>${loja?.nome || "Loja Cavaleiros da Paz"} Nº ${loja?.numero || "25"} — ${loja?.potencia || "GLPR"}</span>
      <span>Documento gerado em ${dataHoje}</span>
    </div>
    <script>window.onload = function(){ window.print(); }</script>
    </body></html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
  };

  const gerarPdfPresencas = () => {
    const loja = dadosLoja;
    const dataHoje = hoje.toLocaleDateString("pt-BR");

    const rows = sessRealiz.slice(0, 20).map((s, idx) => {
      const totalPresentes = presencas.filter(p => p.sessao_id === s.id && p.presente).length;
      const totalIrmaos = irmaos.filter(i => i.ativo).length;
      const pct = totalIrmaos > 0 ? Math.round((totalPresentes / totalIrmaos) * 100) : 0;
      return `<tr style="background:${idx % 2 === 0 ? "#fff" : "#f8f9fa"}">
        <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:12px">${s.data || ""}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:12px">${s.tipo || ""}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:12px;text-align:center">${totalPresentes}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:12px;text-align:center">${totalIrmaos - totalPresentes}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:12px;text-align:center;font-weight:600;color:${pct >= 50 ? "#16a34a" : "#dc2626"}">${pct}%</td>
      </tr>`;
    }).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Relatorio de Presencas</title>
    <style>body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #1a202c; } @media print { body { padding:10px; }}</style>
    </head><body>
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1B3A5F;padding-bottom:16px;margin-bottom:16px">
      <img src="${LOGO_LOJA}" style="height:80px;object-fit:contain" />
      <div style="text-align:center;flex:1;padding:0 20px">
        <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px">${loja?.potencia || "Grande Loja Maçônica do Paraná"}</p>
        <h1 style="margin:4px 0;font-size:18px;color:#1B3A5F;font-weight:bold">${loja?.nome || "Loja Cavaleiros da Paz"} Nº ${loja?.numero || "25"}</h1>
        <p style="margin:0;font-size:12px;color:#475569">${loja?.oriente ? `Oriente de ${loja.oriente}` : ""}</p>
      </div>
      <img src="${LOGO_GLP}" style="height:80px;object-fit:contain" />
    </div>
    <div style="text-align:center;margin-bottom:20px">
      <h2 style="margin:0;font-size:16px;color:#1B3A5F;font-weight:bold;text-transform:uppercase;letter-spacing:1px">Relatório de Presenças</h2>
      <p style="margin:4px 0 0;font-size:11px;color:#64748b">Sessões Realizadas — Emitido em ${dataHoje}</p>
    </div>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0">
      <thead><tr style="background:#1B3A5F;color:white">
        <th style="padding:8px 10px;text-align:left;font-size:11px">Data</th>
        <th style="padding:8px 10px;text-align:left;font-size:11px">Tipo</th>
        <th style="padding:8px 10px;text-align:center;font-size:11px">Presentes</th>
        <th style="padding:8px 10px;text-align:center;font-size:11px">Ausentes</th>
        <th style="padding:8px 10px;text-align:center;font-size:11px">Frequência</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="margin-top:32px;border-top:1px solid #e2e8f0;padding-top:12px;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8">
      <span>${loja?.nome || "Loja Cavaleiros da Paz"} Nº ${loja?.numero || "25"} — ${loja?.potencia || "GLPR"}</span>
      <span>Documento gerado em ${dataHoje}</span>
    </div>
    <script>window.onload = function(){ window.print(); }</script>
    </body></html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
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
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={gerarPdfIrmaos} className="border-[#1B3A5F] text-[#1B3A5F]">
            <FileText className="w-4 h-4 mr-2" /> PDF Irmãos
          </Button>
          <Button variant="outline" onClick={gerarPdfFinanceiro} className="border-green-600 text-green-700">
            <FileText className="w-4 h-4 mr-2" /> PDF Financeiro
          </Button>
          <Button variant="outline" onClick={gerarPdfPresencas} className="border-blue-600 text-blue-700">
            <FileText className="w-4 h-4 mr-2" /> PDF Presenças
          </Button>
        </div>
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

      {/* Gráficos */}
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