import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { UserPlus, Edit2, Trash2, X, Save, Search, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CARGOS_SUGERIDOS = ["Nenhum","Venerável Mestre","Primeiro Vigilante","Segundo Vigilante","Orador","Secretário","Tesoureiro","Chanceler","Bibliotecário","Mestre de Cerimônias","Primeiro Diácono","Segundo Diácono","Porta Bandeira","Porta Espada","Arquiteto","Hospitaleiro","Músico","Mestre de Harmonia","Cobrador","Guarda Interno","Guarda Externo","Primeiro Experto","Segundo Experto","Mestre de Banquetes"];

const FORM_VAZIO = {
  nome_completo: "", numero_glp: "", email: "", telefone: "",
  grau: "Aprendiz", cargo: "Nenhum", situacao: "Regular", ativo: true,
  data_iniciacao: "", data_elevacao: "", data_exaltacao: "",
  profissao: "", data_nascimento: "", endereco: "", observacoes: "",
  senha: "", primeiro_acesso: true,
};

const situacaoColors = { Regular: "bg-green-100 text-green-800", Irregular: "bg-red-100 text-red-800", Suspenso: "bg-orange-100 text-orange-800", Afastado: "bg-slate-100 text-slate-600" };

export default function AdminCadastroIrmaos() {
  const [irmaos, setIrmaos] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroGrau, setFiltroGrau] = useState("Todos");
  const [filtroSituacao, setFiltroSituacao] = useState("Todos");
  const [filtroCargo, setFiltroCargo] = useState("Todos");
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [saving, setSaving] = useState(false);
  const [sortField, setSortField] = useState("nome_completo");
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => { loadIrmaos(); }, []);

  const loadIrmaos = async () => {
    const data = await base44.entities.Irmao.list("-created_date", 200);
    setIrmaos(data);
  };

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUp className="w-3 h-3 opacity-30" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  const abrirNovo = () => { setForm(FORM_VAZIO); setEditando(null); setShowForm(true); };
  const abrirEdicao = (ir) => { setForm({ ...ir }); setEditando(ir.id); setShowForm(true); };

  const salvar = async () => {
    if (!form.nome_completo || !form.numero_glp) return alert("Nome e Nº GLP são obrigatórios.");
    setSaving(true);
    const dados = { ...form, senha: form.senha || form.numero_glp };
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

  const filtrados = irmaos
    .filter(i => {
      const matchBusca = !busca || i.nome_completo?.toLowerCase().includes(busca.toLowerCase()) || i.numero_glp?.includes(busca);
      const matchGrau = filtroGrau === "Todos" || i.grau === filtroGrau;
      const matchSituacao = filtroSituacao === "Todos" || i.situacao === filtroSituacao;
      const matchCargo = filtroCargo === "Todos" || i.cargo === filtroCargo;
      return matchBusca && matchGrau && matchSituacao && matchCargo;
    })
    .sort((a, b) => {
      const va = (a[sortField] || "").toString().toLowerCase();
      const vb = (b[sortField] || "").toString().toLowerCase();
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });

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

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome ou Nº GLP..." className="pl-9" />
        </div>
        <Select value={filtroGrau} onValueChange={setFiltroGrau}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Grau" /></SelectTrigger>
          <SelectContent>{["Todos","Aprendiz","Companheiro","Mestre"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filtroSituacao} onValueChange={setFiltroSituacao}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Situação" /></SelectTrigger>
          <SelectContent>{["Todos","Regular","Irregular","Suspenso","Afastado"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filtroCargo} onValueChange={setFiltroCargo}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Cargo" /></SelectTrigger>
          <SelectContent>{["Todos", ...CARGOS].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
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
                <Label>Nº GLP *</Label>
                <Input value={form.numero_glp} onChange={e => setForm({ ...form, numero_glp: e.target.value })} placeholder="Número de cadastro GLP" />
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
                <Label>Ativo</Label>
                <Select value={form.ativo ? "true" : "false"} onValueChange={v => setForm({ ...form, ativo: v === "true" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Ativo</SelectItem>
                    <SelectItem value="false">Inativo</SelectItem>
                  </SelectContent>
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

      {/* Cabeçalho da tabela com ordenação */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1B3A5F] text-white">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium">
                    <button onClick={() => toggleSort("nome_completo")} className="flex items-center gap-1 hover:text-[#C9A227]">
                      Nome <SortIcon field="nome_completo" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium">
                    <button onClick={() => toggleSort("numero_glp")} className="flex items-center gap-1 hover:text-[#C9A227]">
                      Nº GLP <SortIcon field="numero_glp" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium hidden md:table-cell">
                    <button onClick={() => toggleSort("grau")} className="flex items-center gap-1 hover:text-[#C9A227]">
                      Grau <SortIcon field="grau" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium hidden md:table-cell">
                    <button onClick={() => toggleSort("cargo")} className="flex items-center gap-1 hover:text-[#C9A227]">
                      Cargo <SortIcon field="cargo" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium hidden lg:table-cell">
                    <button onClick={() => toggleSort("situacao")} className="flex items-center gap-1 hover:text-[#C9A227]">
                      Situação <SortIcon field="situacao" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Nenhum irmão encontrado.</td></tr>
                )}
                {filtrados.map((ir, idx) => (
                  <tr key={ir.id} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100 transition-colors`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1B3A5F]/10 flex items-center justify-center font-bold text-[#1B3A5F] text-sm flex-shrink-0">
                          {ir.nome_completo?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{ir.nome_completo}</p>
                          <p className="text-xs text-slate-400">{ir.email || ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{ir.numero_glp || "—"}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge className={ir.grau === "Mestre" ? "bg-purple-100 text-purple-800" : ir.grau === "Companheiro" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}>
                        {ir.grau}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">{ir.cargo && ir.cargo !== "Nenhum" ? ir.cargo : "—"}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <Badge className={situacaoColors[ir.situacao] || ""}>{ir.situacao}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => abrirEdicao(ir)}><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => excluir(ir.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}