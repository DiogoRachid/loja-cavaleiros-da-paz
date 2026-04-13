import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, CheckCircle, Clock, MapPin, FileText, Users, Plus, X, Save, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const FORM_VAZIO = { numero: "", data: "", hora: "19:30", tipo: "Ordinária", grau: "Mestre", local: "Templo da Loja", pauta: "", status: "Agendada" };

export default function AdminAgendaRitual() {
  const [sessoes, setSessoes] = useState([]);
  const [selecionada, setSelecionada] = useState(null);
  const [ordemCount, setOrdemCount] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [saving, setSaving] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formEdicao, setFormEdicao] = useState(FORM_VAZIO);

  useEffect(() => { loadDados(); }, []);

  const loadDados = async () => {
    const data = await base44.entities.Sessao.list("-data", 30);
    setSessoes(data);
    const ordens = await base44.entities.OrdemEntrada.list();
    const counts = {};
    ordens.forEach(o => { counts[o.sessao_id] = (counts[o.sessao_id] || 0) + 1; });
    setOrdemCount(counts);
  };

  const abrirEdicao = (s, e) => {
    e.stopPropagation();
    setFormEdicao({ numero: s.numero || "", data: s.data || "", hora: s.hora || "19:30", tipo: s.tipo || "Ordinária", grau: s.grau || "Mestre", local: s.local || "", pauta: s.pauta || "", status: s.status || "Agendada" });
    setEditando(s.id);
  };

  const salvarEdicao = async () => {
    setSaving(true);
    await base44.entities.Sessao.update(editando, formEdicao);
    await loadDados();
    setEditando(null);
    setSaving(false);
  };

  const excluir = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Deseja excluir esta sessão?")) return;
    await base44.entities.Sessao.delete(id);
    if (selecionada?.id === id) setSelecionada(null);
    await loadDados();
  };

  const salvarSessao = async () => {
    if (!form.data || !form.hora || !form.tipo) return;
    setSaving(true);
    await base44.entities.Sessao.create(form);
    await loadDados();
    setShowForm(false);
    setForm(FORM_VAZIO);
    setSaving(false);
  };

  const agendadas = sessoes.filter(s => s.status === "Agendada");
  const realizadas = sessoes.filter(s => s.status === "Realizada");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
            <Calendar className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A5F]">Agenda Ritual</h1>
            <p className="text-slate-500">{agendadas.length} sessões agendadas</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-[#1B3A5F] text-white">
          <Plus className="w-4 h-4 mr-2" /> Nova Sessão
        </Button>
      </div>

      {/* Formulário nova sessão */}
      {showForm && (
        <Card className="border-[#C9A227]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[#1B3A5F] text-base">Nova Sessão</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label>Número</Label>
                <Input value={form.numero} onChange={e => setForm({ ...form, numero: e.target.value })} placeholder="001/2026" />
              </div>
              <div className="space-y-1">
                <Label>Data *</Label>
                <Input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Hora *</Label>
                <Input type="time" value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Tipo *</Label>
                <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Ordinária","Extraordinária","Magna","Pública","De Instrução","Fúnebre"].map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Grau</Label>
                <Select value={form.grau} onValueChange={v => setForm({ ...form, grau: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Aprendiz","Companheiro","Mestre"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>Local</Label>
                <Input value={form.local} onChange={e => setForm({ ...form, local: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={salvarSessao} disabled={saving} className="bg-[#1B3A5F] text-white">
                <Save className="w-4 h-4 mr-2" />{saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                    <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={statusColors[s.status]}>{s.status}</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500" onClick={e => abrirEdicao(s, e)}><Edit2 className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={e => excluir(s.id, e)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                  </div>

                  {editando === s.id && (
                    <div className="mt-4 pt-4 border-t space-y-4" onClick={e => e.stopPropagation()}>
                      <p className="text-sm font-semibold text-[#1B3A5F]">Editar Sessão</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1"><Label>Número</Label><Input value={formEdicao.numero} onChange={e => setFormEdicao({ ...formEdicao, numero: e.target.value })} placeholder="001/2026" className="h-8" /></div>
                        <div className="space-y-1"><Label>Data</Label><Input type="date" value={formEdicao.data} onChange={e => setFormEdicao({ ...formEdicao, data: e.target.value })} className="h-8" /></div>
                        <div className="space-y-1"><Label>Hora</Label><Input type="time" value={formEdicao.hora} onChange={e => setFormEdicao({ ...formEdicao, hora: e.target.value })} className="h-8" /></div>
                        <div className="space-y-1"><Label>Status</Label>
                          <Select value={formEdicao.status} onValueChange={v => setFormEdicao({ ...formEdicao, status: v })}>
                            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>{["Agendada","Realizada","Cancelada"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1"><Label>Tipo</Label>
                          <Select value={formEdicao.tipo} onValueChange={v => setFormEdicao({ ...formEdicao, tipo: v })}>
                            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>{["Ordinária","Extraordinária","Magna","Pública","De Instrução","Fúnebre"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1"><Label>Grau</Label>
                          <Select value={formEdicao.grau} onValueChange={v => setFormEdicao({ ...formEdicao, grau: v })}>
                            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>{["Aprendiz","Companheiro","Mestre"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1 md:col-span-2"><Label>Local</Label><Input value={formEdicao.local} onChange={e => setFormEdicao({ ...formEdicao, local: e.target.value })} className="h-8" /></div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditando(null)}>Cancelar</Button>
                        <Button size="sm" onClick={salvarEdicao} disabled={saving} className="bg-[#1B3A5F] text-white">
                          <Save className="w-3 h-3 mr-1" />{saving ? "Salvando..." : "Salvar"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {selecionada?.id === s.id && editando !== s.id && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      {s.pauta && (
                        <div>
                          <p className="text-sm font-medium text-slate-700 flex items-center gap-1 mb-1"><FileText className="w-3 h-3" /> Pauta</p>
                          <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap">{s.pauta}</p>
                        </div>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        <Link to={`${createPageUrl("PrepararReuniao")}?sessao=${s.id}`}>
                          <Button size="sm" className="bg-[#C9A227] text-[#1B3A5F] font-semibold hover:bg-[#8B7019]">
                            <FileText className="w-3 h-3 mr-1" /> Preparar Reunião
                          </Button>
                        </Link>
                        <Link to={createPageUrl("AdminOrdemEntrada")}>
                          <Button size="sm" variant="outline" className="border-[#1B3A5F] text-[#1B3A5F]">
                            <Users className="w-3 h-3 mr-1" /> Ordem de Entrada
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
            <Button onClick={() => setShowForm(true)} className="mt-3 bg-[#1B3A5F] text-white">
              <Plus className="w-4 h-4 mr-2" /> Criar Primeira Sessão
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}