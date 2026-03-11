import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Save, RefreshCw, ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PlanilhaLancamento({ irmaos, centrosAtivos, onSalvo }) {
  const admin = JSON.parse(sessionStorage.getItem("admin_data") || "{}");

  const hoje = new Date();
  const mesAtual = `${String(hoje.getMonth() + 1).padStart(2, "0")}/${hoje.getFullYear()}`;
  const [competencia, setCompetencia] = useState(mesAtual);
  const [vencimento, setVencimento] = useState(`${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-10`);
  const [valorMensalidade, setValorMensalidade] = useState("");
  const [linhas, setLinhas] = useState([]);
  const [saving, setSaving] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [sortCol, setSortCol] = useState("irmao_nome");
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => {
    if (irmaos.length > 0) inicializarLinhas();
  }, [irmaos, centrosAtivos]);

  const inicializarLinhas = () => {
    const rows = irmaos.map(ir => {
      const cc = {};
      centrosAtivos.forEach(c => { cc[c.id] = ""; });
      return {
        irmao_id: ir.id,
        irmao_nome: ir.nome_completo,
        irmao_cim: ir.numero_glp,
        mensalidade: "",
        centros_custo: cc,
        status: "Pendente",
        existente_id: null,
      };
    });
    setLinhas(rows);
  };

  const carregarCompetencia = async () => {
    if (!competencia) return;
    setCarregando(true);
    const dados = await base44.entities.Mensalidade.filter({ competencia });
    const dadosLoja = await base44.entities.DadosLoja.list();
    const valorPadrao = dadosLoja[0]?.valor_mensalidade || 0;

    setLinhas(irmaos.map(ir => {
      const ex = dados.find(d => d.irmao_id === ir.id);
      const cc = {};
      centrosAtivos.forEach(c => {
        cc[c.id] = ex?.centros_custo?.[c.id] != null ? String(ex.centros_custo[c.id]) : "";
      });
      return {
        irmao_id: ir.id,
        irmao_nome: ir.nome_completo,
        irmao_cim: ir.numero_glp,
        mensalidade: ex?.valor_mensalidade != null ? String(ex.valor_mensalidade) : String(valorPadrao),
        centros_custo: cc,
        status: ex?.status || "Pendente",
        existente_id: ex?.id || null,
      };
    }));

    if (dados.length > 0 && dados[0].vencimento) setVencimento(dados[0].vencimento);
    setCarregando(false);
  };

  const calcularTotal = (linha) => {
    const m = parseFloat(linha.mensalidade) || 0;
    const cc = Object.values(linha.centros_custo).reduce((a, v) => a + (parseFloat(v) || 0), 0);
    return m + cc;
  };

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const getValorSort = (linha, col) => {
    if (col === "irmao_nome") return linha.irmao_nome;
    if (col === "mensalidade") return parseFloat(linha.mensalidade) || 0;
    if (col === "total") return calcularTotal(linha);
    if (col === "status") return linha.status;
    return parseFloat(linha.centros_custo[col]) || 0;
  };

  const sortedLinhas = [...linhas].sort((a, b) => {
    const valA = getValorSort(a, sortCol);
    const valB = getValorSort(b, sortCol);
    if (typeof valA === "string") return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    return sortDir === "asc" ? valA - valB : valB - valA;
  });

  const setValorCC = (irmaoId, ccId, val) => {
    setLinhas(prev => prev.map(l =>
      l.irmao_id === irmaoId ? { ...l, centros_custo: { ...l.centros_custo, [ccId]: val } } : l
    ));
  };

  const setMensalidadeLinha = (irmaoId, val) => {
    setLinhas(prev => prev.map(l => l.irmao_id === irmaoId ? { ...l, mensalidade: val } : l));
  };

  const setStatusLinha = (irmaoId, val) => {
    setLinhas(prev => prev.map(l => l.irmao_id === irmaoId ? { ...l, status: val } : l));
  };

  const aplicarMensalidadeGlobal = () => {
    if (!valorMensalidade) return;
    setLinhas(prev => prev.map(l => ({ ...l, mensalidade: valorMensalidade })));
  };

  const salvarTudo = async () => {
    setSaving(true);
    for (const linha of linhas) {
      const ccMap = {};
      centrosAtivos.forEach(c => {
        const v = parseFloat(linha.centros_custo[c.id]);
        if (!isNaN(v) && v > 0) ccMap[c.id] = v;
      });
      const payload = {
        irmao_id: linha.irmao_id,
        irmao_nome: linha.irmao_nome,
        irmao_cim: linha.irmao_cim,
        competencia,
        valor_mensalidade: parseFloat(linha.mensalidade) || 0,
        valor: calcularTotal(linha),
        centros_custo: ccMap,
        vencimento,
        status: linha.status,
        registrado_por: admin.nome_completo || "",
      };
      if (linha.existente_id) {
        await base44.entities.Mensalidade.update(linha.existente_id, payload);
      } else {
        await base44.entities.Mensalidade.create(payload);
      }
    }
    setSaving(false);
    onSalvo();
    await carregarCompetencia();
  };

  const totalGeral = linhas.reduce((a, l) => a + calcularTotal(l), 0);
  const totalPago = linhas.filter(l => l.status === "Pago").reduce((a, l) => a + calcularTotal(l), 0);

  const colunas = [
    { col: "irmao_nome", label: "Irmão", align: "left", sticky: true, minW: "160px" },
    { col: "mensalidade", label: "Mensalidade", align: "center", minW: "100px" },
    ...centrosAtivos.map(c => ({ col: c.id, label: c.nome, align: "center", minW: "100px" })),
    { col: "total", label: "Total", align: "center", minW: "100px" },
    { col: "status", label: "Status", align: "center", minW: "110px" },
  ];

  return (
    <Card className="border-[#C9A227]">
      <CardHeader className="pb-2">
        <CardTitle className="text-[#1B3A5F]">Planilha de Lançamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Config do mês */}
        <div className="flex flex-wrap gap-3 items-end bg-slate-50 p-3 rounded-lg">
          <div className="space-y-1">
            <Label className="text-xs">Competência *</Label>
            <Input value={competencia} onChange={e => setCompetencia(e.target.value)} placeholder="MM/AAAA" className="w-32" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Vencimento *</Label>
            <Input type="date" value={vencimento} onChange={e => setVencimento(e.target.value)} className="w-40" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Mensalidade padrão (R$)</Label>
            <div className="flex gap-1">
              <Input type="number" step="0.01" value={valorMensalidade} onChange={e => setValorMensalidade(e.target.value)} placeholder="0.00" className="w-28" />
              <Button size="sm" variant="outline" onClick={aplicarMensalidadeGlobal} className="text-xs border-[#1B3A5F] text-[#1B3A5F]">
                Aplicar a todos
              </Button>
            </div>
          </div>
          <Button onClick={carregarCompetencia} disabled={carregando} variant="outline" className="border-slate-400 flex items-center gap-1">
            <RefreshCw className={`w-3 h-3 ${carregando ? "animate-spin" : ""}`} />
            Carregar
          </Button>
        </div>

        {/* Planilha */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1B3A5F] text-white">
                {colunas.map(({ col, label, align, sticky, minW }) => (
                  <th
                    key={col}
                    className={`px-3 py-2 font-medium cursor-pointer select-none hover:bg-white/10 transition-colors ${align === "left" ? "text-left" : "text-center"} ${sticky ? "sticky left-0 bg-[#1B3A5F]" : ""}`}
                    style={{ minWidth: minW }}
                    onClick={() => handleSort(col)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {label}
                      {sortCol === col
                        ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
                        : <ChevronsUpDown className="w-3 h-3 opacity-40" />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedLinhas.map((linha, idx) => {
                const total = calcularTotal(linha);
                return (
                  <tr key={linha.irmao_id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="px-3 py-1.5 sticky left-0 bg-inherit">
                      <p className="font-medium text-slate-800 text-xs leading-tight">{linha.irmao_nome}</p>
                      <p className="text-slate-400 text-xs">GLP: {linha.irmao_cim}</p>
                    </td>
                    <td className="px-2 py-1">
                      <Input
                        type="number" step="0.01"
                        value={linha.mensalidade}
                        onChange={e => setMensalidadeLinha(linha.irmao_id, e.target.value)}
                        className="w-24 h-7 text-xs text-center mx-auto"
                        placeholder="0.00"
                      />
                    </td>
                    {centrosAtivos.map(c => (
                      <td key={c.id} className="px-2 py-1">
                        <Input
                          type="number" step="0.01"
                          value={linha.centros_custo[c.id] || ""}
                          onChange={e => setValorCC(linha.irmao_id, c.id, e.target.value)}
                          className="w-24 h-7 text-xs text-center mx-auto"
                          placeholder="0.00"
                        />
                      </td>
                    ))}
                    <td className="px-3 py-1 text-center">
                      <span className={`font-bold text-sm ${total > 0 ? "text-[#1B3A5F]" : "text-slate-400"}`}>
                        R$ {total.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-2 py-1">
                      <select
                        value={linha.status}
                        onChange={e => setStatusLinha(linha.irmao_id, e.target.value)}
                        className={`text-xs rounded-full px-2 py-0.5 border-0 font-medium cursor-pointer ${
                          linha.status === "Pago" ? "bg-green-100 text-green-800" :
                          linha.status === "Atrasado" ? "bg-red-100 text-red-800" :
                          linha.status === "Isento" ? "bg-slate-100 text-slate-600" :
                          "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {["Pendente","Pago","Atrasado","Isento"].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#1B3A5F]/10 font-semibold">
                <td className="px-3 py-2 text-[#1B3A5F] text-xs">Totais</td>
                <td></td>
                {centrosAtivos.map(c => <td key={c.id}></td>)}
                <td className="px-3 py-2 text-center text-[#1B3A5F]">R$ {totalGeral.toFixed(2)}</td>
                <td className="px-3 py-2 text-center text-green-700 text-xs">Pago: R$ {totalPago.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex justify-end">
          <Button onClick={salvarTudo} disabled={saving} className="bg-[#1B3A5F] text-white">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : `Salvar ${linhas.length} lançamentos`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}