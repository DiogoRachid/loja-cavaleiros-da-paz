import { useState, useEffect } from "react";
import { db } from "@/api/db";
import { Settings, Save, Building2, Phone, Mail, Calendar, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FORM_VAZIO = {
  nome: "", numero: "", potencia: "", oriente: "", endereco: "",
  telefone: "", email: "", valor_mensalidade: "", dia_reuniao: "",
  hora_reuniao: "", exercicio_atual: new Date().getFullYear().toString(),
  logo_url: "", logo_potencia_url: "",
};

export default function AdminDadosLoja() {
  const [form, setForm] = useState(FORM_VAZIO);
  const [lojaId, setLojaId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadDados(); }, []);

  const loadDados = async () => {
    const data = await db.DadosLoja.list();
    if (data.length > 0) {
      setForm({ ...FORM_VAZIO, ...data[0] });
      setLojaId(data[0].id);
    }
  };

  const salvar = async () => {
    setSaving(true);
    const dados = { ...form, valor_mensalidade: parseFloat(form.valor_mensalidade) || 0 };
    if (lojaId) await db.DadosLoja.update(lojaId, dados);
    else { const novo = await db.DadosLoja.create(dados); setLojaId(novo.id); }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
            <Settings className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A5F]">Dados da Loja</h1>
            <p className="text-slate-500">Configurações gerais da Loja</p>
          </div>
        </div>
        <Button onClick={salvar} disabled={saving} className="bg-[#1B3A5F] text-white">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar Alterações"}
        </Button>
      </div>

      {/* Identificação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#1B3A5F] flex items-center gap-2 text-base">
            <Building2 className="w-4 h-4" /> Identificação
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-1 md:col-span-2">
            <Label>Nome da Loja *</Label>
            <Input value={form.nome} onChange={e => f("nome", e.target.value)} placeholder="Ex: Cavaleiros da Paz" />
          </div>
          <div className="space-y-1">
            <Label>Número *</Label>
            <Input value={form.numero} onChange={e => f("numero", e.target.value)} placeholder="Ex: 25" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Potência / Obediência</Label>
            <Input value={form.potencia} onChange={e => f("potencia", e.target.value)} placeholder="Ex: Grande Loja do Paraná" />
          </div>
          <div className="space-y-1">
            <Label>Oriente (Cidade)</Label>
            <Input value={form.oriente} onChange={e => f("oriente", e.target.value)} placeholder="Ex: Curitiba" />
          </div>
          <div className="space-y-1 md:col-span-3">
            <Label>Endereço do Templo</Label>
            <Input value={form.endereco} onChange={e => f("endereco", e.target.value)} placeholder="Rua, número, bairro, cidade" />
          </div>
          <div className="space-y-1 md:col-span-3">
            <Label>Logo da Loja (URL) — usada nos documentos impressos</Label>
            <Input value={form.logo_url} onChange={e => f("logo_url", e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-1 md:col-span-3">
            <Label>Logo da Potência / Grande Loja do Paraná (URL)</Label>
            <Input value={form.logo_potencia_url} onChange={e => f("logo_potencia_url", e.target.value)} placeholder="https://..." />
          </div>
        </CardContent>
      </Card>

      {/* Contato */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#1B3A5F] flex items-center gap-2 text-base">
            <Phone className="w-4 h-4" /> Contato
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Telefone</Label>
            <Input value={form.telefone} onChange={e => f("telefone", e.target.value)} placeholder="(00) 00000-0000" />
          </div>
          <div className="space-y-1">
            <Label>Email Institucional</Label>
            <Input type="email" value={form.email} onChange={e => f("email", e.target.value)} placeholder="contato@loja.com" />
          </div>
        </CardContent>
      </Card>

      {/* Reuniões */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#1B3A5F] flex items-center gap-2 text-base">
            <Calendar className="w-4 h-4" /> Reuniões
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-1 md:col-span-2">
            <Label>Dia Habitual de Reunião</Label>
            <Input value={form.dia_reuniao} onChange={e => f("dia_reuniao", e.target.value)} placeholder="Ex: Toda segunda segunda-feira do mês" />
          </div>
          <div className="space-y-1">
            <Label>Horário Padrão</Label>
            <Input value={form.hora_reuniao} onChange={e => f("hora_reuniao", e.target.value)} placeholder="Ex: 19:30" />
          </div>
        </CardContent>
      </Card>

      {/* Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#1B3A5F] flex items-center gap-2 text-base">
            <DollarSign className="w-4 h-4" /> Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Valor Padrão da Mensalidade (R$)</Label>
            <Input type="number" step="0.01" value={form.valor_mensalidade} onChange={e => f("valor_mensalidade", e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-1">
            <Label>Exercício Atual (Ano)</Label>
            <Input value={form.exercicio_atual} onChange={e => f("exercicio_atual", e.target.value)} placeholder="2026" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}