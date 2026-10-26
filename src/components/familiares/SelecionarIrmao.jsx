import { useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/api/db";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { filtroBusca } from "@/components/familiares/utils";

export default function SelecionarIrmao({ form, onChange }) {
  const id = useId();
  const [busca, setBusca] = useState("");
  const { data = [], isPending, error } = useQuery({
    queryKey: ["familia-irmaos", busca],
    queryFn: () => db.FamiliaIrmao.filter(filtroBusca(busca), "nome_completo,id", 21),
  });
  const opcoes = data.slice(0, 20);
  const selecionar = (valor) => {
    const irmao = data.find((item) => item.id === valor);
    if (irmao) onChange({ irmao_id: irmao.id, irmao_nome: irmao.nome_completo, irmao_numero_glp: irmao.numero_glp });
  };
  return <div className="space-y-2">
    <Label htmlFor={`${id}-busca`}>Irmão responsável *</Label>
    <Input id={`${id}-busca`} value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Localizar por nome ou número GLP" />
    <Select value={form.irmao_id || undefined} onValueChange={selecionar}>
      <SelectTrigger aria-label="Selecionar irmão responsável"><SelectValue placeholder={isPending ? "Carregando irmãos..." : "Selecione o irmão"} /></SelectTrigger>
      <SelectContent>
        {form.irmao_id && !opcoes.some((item) => item.id === form.irmao_id) && <SelectItem value={form.irmao_id}>{form.irmao_nome} · GLP {form.irmao_numero_glp}</SelectItem>}
        {opcoes.map((item) => <SelectItem key={item.id} value={item.id}>{item.nome_completo} · GLP {item.numero_glp}{!item.ativo ? " (inativo)" : ""}</SelectItem>)}
      </SelectContent>
    </Select>
    {error && <p role="alert" className="text-sm text-destructive">Não foi possível localizar os irmãos: {error.message}</p>}
    {!isPending && !error && !data.length && <p className="text-xs text-muted-foreground">Nenhum irmão encontrado.</p>}
    {data.length > 20 && <p className="text-xs text-muted-foreground">Digite mais partes do nome para localizar outros irmãos.</p>}
  </div>;
}