import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import EditorTextoRico from "@/components/secretario/EditorTextoRico";
import DataVerdadeiraLuz from "@/components/secretario/DataVerdadeiraLuz";
import { lerDocumento, salvarDocumento } from "@/components/secretario/textoRico";
import { hojeCivil, dataJudaica } from "@/components/secretario/calendarioJudaico";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export const CLASSES = ["Prancha", "Ofício", "Convite", "Circular", "Balaústre", "Edital", "Lei", "Decreto", "Ato", "Outro", "Documento avulso"];

export default function ExpedienteForm({ open, onClose, onSalvar, sessoes = [], inicial, avulso = false }) {
  const [form, setForm] = useState(() => ({
    tipo: avulso ? "Expedido" : "Recebido", classe: avulso ? "Documento avulso" : "Prancha",
    numero: "", data: hojeCivil(), remetente: "", destinatario: "", assunto: "", sessao_id: "", status: "Pendente",
    ...(inicial || {}), conteudo: lerDocumento(inicial?.conteudo).texto,
  }));
  const [aposPorDoSol, setAposPorDoSol] = useState(() => lerDocumento(inicial?.conteudo).aposPorDoSol);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const documentoAvulso = form.classe === "Documento avulso";
  const set = (c, v) => setForm((f) => ({ ...f, [c]: v, ...(c === "classe" && v === "Documento avulso" ? { tipo: "Expedido", sessao_id: "" } : {}) }));

  const salvar = async () => {
    if (!form.assunto?.trim() || !dataJudaica(form.data, aposPorDoSol)) {
      setErro("Informe o assunto ou título e uma data válida.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      await onSalvar({ ...form, assunto: form.assunto.trim(), conteudo: salvarDocumento(form.conteudo, aposPorDoSol) });
      onClose();
    } catch (error) {
      setErro(`Não foi possível salvar o documento: ${error.message}`);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1B3A5F]">
            {documentoAvulso ? (inicial ? "Editar documento avulso" : "Novo documento avulso") : (inicial ? "Editar expediente" : "Novo expediente")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.tipo} disabled={documentoAvulso} onValueChange={(v) => set("tipo", v)}>
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
          <DataVerdadeiraLuz data={form.data} aposPorDoSol={aposPorDoSol} onChange={setAposPorDoSol} />

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
            <Label>{documentoAvulso ? "Título" : "Assunto"}</Label>
            <Input value={form.assunto} onChange={(e) => set("assunto", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Conteúdo</Label>
            <EditorTextoRico value={form.conteudo} onChange={(texto) => set("conteudo", texto)} label="Conteúdo do documento" />
          </div>

          {!documentoAvulso && <div className="space-y-1.5">
            <Label>Sessão de leitura (opcional)</Label>
            <Select value={form.sessao_id || "sem-sessao"} onValueChange={(v) => set("sessao_id", v === "sem-sessao" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Vincular a uma sessão" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sem-sessao">Sem vínculo com uma sessão</SelectItem>
                {sessoes.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {new Date(s.data + "T12:00:00").toLocaleDateString("pt-BR")} — {s.tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>}

          {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
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