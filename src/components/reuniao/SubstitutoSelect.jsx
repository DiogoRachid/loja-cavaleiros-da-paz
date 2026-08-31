import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function SubstitutoSelect({ irmaos, titularId, titularNome, value, onChange }) {
  const [busca, setBusca] = useState("");
  const termo = busca.trim().toLowerCase();
  const elegiveis = irmaos.filter(ir => ir.id !== titularId && ir.nome_completo !== titularNome);
  const lista = termo
    ? elegiveis.filter(ir => (ir.nome_completo || "").toLowerCase().includes(termo))
    : elegiveis;

  return (
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger className="h-8 text-sm w-full">
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
  );
}