import { useState, useEffect } from "react";
import { FolderOpen } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";

export default function PastaSelector({ value, valueName, onChange }) {
  const [pastas, setPastas] = useState([]);

  useEffect(() => {
    base44.entities.PastaMp3.list("nome", 100).then(setPastas);
  }, []);

  const handleChange = (pastaId) => {
    const p = pastas.find((pa) => pa.id === pastaId);
    onChange(p ? { id: p.id, name: p.nome } : null);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <FolderOpen className="w-4 h-4 text-slate-400 flex-shrink-0" />
      <span className="text-xs text-slate-500 flex-shrink-0">Pasta da etapa:</span>
      <Select value={value || ""} onValueChange={handleChange}>
        <SelectTrigger className="h-8 text-xs w-full sm:w-[220px]">
          <SelectValue placeholder="Selecionar pasta" />
        </SelectTrigger>
        <SelectContent>
          {value && !pastas.some((p) => p.id === value) && (
            <SelectItem value={value}>{valueName || "Pasta antiga (removida)"}</SelectItem>
          )}
          {pastas.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}