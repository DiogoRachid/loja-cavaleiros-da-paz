import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { DollarSign, Plus, Save, X, Search, Filter, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusColors = {
  Pago: "bg-green-100 text-green-800",
  Pendente: "bg-yellow-100 text-yellow-800",
  Atrasado: "bg-red-100 text-red-800",
  Isento: "bg-slate-100 text-slate-600",
};

const FORM_VAZIO = {
  irmao_id: "", irmao_nome: "", irmao_cim: "",
  competencia: "", valor: "", vencimento: "",
  data_pagamento: "", status: "Pendente",
  forma_pagamento: "", observacoes: ""
};

export default function AdminMensalidades() {
  const [mensalidades, setMensalidades] = useState([]);
  const [irmaos, setIrmaos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [saving, setSaving] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroComp, setFiltroComp] = useState("");
  const admin = JSON.parse(sessionStorage.getItem("admin_data") || "{}");

  useEffect(() => { loadDados(); }, []);

  const loadDados = async () => {
    const [m, ir] = await Promise.all([
      base44.entities.Mensalidade.list("-created_date", 100),
      base44.entities.Irmao.filter({ ativo: true }),
    ]);
    setMensalidades(m);
    setIrmaos(ir);
  };

  const handleIrmaoChange = (id) => {
    const ir = irmaos.find(i => i.id === id);
    setForm({ ...form, irmao_id: id, irmao_nome: ir?.nome_completo || "", irmao_cim: ir?.numero_glp || "" });
  };

  const salvar = async () => {
    setSaving(true);
    await base44.entities.Mensalidade.create({
      ...form,
      valor: parseFloat(form.valor) || 0,
      registrado_por: admin.nome_completo || "",
    });
    await loadDados();
    setShowForm(false);
    setForm(FORM_VAZIO);
    setSaving(false);
  };

  const registrarPagamento = async (m) => {
    await base44.entities.Mensalidade.update(m.id, {
      status: "Pago",
      data_pagamento: new Date().toISOString().split("T")[0],
    });
    await loadDados();
  };

  const gerarMensalidadesMes = async () => {
    const comp = prompt("Competência (MM/AAAA):", `${String(new Date().getMonth() + 1).padStart(2, "0")}/${new Date().getFullYear()}`);
    if (!comp) return;
    const dadosLoja = await base44.entities.DadosLoja.list();
    const valorPadrao = dadosLoja[0]?.valor_mensalidade || 50;
    const [mes, ano] = comp.split("/");
    const vencimento = `${ano}-${mes}-10`;
    for (const ir of irmaos) {
      const existente = mensalidades.find(m => m.irmao_id === ir.id && m.competencia === comp);
      if (!existente) {
        await base44.entities.Mensalidade.create({
          irmao_id: ir.id, irmao_nome: ir.nome_completo, irmao_cim: ir.numero_glp,
          competencia: comp, valor: valorPadrao, vencimento,
          status: "Pendente", registrado_por: admin.nome_completo || "",
        });
      }
    }
    await loadDados();
  };

  const filtradas = mensalidades.filter(m => {
    const matchBusca = !busca || m.irmao_nome?.toLowerCase().includes(busca.toLowerCase()) || m.irmao_cim?.includes(busca) || m.irmao_nome?.includes(busca);
    const matchStatus = filtroStatus === "Todos" || m.status === filtroStatus;
    const matchComp = !filtroComp || m.competencia?.includes(filtroComp);
    return matchBusca && matchStatus && matchComp;
  });

  const totalFiltrado = filtradas.filter(m => m.status === "Pago").reduce((acc, m) => acc + (m.valor || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A5F]">Mensalidades</h1>
            <p className="text-slate-500">{mensalidades.length} lançamentos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={gerarMensalidadesMes} className="border-[#1B3A5F] text-[#1B3A5F]">
            Gerar Mês
          </Button>
          <Button onClick={() => setShowForm(!showForm)} className="bg-[#1B3A5F] text-white">
            <Plus className="w-4 h-4 mr-2" /> Lançar
          </Button>
        </div>
      </div>

      {/* Resumo */}
      <Card className="bg-[#1B3A5F] text-white">
        <CardContent className="p-4 flex items-center justify-between">
          <p className="text-slate-200 text-sm">Total Recebido (filtro atual)</p>
          <p className="text-2xl font-bold text-[#C9A227]">R$ {totalFiltrado.toFixed(2)}</p>
        </CardContent>
      </Card>

      {/* Formulário */}
      {showForm && (
        <Card className="border-[#C9A227]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[#1B3A5F]">Novo Lançamento</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Irmão *</Label>
                <Select value={form.irmao_id} onValueChange={handleIrmaoChange}>
                  <SelectTrigger><SelectValue placeholder="Selecionar irmão..." /></SelectTrigger>
                  <SelectContent>{irmaos.map(i => <SelectItem key={i.id} value={i.id}>{i.nome_completo}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Competência * (MM/AAAA)</Label>
                <Input value={form.competencia} onChange={e => setForm({ ...form, competencia: e.target.value })} placeholder="03/2026" />
              </div>
              <div className="space-y-1">
                <Label>Valor *</Label>
                <Input type="number" step="0.01" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} placeholder="0.00" />
              </div>
              <div className="space-y-1">
                <Label>Vencimento</Label>
                <Input type="date" value={form.vencimento} onChange={e => setForm({ ...form, vencimento: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Pendente","Pago","Atrasado","Isento"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Forma de Pagamento</Label>
                <Select value={form.forma_pagamento} onValueChange={v => setForm({ ...form, forma_pagamento: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                  <SelectContent>{["Dinheiro","PIX","Transferência","Outro"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {form.status === "Pago" && (
                <div className="space-y-1">
                  <Label>Data de Pagamento</Label>
                  <Input type="date" value={form.data_pagamento} onChange={e => setForm({ ...form, data_pagamento: e.target.value })} />
                </div>
              )}
              <div className="space-y-1 md:col-span-2">
                <Label>Observações</Label>
                <Input value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={salvar} disabled={saving} className="bg-[#1B3A5F] text-white">
                <Save className="w-4 h-4 mr-2" />{saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Lista */}
      <div className="space-y-2">
        {filtradas.length === 0 && <Card><CardContent className="p-8 text-center text-slate-400">Nenhum lançamento encontrado.</CardContent></Card>}
        {filtradas.map(m => (
          <Card key={m.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">{m.irmao_nome}</p>
                <p className="text-xs text-slate-500">GLP: {m.irmao_cim} • Competência: {m.competencia} • Venc: {m.vencimento}</p>
                {m.observacoes && <p className="text-xs text-slate-400 mt-0.5">{m.observacoes}</p>}
              </div>
              <div className="flex items-center gap-3">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}