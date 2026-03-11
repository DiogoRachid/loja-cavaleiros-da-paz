import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Search, UserCheck, UserX, Filter, ArrowUp, ArrowDown, Edit2, Save, X, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const grauColors = { Aprendiz: "bg-yellow-100 text-yellow-800", Companheiro: "bg-blue-100 text-blue-800", Mestre: "bg-purple-100 text-purple-800" };
const situacaoColors = { Regular: "bg-green-100 text-green-800", Irregular: "bg-red-100 text-red-800", Suspenso: "bg-orange-100 text-orange-800", Afastado: "bg-slate-100 text-slate-700" };
const CARGOS_SUGERIDOS = ["Nenhum","Venerável Mestre","Primeiro Vigilante","Segundo Vigilante","Orador","Secretário","Tesoureiro","Chanceler","Bibliotecário","Mestre de Cerimônias","Primeiro Diácono","Segundo Diácono","Porta Bandeira","Porta Espada","Arquiteto","Hospitaleiro","Músico","Mestre de Harmonia","Cobrador","Guarda Interno","Guarda Externo","Primeiro Experto","Segundo Experto","Mestre de Banquetes"];

export default function AdminMembros() {
  const [irmaos, setIrmaos] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroGrau, setFiltroGrau] = useState("Todos");
  const [filtroSituacao, setFiltroSituacao] = useState("Todos");
  const [filtroCargo, setFiltroCargo] = useState("Todos");
  const [sortField, setSortField] = useState("nome_completo");
  const [sortDir, setSortDir] = useState("asc");
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

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

  const abrirEdicao = (ir) => { setForm({ ...ir }); setEditando(ir.id); };

  const salvar = async () => {
    setSaving(true);
    await base44.entities.Irmao.update(editando, form);
    await loadIrmaos();
    setEditando(null);
    setSaving(false);
  };

  const excluir = async (id) => {
    if (!confirm("Deseja excluir permanentemente este irmão?")) return;
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

  const stats = {
    total: irmaos.filter(i => i.ativo).length,
    regulares: irmaos.filter(i => i.situacao === "Regular").length,
    irregulares: irmaos.filter(i => i.situacao === "Irregular").length,
  };
  const pctAdimplencia = stats.total > 0 ? Math.round((stats.regulares / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
          <Users className="w-6 h-6 text-[#C9A227]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A5F]">Gestão de Membros</h1>
          <p className="text-slate-500">{stats.total} irmãos ativos</p>
        </div>
      </div>

      {/* Cards Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Ativos", value: stats.total, icon: Users, color: "bg-blue-500" },
          { label: "Regulares", value: stats.regulares, icon: UserCheck, color: "bg-green-500" },
          { label: "Irregulares", value: stats.irregulares, icon: UserX, color: "bg-red-500" },
          { label: "Adimplência", value: `${pctAdimplencia}%`, icon: Filter, color: "bg-purple-500" },
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
          <SelectContent>{["Todos", ...CARGOS_SUGERIDOS].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {/* Modal de Edição */}
      {editando && (
        <Card className="border-[#C9A227]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[#1B3A5F]">Editar Irmão</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setEditando(null)}><X className="w-4 h-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1 md:col-span-2">
                <Label>Nome Completo</Label>
                <Input value={form.nome_completo} onChange={e => setForm({ ...form, nome_completo: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Nº GLP</Label>
                <Input value={form.numero_glp} onChange={e => setForm({ ...form, numero_glp: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Telefone</Label>
                <Input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Profissão</Label>
                <Input value={form.profissao} onChange={e => setForm({ ...form, profissao: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Grau</Label>
                <Select value={form.grau} onValueChange={v => setForm({ ...form, grau: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Aprendiz","Companheiro","Mestre"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Cargo</Label>
                <Input
                  list="cargos-sugeridos-membros"
                  value={form.cargo || ""}
                  onChange={e => setForm({ ...form, cargo: e.target.value })}
                  placeholder="Digite ou selecione um cargo"
                />
                <datalist id="cargos-sugeridos-membros">
                  {CARGOS_SUGERIDOS.map(c => <option key={c} value={c} />)}
                </datalist>
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
                  <SelectContent><SelectItem value="true">Ativo</SelectItem><SelectItem value="false">Inativo</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Nascimento</Label>
                <Input type="date" value={form.data_nascimento} onChange={e => setForm({ ...form, data_nascimento: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Iniciação</Label>
                <Input type="date" value={form.data_iniciacao} onChange={e => setForm({ ...form, data_iniciacao: e.target.value })} />
              </div>
              <div className="space-y-1 md:col-span-3">
                <Label>Observações</Label>
                <Input value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditando(null)}>Cancelar</Button>
              <Button onClick={salvar} disabled={saving} className="bg-[#1B3A5F] text-white">
                <Save className="w-4 h-4 mr-2" />{saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela */}
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
                  <th className="text-left px-4 py-3 text-sm font-medium hidden md:table-cell">
                    <button onClick={() => toggleSort("numero_glp")} className="flex items-center gap-1 hover:text-[#C9A227]">
                      Nº GLP <SortIcon field="numero_glp" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium hidden md:table-cell">
                    <button onClick={() => toggleSort("grau")} className="flex items-center gap-1 hover:text-[#C9A227]">
                      Grau <SortIcon field="grau" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium hidden lg:table-cell">
                    <button onClick={() => toggleSort("cargo")} className="flex items-center gap-1 hover:text-[#C9A227]">
                      Cargo <SortIcon field="cargo" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium hidden lg:table-cell">
                    <button onClick={() => toggleSort("situacao")} className="flex items-center gap-1 hover:text-[#C9A227]">
                      Situação <SortIcon field="situacao" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-right">Editar</th>
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
                    <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">{ir.numero_glp || "—"}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge className={grauColors[ir.grau] || ""}>{ir.grau}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 hidden lg:table-cell">{ir.cargo && ir.cargo !== "Nenhum" ? ir.cargo : "—"}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <Badge className={situacaoColors[ir.situacao] || ""}>{ir.situacao}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => abrirEdicao(ir)}><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => excluir(ir.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
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