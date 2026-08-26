import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const TIPOS = ["Financeiro", "Arrecadação", "Ajuda Externa", "Outro"];
const GRAUS = ["Aprendiz", "Companheiro", "Mestre"];

export default function PedidoForm({ pedido, onSalvar, onCancelar }) {
  const [form, setForm] = useState({
    titulo: pedido?.titulo || "",
    solicitante: pedido?.solicitante || "",
    tipo_auxilio: pedido?.tipo_auxilio || "Financeiro",
    descricao: pedido?.descricao || "",
    valor_solicitado: pedido?.valor_solicitado || "",
    prancha_referencia: pedido?.prancha_referencia || "",
    grau: pedido?.grau || "Aprendiz",
    data_recebimento: pedido?.data_recebimento || new Date().toISOString().slice(0, 10),
  });
  const [salvando, setSalvando] = useState(false);

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const submit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    await onSalvar({
      ...form,
      valor_solicitado: form.valor_solicitado === "" ? null : parseFloat(String(form.valor_solicitado).replace(",", ".")),
    });
    setSalvando(false);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label>Assunto da prancha *</Label>
        <Input value={form.titulo} onChange={(e) => set("titulo", e.target.value)} required placeholder="Ex: Pedido de auxílio da Casa de Apoio..." />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Solicitante (externo)</Label>
          <Input value={form.solicitante} onChange={(e) => set("solicitante", e.target.value)} placeholder="Instituição ou pessoa" />
        </div>
        <div>
          <Label>Tipo de auxílio</Label>
          <Select value={form.tipo_auxilio} onValueChange={(v) => set("tipo_auxilio", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label>Valor solicitado (R$)</Label>
          <Input value={form.valor_solicitado} onChange={(e) => set("valor_solicitado", e.target.value)} placeholder="0,00" />
        </div>
        <div>
          <Label>Prancha nº</Label>
          <Input value={form.prancha_referencia} onChange={(e) => set("prancha_referencia", e.target.value)} />
        </div>
        <div>
          <Label>Recebida em</Label>
          <Input type="date" value={form.data_recebimento} onChange={(e) => set("data_recebimento", e.target.value)} />
        </div>
      </div>

      <div>
        <Label>Grau em que deve ser lida</Label>
        <Select value={form.grau} onValueChange={(v) => set("grau", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{GRAUS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div>
        <Label>Descrição do pedido</Label>
        <Textarea rows={6} value={form.descricao} onChange={(e) => set("descricao", e.target.value)} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancelar}>Cancelar</Button>
        <Button type="submit" className="flex-1 bg-[#1B3A5F] hover:bg-[#152e4d]" disabled={salvando}>
          {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar pedido"}
        </Button>
      </div>
    </form>
  );
}