import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const TIPOS = ["Expediente", "Trabalho", "Proposta", "Balaústre", "Sindicância", "Outro"];
const CONCLUSOES = ["Favorável", "Contrário", "Com ressalvas"];
const STATUS = ["Rascunho", "Concluído", "Lido em Sessão"];

export default function ParecerForm({ parecer, sessoes, onSalvar, onCancelar }) {
  const [form, setForm] = useState({
    tipo: parecer?.tipo || "Expediente",
    titulo: parecer?.titulo || "",
    referencia_descricao: parecer?.referencia_descricao || "",
    sessao_id: parecer?.sessao_id || "",
    teor: parecer?.teor || "",
    conclusao: parecer?.conclusao || "Favorável",
    status: parecer?.status || "Rascunho",
    data_parecer: parecer?.data_parecer || new Date().toISOString().slice(0, 10),
  });
  const [salvando, setSalvando] = useState(false);

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const submit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    const sessao = sessoes.find((s) => s.id === form.sessao_id);
    await onSalvar({ ...form, sessao_id: form.sessao_id || null, sessao_data: sessao?.data || null });
    setSalvando(false);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Tipo</Label>
          <Select value={form.tipo} onValueChange={(v) => set("tipo", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Data do parecer</Label>
          <Input type="date" value={form.data_parecer} onChange={(e) => set("data_parecer", e.target.value)} />
        </div>
      </div>

      <div>
        <Label>Assunto *</Label>
        <Input value={form.titulo} onChange={(e) => set("titulo", e.target.value)} required placeholder="Ex: Proposta de iniciação do candidato..." />
      </div>

      <div>
        <Label>Referência</Label>
        <Input value={form.referencia_descricao} onChange={(e) => set("referencia_descricao", e.target.value)} placeholder="Prancha nº, trabalho, balaústre etc." />
      </div>

      <div>
        <Label>Sessão</Label>
        <Select value={form.sessao_id} onValueChange={(v) => set("sessao_id", v)}>
          <SelectTrigger><SelectValue placeholder="Sem vínculo com sessão" /></SelectTrigger>
          <SelectContent>
            {sessoes.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {new Date(s.data + "T12:00:00").toLocaleDateString("pt-BR")} — {s.tipo} ({s.grau})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Teor do parecer</Label>
        <Textarea rows={9} value={form.teor} onChange={(e) => set("teor", e.target.value)} placeholder="Fundamentação legal e ritualística..." />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Conclusão</Label>
          <Select value={form.conclusao} onValueChange={(v) => set("conclusao", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CONCLUSOES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Situação</Label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancelar}>Cancelar</Button>
        <Button type="submit" className="flex-1 bg-[#1B3A5F] hover:bg-[#152e4d]" disabled={salvando}>
          {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar parecer"}
        </Button>
      </div>
    </form>
  );
}