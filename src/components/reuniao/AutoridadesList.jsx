import { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AutoridadesList({ autoridades, lista, onChange }) {
  const [novaAut, setNovaAut] = useState({ tipo: "cadastrada", potencia: "", id: "", nome_custom: "", titulo_custom: "" });

  // Potências únicas ordenadas
  const potencias = [...new Set(autoridades.map(a => a.potencia).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));

  // Autoridades filtradas pela potência selecionada
  const autFiltradas = [...autoridades]
    .filter(a => !novaAut.potencia || a.potencia === novaAut.potencia)
    .sort((a, b) => (a.ordem_protocolar || 999) - (b.ordem_protocolar || 999) || a.nome.localeCompare(b.nome, "pt-BR"));

  const adicionar = () => {
    if (novaAut.tipo === "outro") {
      if (!novaAut.nome_custom.trim()) return;
      onChange([...lista, {
        tipo: "outro",
        id: "",
        titulo: novaAut.titulo_custom.trim() || "Outro",
        nome: novaAut.nome_custom.trim(),
        potencia: "",
        cargo_potencia: "",
        presente: false,
      }]);
      setNovaAut({ tipo: "cadastrada", potencia: "", id: "", nome_custom: "", titulo_custom: "" });
    } else {
      const a = autoridades.find(x => x.id === novaAut.id);
      if (!a) return;
      onChange([...lista, {
        tipo: "cadastrada",
        id: a.id,
        titulo: a.titulo,
        nome: a.nome,
        potencia: a.potencia || "",
        cargo_potencia: a.cargo_potencia || "",
        presente: false,
      }]);
      setNovaAut({ tipo: "cadastrada", potencia: novaAut.potencia, id: "", nome_custom: "", titulo_custom: "" });
    }
  };

  const remover = (idx) => onChange(lista.filter((_, i) => i !== idx));
  const togglePresente = (idx) => onChange(lista.map((a, i) => i === idx ? { ...a, presente: !a.presente } : a));
  const mover = (idx, dir) => {
    const n = [...lista];
    const target = idx + dir;
    if (target < 0 || target >= n.length) return;
    [n[idx], n[target]] = [n[target], n[idx]];
    onChange(n);
  };

  return (
    <div className="space-y-3">
      {/* Formulário de adição */}
      <Card className="border-slate-200">
        <CardContent className="p-3 space-y-3">
          {/* Linha 1: Tipo */}
          <div className="flex flex-wrap gap-2">
            <div className="space-y-1">
              <p className="text-xs text-slate-500 font-medium">Tipo</p>
              <Select value={novaAut.tipo} onValueChange={v => setNovaAut({ tipo: v, potencia: "", id: "", nome_custom: "", titulo_custom: "" })}>
                <SelectTrigger className="h-8 w-32 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cadastrada">Cadastrada</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {novaAut.tipo === "cadastrada" ? (
            <div className="flex flex-wrap gap-2 items-end">
              {/* Potência */}
              <div className="space-y-1 flex-1 min-w-40">
                <p className="text-xs text-slate-500 font-medium">Potência</p>
                <Select value={novaAut.potencia} onValueChange={v => setNovaAut({ ...novaAut, potencia: v, id: "" })}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Todas..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todas as potências</SelectItem>
                    {potencias.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Autoridade */}
              <div className="space-y-1 flex-1 min-w-48">
                <p className="text-xs text-slate-500 font-medium">Autoridade</p>
                <Select value={novaAut.id} onValueChange={v => setNovaAut({ ...novaAut, id: v })}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {autFiltradas.map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.titulo} — {a.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button size="sm" onClick={adicionar} className="bg-[#1B3A5F] text-white h-8">
                <Plus className="w-3 h-3 mr-1" /> Adicionar
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 items-end">
              <div className="space-y-1 min-w-40">
                <p className="text-xs text-slate-500 font-medium">Título / Cargo</p>
                <Input
                  value={novaAut.titulo_custom}
                  onChange={e => setNovaAut({ ...novaAut, titulo_custom: e.target.value })}
                  placeholder="Ex: Venerável Mestre Visitante"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1 flex-1 min-w-48">
                <p className="text-xs text-slate-500 font-medium">Nome</p>
                <Input
                  value={novaAut.nome_custom}
                  onChange={e => setNovaAut({ ...novaAut, nome_custom: e.target.value })}
                  placeholder="Nome completo..."
                  className="h-8 text-sm"
                />
              </div>
              <Button size="sm" onClick={adicionar} className="bg-[#1B3A5F] text-white h-8">
                <Plus className="w-3 h-3 mr-1" /> Adicionar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista */}
      {lista.length === 0 && (
        <p className="text-slate-400 text-sm text-center py-4">Nenhuma autoridade adicionada.</p>
      )}
      {lista.map((a, idx) => (
        <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border ${a.presente ? "bg-green-50 border-green-200" : "bg-slate-50"}`}>
          <span className="w-7 h-7 rounded-full bg-[#1B3A5F] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
            {idx + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800">{a.titulo}</p>
            <p className="text-xs text-slate-600">{a.nome}</p>
            {a.potencia && <p className="text-xs text-slate-400">{a.potencia}{a.cargo_potencia ? ` — ${a.cargo_potencia}` : ""}</p>}
          </div>
          <button
            onClick={() => togglePresente(idx)}
            className={`text-xs px-2 py-1 rounded-full font-medium transition-colors flex-shrink-0 ${a.presente ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-500"}`}
          >
            {a.presente ? "Presente" : "Confirmar"}
          </button>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => mover(idx, -1)} disabled={idx === 0}><ArrowUp className="w-3 h-3" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => mover(idx, 1)} disabled={idx === lista.length - 1}><ArrowDown className="w-3 h-3" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => remover(idx)}><Trash2 className="w-3 h-3" /></Button>
          </div>
        </div>
      ))}
    </div>
  );
}