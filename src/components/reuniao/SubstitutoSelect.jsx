import { useState } from "react";
import { X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function SubstitutoSelect({ irmaos, value, onChange }) {
  const [busca, setBusca] = useState("");
  const termo = busca.trim().toLowerCase();
  const lista = termo
    ? irmaos.filter(ir => (ir.nome_completo || "").toLowerCase().includes(termo))
    : irmaos;

  return (
    <div className="relative">
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-sm w-full pr-8">
          <SelectValue placeholder="Selecionar substituto..." />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          <div className="p-1 sticky top-0 bg-white z-10">
            <Input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              onKeyDown={e => e.stopPropagation()}
              placeholder="Buscar irmão..."
              className="h-8 text-sm"
            />
          </div>
          {lista.length === 0 && (
            <p className="px-3 py-2 text-sm text-slate-400">Nenhum irmão encontrado.</p>
          )}
          {lista.map(ir => (
            <SelectItem key={ir.id} value={ir.id}>{ir.nome_completo}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          title="Remover substituto"
          className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}