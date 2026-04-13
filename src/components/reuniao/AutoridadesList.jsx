import { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AutoridadesList({ autoridades, lista, onChange }) {
  const [novaAut, setNovaAut] = useState({ tipo: "cadastrada", id: "", nome_custom: "" });

  const adicionar = () => {
    let nome = "";
    let titulo = "";
    if (novaAut.tipo === "outro") {
      if (!novaAut.nome_custom.trim()) return;
      nome = novaAut.nome_custom.trim();
      titulo = "Outro";
    } else {
      const a = autoridades.find(x => x.id === novaAut.id);
      if (!a) return;
      nome = a.nome;
      titulo = a.titulo;
    }
    onChange([...lista, { tipo: novaAut.tipo, id: novaAut.id, titulo, nome, presente: false }]);
    setNovaAut({ tipo: "cadastrada", id: "", nome_custom: "" });
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

  const autOrdenadas = [...autoridades].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  return (
    <div className="space-y-3">
      {/* Adicionar */}
      <Card className="border-slate-200">
        <CardContent className="p-3 flex flex-wrap gap-2 items-end">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">Tipo</p>
            <Select value={novaAut.tipo} onValueChange={v => setNovaAut({ tipo: v, id: "", nome_custom: "" })}>
              <SelectTrigger className="h-8 w-32 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cadastrada">Cadastrada</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {novaAut.tipo === "cadastrada" ? (
            <div className="space-y-1 flex-1 min-w-48">
              <p className="text-xs text-slate-500 font-medium">Autoridade</p>
              <Select value={novaAut.id} onValueChange={v => setNovaAut({ ...novaAut, id: v })}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  {autOrdenadas.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.titulo} — {a.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-1 flex-1 min-w-48">
              <p className="text-xs text-slate-500 font-medium">Nome</p>
              <Input
                value={novaAut.nome_custom}
                onChange={e => setNovaAut({ ...novaAut, nome_custom: e.target.value })}
                placeholder="Nome da autoridade..."
                className="h-8 text-sm"
              />
            </div>
          )}
          <Button size="sm" onClick={adicionar} className="bg-[#1B3A5F] text-white h-8">
            <Plus className="w-3 h-3 mr-1" /> Adicionar
          </Button>
        </CardContent>
      </Card>

      {/* Lista */}
      {lista.length === 0 && (
        <p className="text-slate-400 text-sm text-center py-4">Nenhuma autoridade adicionada.</p>
      )}
      {lista.map((a, idx) => (
        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
          <span className="w-7 h-7 rounded-full bg-[#1B3A5F] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
            {idx + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800">{a.titulo}</p>
            <p className="text-xs text-slate-500">{a.nome}</p>
          </div>
          <button
            onClick={() => togglePresente(idx)}
            className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${a.presente ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-500"}`}
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