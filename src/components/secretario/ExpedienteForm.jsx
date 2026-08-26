import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export const CLASSES = ["Prancha", "Ofício", "Convite", "Circular", "Balaústre", "Edital", "Outro"];

export default function ExpedienteForm({ open, onClose, onSalvar, sessoes, inicial }) {
  const [form, setForm] = useState(
    inicial || {
      tipo: "Recebido",
      classe: "Prancha",
      numero: "",
      data: new Date().toISOString().slice(0, 10),
      remetente: "",
      destinatario: "",
      assunto: "",
      conteudo: "",
      sessao_id: "",
      status: "Pendente",
    }
  );
  const [salvando, setSalvando] = useState(false);
  const set = (c, v) => setForm((f) => ({ ...f, [c]: v }));

  const salvar = async () => {
    if (!form.assunto) return;
    setSalvando(true);
    await onSalvar(form);
    setSalvando(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1B3A5F]">
            {inicial ? "Editar expediente" : "Novo expediente"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => set("tipo", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Recebido">Recebido</SelectItem>
                  <SelectItem value="Expedido">Expedido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Espécie</Label>
              <Select value={form.classe} onValueChange={(v) => set("classe", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CLASSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Número</Label>
              <Input value={form.numero} onChange={(e) => set("numero", e.target.value)} placeholder="Ex: 012/2026" />
            </div>
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Input type="date" value={form.data || ""} onChange={(e) => set("data", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Remetente</Label>
              <Input value={form.remetente} onChange={(e) => set("remetente", e.target.value)} placeholder="Quem enviou" />
            </div>
            <div className="space-y-1.5">
              <Label>Destinatário</Label>
              <Input value={form.destinatario} onChange={(e) => set("destinatario", e.target.value)} placeholder="Para quem" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Assunto</Label>
            <Input value={form.assunto} onChange={(e) => set("assunto", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Conteúdo</Label>
            <Textarea rows={6} value={form.conteudo} onChange={(e) => set("conteudo", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Sessão de leitura (opcional)</Label>
            <Select value={form.sessao_id || ""} onValueChange={(v) => set("sessao_id", v)}>
              <SelectTrigger><SelectValue placeholder="Vincular a uma sessão" /></SelectTrigger>
              <SelectContent>
                {sessoes.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {new Date(s.data + "T12:00:00").toLocaleDateString("pt-BR")} — {s.tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={salvar} disabled={salvando || !form.assunto} className="bg-[#1B3A5F] hover:bg-[#152e4d] gap-2">
              {salvando && <Loader2 className="w-4 h-4 animate-spin" />} Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}