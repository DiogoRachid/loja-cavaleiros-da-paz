import { useState, useEffect } from "react";
import { db } from "@/api/db";
import { BarChart2, Search, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminFrequencias() {
  const [irmaos, setIrmaos] = useState([]);
  const [sessoes, setSessoes] = useState([]);
  const [presencas, setPresencas] = useState([]);
  const [busca2, setBusca2] = useState("");

  useEffect(() => { loadDados(); }, []);

  const loadDados = async () => {
    const [ir, s, p] = await Promise.all([
      db.Irmao.filter({ ativo: true }, "nome_completo", 500),
      db.Sessao.filter({ status: "Realizada" }, "-data", 500),
      db.Presenca.list("-created_date", 5000),
    ]);
    setIrmaos(ir);
    setSessoes(s);
    setPresencas(p);
  };

  const getFrequencia = (irmaoId) => {
    if (!sessoes.length) return { presentes: 0, total: 0, pct: 0 };
    const total = sessoes.length;
    const presentes = presencas.filter(p => p.irmao_id === irmaoId && p.presente).length;
    return { presentes, total, pct: total > 0 ? Math.round((presentes / total) * 100) : 0 };
  };

  const irmaosOrdenados = [...irmaos].sort((a, b) =>
    (a.nome_completo || "").localeCompare(b.nome_completo || "", "pt-BR")
  );

  const filtrados = irmaosOrdenados.filter(i =>
    !busca2 || i.nome_completo?.toLowerCase().includes(busca2.toLowerCase())
  ).map(ir => ({ ...ir, freq: getFrequencia(ir.id) }));

  const dadosGrafico = [...filtrados]
    .sort((a, b) => b.freq.pct - a.freq.pct)
    .slice(0, 10)
    .map(ir => ({ nome: ir.nome_completo?.split(" ")[0], pct: ir.freq.pct }));

  const exportarCSV = () => {
    const linhas = filtrados.map(i => `"${i.nome_completo}","${i.cim}","${i.freq.presentes}","${i.freq.total}","${i.freq.pct}%"`);
    const csv = ["Nome,CIM,Presenças,Total Sessões,Frequência", ...linhas].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "frequencias.csv"; a.click();
  };

  const corFreq = (pct) => {
    if (pct >= 75) return "bg-green-100 text-green-800";
    if (pct >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
            <BarChart2 className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A5F]">Relatório de Frequências</h1>
            <p className="text-slate-500">{sessoes.length} sessões realizadas</p>
          </div>
        </div>
        <Button variant="outline" onClick={exportarCSV} className="border-[#1B3A5F] text-[#1B3A5F]">
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      {dadosGrafico.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-[#1B3A5F] text-base">Top 10 Frequência (%)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={v => `${v}%`} />
                <Bar dataKey="pct" fill="#1B3A5F" name="Frequência" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input value={busca2} onChange={e => setBusca2(e.target.value)} placeholder="Buscar irmão..." className="pl-9" />
      </div>

      <div className="space-y-2">
        {filtrados.map(ir => (
          <Card key={ir.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1B3A5F]/10 flex items-center justify-center font-bold text-[#1B3A5F]">
                  {ir.nome_completo?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-slate-800">{ir.nome_completo}</p>
                  <p className="text-xs text-slate-500">CIM: {ir.numero_glp}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-slate-600">{ir.freq.presentes}/{ir.freq.total} sessões</p>
                </div>
                <Badge className={corFreq(ir.freq.pct)}>{ir.freq.pct}%</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtrados.length === 0 && <Card><CardContent className="p-8 text-center text-slate-400">Nenhum dado encontrado.</CardContent></Card>}
      </div>
    </div>
  );
}