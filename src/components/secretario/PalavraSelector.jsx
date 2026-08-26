import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, X, Plus } from "lucide-react";

// Lista suspensa dos que usaram da palavra: irmãos presentes, visitantes e autoridades
export default function PalavraSelector({ opcoes, oradores, onChange }) {
  const [sel, setSel] = useState("");
  const [assunto, setAssunto] = useState("");

  const adicionar = () => {
    if (!sel) return;
    const opcao = opcoes.find((o) => o.valor === sel);
    if (!opcao) return;
    onChange([...oradores, { nome: opcao.label, tipo: opcao.tipo, assunto: assunto.trim() }]);
    setSel("");
    setAssunto("");
  };

  const remover = (i) => onChange(oradores.filter((_, idx) => idx !== i));

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#1B3A5F]">
          <MessageSquare className="w-4 h-4" /> Usaram da Palavra
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={sel} onValueChange={setSel}>
            <SelectTrigger className="sm:w-72">
              <SelectValue placeholder="Selecione quem usou da palavra" />
            </SelectTrigger>
            <SelectContent>
              {opcoes.map((o) => (
                <SelectItem key={o.valor} value={o.valor}>
                  {o.tipo === "Irmão" ? "" : `[${o.tipo}] `}{o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
            placeholder="Assunto (opcional)"
            className="flex-1"
          />
          <Button onClick={adicionar} disabled={!sel} className="gap-2 bg-[#1B3A5F] hover:bg-[#152e4d]">
            <Plus className="w-4 h-4" /> Adicionar
          </Button>
        </div>

        {oradores.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {oradores.map((o, i) => (
              <Badge key={i} variant="outline" className="gap-1 py-1">
                {o.tipo !== "Irmão" && <span className="text-slate-400">{o.tipo}</span>}
                {o.nome}{o.assunto ? ` — ${o.assunto}` : ""}
                <button onClick={() => remover(i)} className="ml-1 text-slate-400 hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}