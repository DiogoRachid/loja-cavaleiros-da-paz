import { useId, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AniversariosLista from "@/components/familiares/AniversariosLista";
import { hoje, MESES } from "@/components/familiares/utils";

export default function Aniversarios() {
  const id = useId();
  const [mes, setMes] = useState(Number(hoje().slice(5, 7)));
  const [tipo, setTipo] = useState("todos");
  const [busca, setBusca] = useState("");
  return <Card><CardContent className="space-y-4 p-4 sm:p-5">
    <h2 className="font-heading text-lg font-semibold text-foreground">Aniversários de nascimento</h2>
    <p className="text-sm text-muted-foreground">Irmãos e familiares ativos com data de nascimento cadastrada. As datas seguem o calendário civil, com referência ao horário de Brasília.</p>
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="space-y-1.5"><Label htmlFor={`${id}-mes`}>Mês</Label><Select value={String(mes)} onValueChange={(value) => setMes(Number(value))}><SelectTrigger id={`${id}-mes`}><SelectValue /></SelectTrigger><SelectContent>{MESES.map((nome, index) => <SelectItem key={nome} value={String(index + 1)}>{nome}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-1.5"><Label htmlFor={`${id}-tipo`}>Pessoas</Label><Select value={tipo} onValueChange={setTipo}><SelectTrigger id={`${id}-tipo`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Irmãos e familiares</SelectItem><SelectItem value="irmaos">Somente irmãos</SelectItem><SelectItem value="familiares">Somente familiares</SelectItem></SelectContent></Select></div>
      <div className="space-y-1.5"><Label htmlFor={`${id}-busca`}>Buscar</Label><Input id={`${id}-busca`} value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome do aniversariante ou irmão" /></div>
    </div>
    <AniversariosLista mes={mes} tipo={tipo} busca={busca} />
  </CardContent></Card>;
}