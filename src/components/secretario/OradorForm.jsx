import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NomeOradorInput from "@/components/secretario/NomeOradorInput";

export default function OradorForm({ onAdicionar, inicial, onCancelar }) {
  const [tipo, setTipo] = useState(inicial?.tipo || "Irmão");
  const [nome, setNome] = useState(inicial?.nome || "");
  const [irmaoId, setIrmaoId] = useState(inicial?.irmao_id || "");
  const [assunto, setAssunto] = useState(inicial?.assunto || "");
  const valido = nome.trim() && (tipo !== "Irmão" || irmaoId || (inicial?.tipo === "Irmão" && nome === inicial.nome));
  const adicionar = () => {
    if (!valido) return;
    if (onAdicionar({ nome: nome.trim(), tipo, assunto: assunto.trim(), ...(irmaoId ? { irmao_id: irmaoId } : {}) }) === false) return;
    setNome(""); setIrmaoId(""); setAssunto("");
  };
  return <div className="space-y-3">
    <p className="text-xs text-muted-foreground">Para irmãos cadastrados, digite @ e selecione o nome. Para visitantes e autoridades, informe o nome manualmente.</p>
    <div className="flex flex-col gap-2 sm:flex-row">
      <Select value={tipo} onValueChange={(valor) => { setTipo(valor); setNome(""); setIrmaoId(""); }}><SelectTrigger aria-label="Tipo de orador" className="sm:w-40"><SelectValue /></SelectTrigger><SelectContent>{["Irmão", "Visitante", "Autoridade"].map((valor) => <SelectItem key={valor} value={valor}>{valor}</SelectItem>)}</SelectContent></Select>
      {tipo === "Irmão" ? <NomeOradorInput value={nome} onChange={(valor, id) => { setNome(valor); setIrmaoId(id); }} /> : <Input aria-label={`Nome do ${tipo.toLowerCase()}`} value={nome} onChange={(e) => setNome(e.target.value)} placeholder={tipo === "Autoridade" ? "Título e nome da autoridade" : "Nome do visitante"} className="flex-1" />}
    </div>
    <div className="flex flex-col gap-2 sm:flex-row"><Input aria-label="Assunto da manifestação" value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder="Assunto (opcional)" className="flex-1" />{onCancelar && <Button variant="outline" onClick={onCancelar}>Cancelar edição</Button>}<Button onClick={adicionar} disabled={!valido}>{inicial ? "Salvar manifestação" : "Adicionar orador"}</Button></div>
  </div>;
}