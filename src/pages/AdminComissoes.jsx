import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Plus, Edit2, Trash2, X, Save, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FORM_VAZIO = { nome: "", tipo: "Permanente", descricao: "", exercicio: new Date().getFullYear().toString(), ativa: true };

export default function AdminComissoes() {
  const [comissoes, setComissoes] = useState([]);
  const [membros, setMembros] = useState([]);
  const [irmaos, setIrmaos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [expandido, setExpandido] = useState(null);
  const [saving, setSaving] = useState(false);
  const [novoMembro, setNovoMembro] = useState({ comissao_id: "", irmao_id: "" });
  const [addingMembro, setAddingMembro] = useState(null);

  useEffect(() => { loadDados(); }, []);

  const loadDados = async () => {
    const [c, m, ir] = await Promise.all([
      base44.entities.Comissao.list(),
      base44.entities.MembroComissao.filter({ ativo: true }),
      base44.entities.Irmao.filter({ ativo: true }),
    ]);
    setComissoes(c);
    setMembros(m);
    setIrmaos(ir);
  };

  const salvar = async () => {
    setSaving(true);
    if (editando) await base44.entities.Comissao.update(editando, form);
    else await base44.entities.Comissao.create(form);
    await loadDados();
    setShowForm(false);
    setEditando(null);
    setSaving(false);
  };

  const excluir = async (id) => {
    if (!confirm("Excluir comissão?")) return;
    await base44.entities.Comissao.delete(id);
    await loadDados();
  };

  const adicionarMembro = async (comissaoId, comissaoNome) => {
    if (!novoMembro.irmao_id) return;
    const mc = getMembros(comissaoId);
    if (mc.length >= 3) return;
    const irmao = irmaos.find(i => i.id === novoMembro.irmao_id);
    await base44.entities.MembroComissao.create({
      comissao_id: comissaoId,
      comissao_nome: comissaoNome,
      irmao_id: novoMembro.irmao_id,
      irmao_nome: irmao?.nome_completo || "",
      funcao: "Membro",
      ativo: true,
    });
    setNovoMembro({ comissao_id: "", irmao_id: "" });
    setAddingMembro(null);
    await loadDados();
  };

  const removerMembro = async (id) => {
    await base44.entities.MembroComissao.delete(id);
    await loadDados();
  };

  const getMembros = (comissaoId) => membros.filter(m => m.comissao_id === comissaoId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
            <Users className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A5F]">Comissões</h1>
            <p className="text-slate-500">{comissoes.length} comissões cadastradas</p>
          </div>
        </div>
        <Button onClick={() => { setForm(FORM_VAZIO); setEditando(null); setShowForm(true); }} className="bg-[#1B3A5F] text-white">
          <Plus className="w-4 h-4 mr-2" /> Nova Comissão
        </Button>
      </div>

      {showForm && (
        <Card className="border-[#C9A227]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[#1B3A5F]">{editando ? "Editar Comissão" : "Nova Comissão"}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Nome</Label>
                <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Nome da comissão" />
              </div>
              <div className="space-y-1">
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Permanente","Especial","Temporária"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Exercício</Label>
                <Input value={form.exercicio} onChange={e => setForm({ ...form, exercicio: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Descrição</Label>
              <Input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Objetivos da comissão" />
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

      <div className="space-y-4">
        {comissoes.map(c => {
          const mc = getMembros(c.id);
          const aberto = expandido === c.id;
          return (
            <Card key={c.id}>
              <CardHeader className="cursor-pointer" onClick={() => setExpandido(aberto ? null : c.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#1B3A5F]">{c.nome}</p>
                        <Badge className={c.tipo === "Permanente" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}>{c.tipo}</Badge>
                      </div>
                      <p className="text-sm text-slate-500">{mc.length} membro(s) • Exercício {c.exercicio}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); setForm({ ...c }); setEditando(c.id); setShowForm(true); }}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); excluir(c.id); }} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                    {aberto ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>
              </CardHeader>
              {aberto && (
                <CardContent className="pt-0">
                  <div className="border-t pt-4 space-y-2">
                    {mc.map(m => (
                     <div key={m.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                       <div>
                         <p className="text-sm font-medium text-slate-800">{m.irmao_nome}</p>
                         <Badge className="text-xs bg-slate-200 text-slate-700">Membro da Comissão {m.comissao_nome}</Badge>
                       </div>
                       <Button variant="ghost" size="icon" onClick={() => removerMembro(m.id)} className="text-red-500 h-7 w-7"><X className="w-3 h-3" /></Button>
                     </div>
                    ))}
                    {addingMembro === c.id ? (
                      <div className="flex gap-2 pt-2">
                        <Select value={novoMembro.irmao_id} onValueChange={v => setNovoMembro({ ...novoMembro, irmao_id: v })}>
                          <SelectTrigger className="flex-1"><SelectValue placeholder="Selecionar irmão..." /></SelectTrigger>
                          <SelectContent>{irmaos.map(i => <SelectItem key={i.id} value={i.id}>{i.nome_completo}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={novoMembro.funcao} onValueChange={v => setNovoMembro({ ...novoMembro, funcao: v })}>
                          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                          <SelectContent>{["Presidente","Secretário","Membro"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                        </Select>
                        <Button size="sm" onClick={() => adicionarMembro(c.id, c.nome)} className="bg-[#1B3A5F] text-white">Adicionar</Button>
                        <Button size="sm" variant="ghost" onClick={() => setAddingMembro(null)}>Cancelar</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setAddingMembro(c.id)} className="mt-2">
                        <Plus className="w-3 h-3 mr-1" /> Adicionar Membro
                      </Button>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
        {comissoes.length === 0 && (
          <Card><CardContent className="p-8 text-center text-slate-400">Nenhuma comissão cadastrada.</CardContent></Card>
        )}
      </div>
    </div>
  );
}