import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Gavel, Plus, Calendar, Edit2, Trash2, X, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const statusColors = { Agendada: "bg-blue-100 text-blue-800", Realizada: "bg-green-100 text-green-800", Cancelada: "bg-red-100 text-red-800" };

const FORM_VAZIO = { numero: "", data: "", hora: "19:30", tipo: "Ordinária", grau: "Mestre", pauta: "", local: "Templo da Loja", status: "Agendada", observacoes: "" };

export default function AdminSessoes() {
  const [sessoes, setSessoes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [saving, setSaving] = useState(false);
  const [filtro, setFiltro] = useState("Todas");

  useEffect(() => { loadSessoes(); }, []);

  const loadSessoes = async () => {
    const data = await base44.entities.Sessao.list("-data", 50);
    setSessoes(data);
  };

  const abrirNova = () => { setForm(FORM_VAZIO); setEditando(null); setShowForm(true); };
  const abrirEdicao = (s) => { setForm({ ...s }); setEditando(s.id); setShowForm(true); };

  const salvar = async () => {
    setSaving(true);
    if (editando) await base44.entities.Sessao.update(editando, form);
    else await base44.entities.Sessao.create(form);
    await loadSessoes();
    setShowForm(false);
    setSaving(false);
  };

  const excluir = async (id) => {
    if (!confirm("Deseja excluir esta sessão?")) return;
    await base44.entities.Sessao.delete(id);
    await loadSessoes();
  };

  const sessoesFiltradas = filtro === "Todas" ? sessoes : sessoes.filter(s => s.status === filtro);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
            <Gavel className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A5F]">Sessões & Rituais</h1>
            <p className="text-slate-500">{sessoes.length} sessões registradas</p>
          </div>
        </div>
        <Button onClick={abrirNova} className="bg-[#1B3A5F] text-white">
          <Plus className="w-4 h-4 mr-2" /> Nova Sessão
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {["Todas", "Agendada", "Realizada", "Cancelada"].map(f => (
          <Button key={f} variant={filtro === f ? "default" : "outline"} size="sm"
            onClick={() => setFiltro(f)}
            className={filtro === f ? "bg-[#1B3A5F] text-white" : "border-slate-300"}>
            {f}
          </Button>
        ))}
      </div>

      {/* Formulário */}
      {showForm && (
        <Card className="border-[#C9A227]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[#1B3A5F]">{editando ? "Editar Sessão" : "Nova Sessão"}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label>Número</Label>
                <Input value={form.numero} onChange={e => setForm({ ...form, numero: e.target.value })} placeholder="Ex: 001/2026" />
              </div>
              <div className="space-y-1">
                <Label>Data</Label>
                <Input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Hora</Label>
                <Input type="time" value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Agendada", "Realizada", "Cancelada"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Ordinária","Extraordinária","Magna","Pública","De Instrução","Fúnebre"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Grau Mínimo</Label>
                <Select value={form.grau} onValueChange={v => setForm({ ...form, grau: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Aprendiz","Companheiro","Mestre"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Local</Label>
                <Input value={form.local} onChange={e => setForm({ ...form, local: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Pauta</Label>
              <Textarea value={form.pauta} onChange={e => setForm({ ...form, pauta: e.target.value })} rows={3} placeholder="Descreva os itens da pauta..." />
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

      {/* Lista */}
      <div className="space-y-3">
        {sessoesFiltradas.length === 0 && (
          <Card><CardContent className="p-8 text-center text-slate-400">Nenhuma sessão encontrada.</CardContent></Card>
        )}
        {sessoesFiltradas.map(s => (
          <Card key={s.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#1B3A5F]/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-[#1B3A5F]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-800">{s.tipo} {s.numero && `— Nº ${s.numero}`}</p>
                    <Badge className={statusColors[s.status]}>{s.status}</Badge>
                    <Badge className="bg-slate-100 text-slate-700">{s.grau}</Badge>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{s.data} às {s.hora} {s.local && `• ${s.local}`}</p>
                  {s.pauta && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{s.pauta}</p>}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => abrirEdicao(s)}><Edit2 className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => excluir(s.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}