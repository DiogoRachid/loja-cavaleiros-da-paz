import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";

export default function VisitanteForm({ onAdicionar }) {
  const [form, setForm] = useState({ nome: "", grau: "Mestre", loja: "", potencia: "", cargo: "" });
  const [salvando, setSalvando] = useState(false);
  const set = (c, v) => setForm((f) => ({ ...f, [c]: v }));

  const adicionar = async () => {
    if (!form.nome) return;
    setSalvando(true);
    await onAdicionar(form);
    setForm({ nome: "", grau: "Mestre", loja: "", potencia: "", cargo: "" });
    setSalvando(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
      <div className="space-y-1.5 md:col-span-2">
        <Label>Nome do irmão visitante</Label>
        <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Grau</Label>
        <Select value={form.grau} onValueChange={(v) => set("grau", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Aprendiz">Aprendiz</SelectItem>
            <SelectItem value="Companheiro">Companheiro</SelectItem>
            <SelectItem value="Mestre">Mestre</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Loja</Label>
        <Input value={form.loja} onChange={(e) => set("loja", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Potência</Label>
        <Input value={form.potencia} onChange={(e) => set("potencia", e.target.value)} />
      </div>
      <Button onClick={adicionar} disabled={salvando || !form.nome} className="bg-[#1B3A5F] hover:bg-[#152e4d] gap-2">
        {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Adicionar
      </Button>
    </div>
  );
}