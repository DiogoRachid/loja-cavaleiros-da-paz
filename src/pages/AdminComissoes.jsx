import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Plus, Edit2, Trash2, X, Save, ChevronDown, ChevronUp, UserPlus } from "lucide-react";
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
  const [membrosForm, setMembrosForm] = useState(["", "", ""]);
  const [expandido, setExpandido] = useState(null);
  const [saving, setSaving] = useState(false);
  const [novoMembroId, setNovoMembroId] = useState("");
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
    setIrmaos(ir.sort((a, b) => a.nome_completo.localeCompare(b.nome_completo)));
  };

  const abrirFormNovo = () => {
    setForm(FORM_VAZIO);
    setMembrosForm(["", "", ""]);
    setEditando(null);
    setShowForm(true);
  };

  const abrirFormEditar = (c) => {
    setForm({ ...c });
    const mc = getMembros(c.id);
    const slots = ["", "", ""];
    mc.forEach((m, i) => { if (i < 3) slots[i] = m.irmao_id; });
    setMembrosForm(slots);
    setEditando(c.id);
    setShowForm(true);
  };

  const salvar = async () => {
    setSaving(true);
    let comissaoId = editando;

    if (editando) {
      await base44.entities.Comissao.update(editando, form);
      // Remover membros antigos e recriar
      const antigos = getMembros(editando);
      await Promise.all(antigos.map(m => base44.entities.MembroComissao.delete(m.id)));
    } else {
      const nova = await base44.entities.Comissao.create(form);
      comissaoId = nova.id;
    }

    // Criar novos membros selecionados
    for (const irmaoId of membrosForm) {
      if (!irmaoId) continue;
      const irmao = irmaos.find(i => i.id === irmaoId);
      await base44.entities.MembroComissao.create({
        comissao_id: comissaoId,
        comissao_nome: form.nome,
        irmao_id: irmaoId,
        irmao_nome: irmao?.nome_completo || "",
        funcao: "Membro",
        ativo: true,
      });
    }

    await loadDados();
    setShowForm(false);
    setEditando(null);
    setSaving(false);
  };

  const excluir = async (id) => {
    if (!confirm("Excluir comissão e seus membros?")) return;
    const mc = getMembros(id);
    await Promise.all(mc.map(m => base44.entities.MembroComissao.delete(m.id)));
    await base44.entities.Comissao.delete(id);
    await loadDados();
  };

  const removerMembro = async (id) => {
    await base44.entities.MembroComissao.delete(id);
    await loadDados();
  };

  const adicionarMembroAvulso = async (comissaoId, comissaoNome) => {
    if (!novoMembroId) return;
    const mc = getMembros(comissaoId);
    if (mc.length >= 3) return;
    const irmao = irmaos.find(i => i.id === novoMembroId);
    await base44.entities.MembroComissao.create({
      comissao_id: comissaoId,
      comissao_nome: comissaoNome,
      irmao_id: novoMembroId,
      irmao_nome: irmao?.nome_completo || "",
      funcao: "Membro",
      ativo: true,
    });
    setNovoMembroId("");
    setAddingMembro(null);
    await loadDados();
  };

  const getMembros = (comissaoId) => membros.filter(m => m.comissao_id === comissaoId);

  // Irmãos disponíveis (não duplicar no mesmo slot)
  const irmaoDisponivelParaSlot = (idx) => {
    const outros = membrosForm.filter((_, i) => i !== idx);
    return irmaos.filter(i => !outros.includes(i.id));
  };

  // Irmãos não membros ainda (para adicionar avulso)
  const irmaoDisponivelParaComissao = (comissaoId) => {
    const mc = getMembros(comissaoId);
    const ids = mc.map(m => m.irmao_id);
    return irmaos.filter(i => !ids.includes(i.id));
  };

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
        <Button onClick={abrirFormNovo} className="bg-[#1B3A5F] text-white">
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

            {/* Seleção de membros */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#1B3A5F]" />
                <Label className="text-[#1B3A5F] font-semibold">Membros da Comissão (máx. 3)</Label>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {membrosForm.map((irmaoId, idx) => (
                  <div key={idx} className="space-y-1">
                    <Label className="text-xs text-slate-500">Membro {idx + 1}{idx === 0 ? " *" : " (opcional)"}</Label>
                    <Select
                      value={irmaoId || "__none__"}
                      onValueChange={v => {
                        const novo = [...membrosForm];
                        novo[idx] = v === "__none__" ? "" : v;
                        setMembrosForm(novo);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar irmão..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— Nenhum —</SelectItem>
                        {irmaoDisponivelParaSlot(idx).map(i => (
                          <SelectItem key={i.id} value={i.id}>{i.nome_completo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={salvar} disabled={saving || !form.nome} className="bg-[#1B3A5F] text-white">
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
          const disponiveis = irmaoDisponivelParaComissao(c.id);
          return (
            <Card key={c.id}>
              <CardHeader className="cursor-pointer" onClick={() => setExpandido(aberto ? null : c.id)}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[#1B3A5F]">{c.nome}</p>
                      <Badge className={c.tipo === "Permanente" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}>{c.tipo}</Badge>
                      {!c.ativa && <Badge className="bg-red-100 text-red-800">Inativa</Badge>}
                    </div>
                    <p className="text-sm text-slate-500">{mc.length} membro(s) • Exercício {c.exercicio}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); abrirFormEditar(c); }}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); excluir(c.id); }} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                    {aberto ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>
              </CardHeader>
              {aberto && (
                <CardContent className="pt-0">
                  {c.descricao && <p className="text-sm text-slate-500 mb-3 italic">{c.descricao}</p>}
                  <div className="border-t pt-4 space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Membros</p>
                    {mc.length === 0 && <p className="text-sm text-slate-400">Nenhum membro atribuído.</p>}
                    {mc.map(m => (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#1B3A5F]/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-[#1B3A5F]" />
                          </div>
                          <p className="text-sm font-medium text-slate-800">{m.irmao_nome}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removerMembro(m.id)} className="text-red-500 h-7 w-7"><X className="w-3 h-3" /></Button>
                      </div>
                    ))}

                    {mc.length < 3 && (
                      addingMembro === c.id ? (
                        <div className="flex gap-2 pt-2 flex-wrap">
                          <Select value={novoMembroId} onValueChange={setNovoMembroId}>
                            <SelectTrigger className="flex-1 min-w-[200px]"><SelectValue placeholder="Selecionar irmão..." /></SelectTrigger>
                            <SelectContent>
                              {disponiveis.map(i => <SelectItem key={i.id} value={i.id}>{i.nome_completo}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <Button size="sm" onClick={() => adicionarMembroAvulso(c.id, c.nome)} disabled={!novoMembroId} className="bg-[#1B3A5F] text-white">Adicionar</Button>
                          <Button size="sm" variant="ghost" onClick={() => { setAddingMembro(null); setNovoMembroId(""); }}>Cancelar</Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); setAddingMembro(c.id); setNovoMembroId(""); }} className="mt-2">
                          <Plus className="w-3 h-3 mr-1" /> Adicionar Membro
                        </Button>
                      )
                    )}
                    {mc.length >= 3 && <p className="text-xs text-slate-400 pt-1">Limite de 3 membros atingido.</p>}
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