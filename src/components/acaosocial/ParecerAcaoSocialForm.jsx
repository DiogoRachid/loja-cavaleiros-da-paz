import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const CONCLUSOES = ["Favorável", "Contrário", "Com ressalvas"];

export default function ParecerAcaoSocialForm({ pedido, onSalvar, onCancelar }) {
  const [form, setForm] = useState({
    parecer_teor: pedido?.parecer_teor || "",
    parecer_conclusao: pedido?.parecer_conclusao || "Favorável",
    parecer_valor_sugerido: pedido?.parecer_valor_sugerido ?? "",
    parecer_data: pedido?.parecer_data || new Date().toISOString().slice(0, 10),
  });
  const [salvando, setSalvando] = useState(false);

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const submit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    await onSalvar({
      ...form,
      parecer_valor_sugerido:
        form.parecer_valor_sugerido === "" ? null : parseFloat(String(form.parecer_valor_sugerido).replace(",", ".")),
      status: "Parecer Emitido",
    });
    setSalvando(false);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="p-3 bg-slate-50 rounded-lg">
        <p className="font-medium text-slate-800 text-sm">{pedido.titulo}</p>
        <p className="text-xs text-slate-500">
          {pedido.solicitante} • {pedido.tipo_auxilio} • leitura no Grau de {pedido.grau}
        </p>
      </div>

      <div>
        <Label>Teor do parecer</Label>
        <Textarea rows={8} value={form.parecer_teor} onChange={(e) => set("parecer_teor", e.target.value)} placeholder="Análise do pedido, diligências realizadas e recomendação à Loja..." />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label>Conclusão</Label>
          <Select value={form.parecer_conclusao} onValueChange={(v) => set("parecer_conclusao", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CONCLUSOES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Valor sugerido (R$)</Label>
          <Input value={form.parecer_valor_sugerido} onChange={(e) => set("parecer_valor_sugerido", e.target.value)} placeholder="0,00" />
        </div>
        <div>
          <Label>Data do parecer</Label>
          <Input type="date" value={form.parecer_data} onChange={(e) => set("parecer_data", e.target.value)} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancelar}>Cancelar</Button>
        <Button type="submit" className="flex-1 bg-[#1B3A5F] hover:bg-[#152e4d]" disabled={salvando}>
          {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Emitir parecer"}
        </Button>
      </div>
    </form>
  );
}