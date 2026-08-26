import { useState } from "react";
import { db } from "@/api/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

const TIPOS = ["Instrução", "Trabalho", "Peça de Arquitetura", "Balaústre"];

export default function TrabalhoForm({ open, onClose, onSalvo, irmaos, sessoes, registradoPor }) {
  const [form, setForm] = useState({
    irmao_id: "",
    tipo: "Instrução",
    titulo: "",
    sessao_id: "",
    data_apresentacao: new Date().toISOString().slice(0, 10),
    observacoes: "",
  });
  const [salvando, setSalvando] = useState(false);

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const salvar = async () => {
    if (!form.irmao_id || !form.titulo) return;
    setSalvando(true);
    const irmao = irmaos.find((i) => i.id === form.irmao_id);
    const sessao = sessoes.find((s) => s.id === form.sessao_id);
    await db.TrabalhoIrmao.create({
      irmao_id: form.irmao_id,
      irmao_nome: irmao?.nome_completo,
      grau: irmao?.grau,
      tipo: form.tipo,
      titulo: form.titulo,
      sessao_id: form.sessao_id || null,
      sessao_data: sessao?.data || null,
      data_apresentacao: form.data_apresentacao,
      observacoes: form.observacoes,
      status: "Pendente",
      registrado_por: registradoPor,
    });
    setSalvando(false);
    setForm({ ...form, titulo: "", observacoes: "" });
    onSalvo();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#1B3A5F]">Registrar apresentação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Irmão</Label>
            <Select value={form.irmao_id} onValueChange={(v) => set("irmao_id", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione o irmão" /></SelectTrigger>
              <SelectContent>
                {irmaos.map((i) => <SelectItem key={i.id} value={i.id}>{i.nome_completo}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => set("tipo", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Input type="date" value={form.data_apresentacao} onChange={(e) => set("data_apresentacao", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Título / Tema</Label>
            <Input value={form.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Ex: Os três primeiros passos" />
          </div>
          <div className="space-y-1.5">
            <Label>Sessão (opcional)</Label>
            <Select value={form.sessao_id} onValueChange={(v) => set("sessao_id", v)}>
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
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={salvar} disabled={salvando || !form.irmao_id || !form.titulo} className="bg-[#1B3A5F] hover:bg-[#152e4d] gap-2">
              {salvando && <Loader2 className="w-4 h-4 animate-spin" />} Registrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}