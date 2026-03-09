import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { UserPlus, Edit2, Trash2, X, Save, Search, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CARGOS = ["Nenhum","Venerável Mestre","Primeiro Vigilante","Segundo Vigilante","Orador","Secretário","Tesoureiro","Chanceler","Bibliotecário","Mestre de Cerimônias","Primeiro Diácono","Segundo Diácono","Porta Bandeira","Porta Espada","Arquiteto","Hospitaleiro","Músico","Cobrador","Guarda Interno","Guarda Externo","Primeiro Experto","Segundo Experto","Mestre de Banquetes"];

const FORM_VAZIO = {
  nome_completo: "", cim: "", numero_glp: "", email: "", telefone: "",
  grau: "Aprendiz", cargo: "Nenhum", situacao: "Regular", ativo: true,
  data_iniciacao: "", data_elevacao: "", data_exaltacao: "",
  profissao: "", data_nascimento: "", endereco: "", observacoes: "",
  senha: "", primeiro_acesso: true,
};

export default function AdminCadastroIrmaos() {
  const [irmaos, setIrmaos] = useState([]);
  const [busca, setBusca] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadIrmaos(); }, []);

  const loadIrmaos = async () => {
    const data = await base44.entities.Irmao.list("-created_date", 100);
    setIrmaos(data);
  };

  const abrirNovo = () => { setForm(FORM_VAZIO); setEditando(null); setShowForm(true); };
  const abrirEdicao = (ir) => { setForm({ ...ir }); setEditando(ir.id); setShowForm(true); };

  const salvar = async () => {
    if (!form.nome_completo || !form.cim) return alert("Nome e CIM são obrigatórios.");
    setSaving(true);
    const dados = { ...form, senha: form.senha || form.cim };
    if (editando) await base44.entities.Irmao.update(editando, dados);
    else await base44.entities.Irmao.create(dados);
    await loadIrmaos();
    setShowForm(false);
    setSaving(false);
  };

  const excluir = async (id) => {
    if (!confirm("Deseja excluir este irmão?")) return;
    await base44.entities.Irmao.delete(id);
    await loadIrmaos();
  };

  const filtrados = irmaos.filter(i =>
    !busca || i.nome_completo?.toLowerCase().includes(busca.toLowerCase()) || i.cim?.includes(busca)
  );

  const situacaoColors = { Regular: "bg-green-100 text-green-800", Irregular: "bg-red-100 text-red-800", Suspenso: "bg-orange-100 text-orange-800", Afastado: "bg-slate-100 text-slate-600" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A5F]">Cadastro de Irmãos</h1>
            <p className="text-slate-500">{irmaos.length} irmãos cadastrados</p>
          </div>
        </div>
        <Button onClick={abrirNovo} className="bg-[#1B3A5F] text-white">
          <UserPlus className="w-4 h-4 mr-2" /> Novo Irmão
        </Button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome ou CIM..." className="pl-9" />
      </div>

      {/* Formulário */}
      {showForm && (
        <Card className="border-[#C9A227]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[#1B3A5F]">{editando ? "Editar Irmão" : "Novo Irmão"}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Dados Básicos</p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1 md:col-span-2">
                <Label>Nome Completo *</Label>
                <Input value={form.nome_completo} onChange={e => setForm({ ...form, nome_completo: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>CIM *</Label>
                <Input value={form.cim} onChange={e => setForm({ ...form, cim: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Nº GLP</Label>
                <Input value={form.numero_glp} onChange={e => setForm({ ...form, numero_glp: e.target.value })} />
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
                <Label>Data de Nascimento</Label>
                <Input type="date" value={form.data_nascimento} onChange={e => setForm({ ...form, data_nascimento: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Profissão</Label>
                <Input value={form.profissao} onChange={e => setForm({ ...form, profissao: e.target.value })} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>Endereço</Label>
                <Input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
              </div>
            </div>

            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide pt-2">Dados Maçônicos</p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Grau</Label>
                <Select value={form.grau} onValueChange={v => setForm({ ...form, grau: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Aprendiz","Companheiro","Mestre"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Cargo</Label>
                <Select value={form.cargo} onValueChange={v => setForm({ ...form, cargo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CARGOS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Situação</Label>
                <Select value={form.situacao} onValueChange={v => setForm({ ...form, situacao: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Regular","Irregular","Suspenso","Afastado"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Data de Iniciação</Label>
                <Input type="date" value={form.data_iniciacao} onChange={e => setForm({ ...form, data_iniciacao: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Data de Elevação</Label>
                <Input type="date" value={form.data_elevacao} onChange={e => setForm({ ...form, data_elevacao: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Data de Exaltação</Label>
                <Input type="date" value={form.data_exaltacao} onChange={e => setForm({ ...form, data_exaltacao: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Observações</Label>
              <Input value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
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
        {filtrados.length === 0 && <Card><CardContent className="p-8 text-center text-slate-400">Nenhum irmão encontrado.</CardContent></Card>}
        {filtrados.map(ir => (
          <Card key={ir.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1B3A5F]/10 flex items-center justify-center font-bold text-[#1B3A5F]">
                  {ir.nome_completo?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{ir.nome_completo}</p>
                  <p className="text-xs text-slate-500">CIM: {ir.cim} • {ir.grau}{ir.cargo && ir.cargo !== "Nenhum" ? ` • ${ir.cargo}` : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={situacaoColors[ir.situacao] || ""}>{ir.situacao}</Badge>
                <Badge className={ir.ativo ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}>{ir.ativo ? "Ativo" : "Inativo"}</Badge>
                <Button variant="ghost" size="icon" onClick={() => abrirEdicao(ir)}><Edit2 className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => excluir(ir.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}