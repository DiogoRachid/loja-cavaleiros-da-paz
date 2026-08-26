import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { Shield, Plus, Edit2, Trash2, X, Save, Search, Printer } from "lucide-react";
import { imprimirAutoridadesPorPotencia } from "@/components/mc/imprimirAutoridades";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const FORM_VAZIO = { titulo: "", nome: "", potencia: "", cargo_potencia: "", ordem_protocolar: "", email: "", telefone: "", ativa: true, observacoes: "" };

export default function AdminAutoridades() {
  const [autoridades, setAutoridades] = useState([]);
  const [dadosLoja, setDadosLoja] = useState(null);
  const [busca, setBusca] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAutoridades();
    db.DadosLoja.list().then(l => setDadosLoja(l?.[0] || null)).catch(() => {});
  }, []);

  const loadAutoridades = async () => {
    const data = await db.Autoridade.list("ordem_protocolar", 500);
    setAutoridades(data);
  };

  const abrirNova = () => { setForm(FORM_VAZIO); setEditando(null); setShowForm(true); };
  const abrirEdicao = (a) => { setForm({ ...a }); setEditando(a.id); setShowForm(true); };

  const salvar = async () => {
    setSaving(true);
    const dados = { ...form, ordem_protocolar: Number(form.ordem_protocolar) || 0 };
    if (editando) await db.Autoridade.update(editando, dados);
    else await db.Autoridade.create(dados);
    await loadAutoridades();
    setShowForm(false);
    setSaving(false);
  };

  const excluir = async (id) => {
    if (!confirm("Excluir esta autoridade?")) return;
    try {
      await db.Autoridade.delete(id);
    } catch (e) {
      // Já foi removida externamente — apenas atualiza a lista
    }
    await loadAutoridades();
  };

  const filtradas = autoridades.filter(a =>
    !busca || a.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    a.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
    a.potencia?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
            <Shield className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A5F]">Autoridades</h1>
            <p className="text-slate-500">{autoridades.length} autoridades cadastradas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => imprimirAutoridadesPorPotencia({ autoridades: filtradas, dadosLoja })}
            className="border-[#C9A227] text-[#1B3A5F]"
          >
            <Printer className="w-4 h-4 mr-2" /> Relatório por Potência
          </Button>
          <Button onClick={abrirNova} className="bg-[#1B3A5F] text-white">
            <Plus className="w-4 h-4 mr-2" /> Nova Autoridade
          </Button>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome, título ou potência..." className="pl-9" />
      </div>

      {/* Formulário */}
      {showForm && (
        <Card className="border-[#C9A227]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[#1B3A5F]">{editando ? "Editar Autoridade" : "Nova Autoridade"}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Título Protocolar *</Label>
                <Input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Mui Respeitável Grão-Mestre" />
              </div>
              <div className="space-y-1">
                <Label>Nome Completo *</Label>
                <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" />
              </div>
              <div className="space-y-1">
                <Label>Potência / Obediência</Label>
                <Input value={form.potencia} onChange={e => setForm({ ...form, potencia: e.target.value })} placeholder="Ex: Grande Loja do Paraná" />
              </div>
              <div className="space-y-1">
                <Label>Cargo na Potência</Label>
                <Input value={form.cargo_potencia} onChange={e => setForm({ ...form, cargo_potencia: e.target.value })} placeholder="Ex: Grão-Mestre" />
              </div>
              <div className="space-y-1">
                <Label>Ordem Protocolar</Label>
                <Input type="number" value={form.ordem_protocolar} onChange={e => setForm({ ...form, ordem_protocolar: e.target.value })} placeholder="1, 2, 3..." />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Telefone</Label>
                <Input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} />
              </div>
              <div className="space-y-1">
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

      {/* Lista */}
      <div className="space-y-2">
        {filtradas.length === 0 && (
          <Card><CardContent className="p-8 text-center text-slate-400">Nenhuma autoridade encontrada.</CardContent></Card>
        )}
        {filtradas.map(a => (
          <Card key={a.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1B3A5F] flex items-center justify-center text-[#C9A227] font-bold text-sm flex-shrink-0">
                  {a.ordem_protocolar || "—"}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{a.titulo}</p>
                  <p className="text-slate-600 text-sm">{a.nome}</p>
                  {a.potencia && <p className="text-xs text-slate-400">{a.potencia}{a.cargo_potencia ? ` • ${a.cargo_potencia}` : ""}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={a.ativa ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}>
                  {a.ativa ? "Ativa" : "Inativa"}
                </Badge>
                <Button variant="ghost" size="icon" onClick={() => abrirEdicao(a)}><Edit2 className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => excluir(a.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}