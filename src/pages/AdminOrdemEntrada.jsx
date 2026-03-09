import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ClipboardList, Plus, Save, X, ArrowUp, ArrowDown, Check, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const CARGOS_ORDEM = [
  "Venerável Mestre","Primeiro Vigilante","Segundo Vigilante","Orador",
  "Secretário","Tesoureiro","Chanceler","Mestre de Cerimônias",
  "Primeiro Diácono","Segundo Diácono","Guarda Interno","Guarda Externo"
];

export default function AdminOrdemEntrada() {
  const [sessoes, setSessoes] = useState([]);
  const [sessaoId, setSessaoId] = useState("");
  const [ordem, setOrdem] = useState([]);
  const [autoridades, setAutoridades] = useState([]);
  const [oficiais, setOficiais] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [novoItem, setNovoItem] = useState({ tipo_participante: "Autoridade", autoridade_id: "", oficial_cargo: "", presente: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadDados(); }, []);
  useEffect(() => { if (sessaoId) loadOrdem(); }, [sessaoId]);

  const loadDados = async () => {
    const [s, a, q] = await Promise.all([
      base44.entities.Sessao.filter({ status: "Agendada" }),
      base44.entities.Autoridade.filter({ ativa: true }),
      base44.entities.QuadroOficiais.filter({ exercicio: new Date().getFullYear().toString() }),
    ]);
    setSessoes(s);
    setAutoridades(a);
    setOficiais(q);
  };

  const loadOrdem = async () => {
    const data = await base44.entities.OrdemEntrada.filter({ sessao_id: sessaoId });
    const sorted = data.sort((a, b) => a.posicao - b.posicao);
    setOrdem(sorted);
  };

  const adicionarItem = async () => {
    if (!sessaoId) return;
    const sessao = sessoes.find(s => s.id === sessaoId);
    const posicao = ordem.length + 1;
    let dados = {
      sessao_id: sessaoId,
      sessao_data: sessao?.data || "",
      posicao,
      tipo_participante: novoItem.tipo_participante,
      presente: false,
      confirmado: false,
    };
    if (novoItem.tipo_participante === "Autoridade") {
      const aut = autoridades.find(a => a.id === novoItem.autoridade_id);
      dados = { ...dados, autoridade_id: aut?.id || "", autoridade_titulo: aut?.titulo || "", autoridade_nome: aut?.nome || "" };
    } else {
      const of = oficiais.find(o => o.cargo === novoItem.oficial_cargo);
      dados = { ...dados, oficial_cargo: novoItem.oficial_cargo, oficial_nome: of?.titular_nome || "" };
    }
    await base44.entities.OrdemEntrada.create(dados);
    await loadOrdem();
    setShowForm(false);
    setNovoItem({ tipo_participante: "Autoridade", autoridade_id: "", oficial_cargo: "", presente: false });
  };

  const togglePresente = async (item) => {
    await base44.entities.OrdemEntrada.update(item.id, { presente: !item.presente, confirmado: !item.presente });
    await loadOrdem();
  };

  const remover = async (id) => {
    await base44.entities.OrdemEntrada.delete(id);
    await loadOrdem();
  };

  const moverPosicao = async (idx, dir) => {
    const newOrdem = [...ordem];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= newOrdem.length) return;
    const posA = newOrdem[idx].posicao;
    const posB = newOrdem[swapIdx].posicao;
    await Promise.all([
      base44.entities.OrdemEntrada.update(newOrdem[idx].id, { posicao: posB }),
      base44.entities.OrdemEntrada.update(newOrdem[swapIdx].id, { posicao: posA }),
    ]);
    await loadOrdem();
  };

  const imprimir = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A5F]">Ordem de Entrada</h1>
            <p className="text-slate-500">Protocolo de entrada no Templo</p>
          </div>
        </div>
        <Button variant="outline" onClick={imprimir} className="border-[#1B3A5F] text-[#1B3A5F]">
          <Printer className="w-4 h-4 mr-2" /> Imprimir
        </Button>
      </div>

      {/* Seleção de Sessão */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-1">
            <Label>Sessão</Label>
            <Select value={sessaoId} onValueChange={setSessaoId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma sessão agendada..." />
              </SelectTrigger>
              <SelectContent>
                {sessoes.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.tipo} — {s.data} às {s.hora}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {sessaoId && (
        <>
          {/* Adicionar Participante */}
          <div className="flex justify-end">
            <Button onClick={() => setShowForm(!showForm)} className="bg-[#1B3A5F] text-white">
              <Plus className="w-4 h-4 mr-2" /> Adicionar Participante
            </Button>
          </div>

          {showForm && (
            <Card className="border-[#C9A227]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[#1B3A5F] text-base">Novo Participante</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Tipo</Label>
                    <Select value={novoItem.tipo_participante} onValueChange={v => setNovoItem({ ...novoItem, tipo_participante: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Autoridade">Autoridade</SelectItem>
                        <SelectItem value="Oficial">Oficial da Loja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {novoItem.tipo_participante === "Autoridade" ? (
                    <div className="space-y-1">
                      <Label>Autoridade</Label>
                      <Select value={novoItem.autoridade_id} onValueChange={v => setNovoItem({ ...novoItem, autoridade_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                        <SelectContent>
                          {autoridades.map(a => <SelectItem key={a.id} value={a.id}>{a.titulo} — {a.nome}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Label>Cargo Oficial</Label>
                      <Select value={novoItem.oficial_cargo} onValueChange={v => setNovoItem({ ...novoItem, oficial_cargo: v })}>
                        <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                        <SelectContent>
                          {CARGOS_ORDEM.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                  <Button onClick={adicionarItem} className="bg-[#1B3A5F] text-white">Adicionar</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Ordem */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1B3A5F]">
                Ordem de Entrada — {ordem.length} participante(s)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ordem.length === 0 && <p className="text-slate-400 text-sm text-center py-4">Nenhum participante na ordem.</p>}
              {ordem.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="w-8 h-8 rounded-full bg-[#1B3A5F] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {item.posicao}
                  </span>
                  <div className="flex-1 min-w-0">
                    {item.tipo_participante === "Autoridade" ? (
                      <>
                        <p className="text-sm font-medium text-slate-800 truncate">{item.autoridade_titulo}</p>
                        <p className="text-xs text-slate-500">{item.autoridade_nome}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-slate-800">{item.oficial_cargo}</p>
                        <p className="text-xs text-slate-500">{item.oficial_nome}</p>
                      </>
                    )}
                  </div>
                  <Badge className={item.tipo_participante === "Autoridade" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}>
                    {item.tipo_participante}
                  </Badge>
                  <button onClick={() => togglePresente(item)} className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${item.presente ? "bg-green-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                    <Check className="w-4 h-4" />
                  </button>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moverPosicao(idx, -1)} disabled={idx === 0}><ArrowUp className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moverPosicao(idx, 1)} disabled={idx === ordem.length - 1}><ArrowDown className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => remover(item.id)}><X className="w-3 h-3" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}