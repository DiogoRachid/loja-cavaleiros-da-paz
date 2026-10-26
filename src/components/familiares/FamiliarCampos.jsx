import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SelecionarIrmao from "@/components/familiares/SelecionarIrmao";
import { TIPOS, hoje } from "@/components/familiares/utils";

export default function FamiliarCampos({ form, onChange, irmao }) {
  const id = useId();
  return <div className="space-y-4">
    {irmao ? <p className="text-sm text-muted-foreground">Irmão responsável: <strong className="text-foreground">{irmao.nome_completo}</strong></p> : <SelecionarIrmao form={form} onChange={onChange} />}
    <div className="space-y-1.5"><Label htmlFor={`${id}-nome`}>Nome completo *</Label><Input id={`${id}-nome`} required maxLength={200} value={form.nome_completo} onChange={(e) => onChange({ nome_completo: e.target.value })} /></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5"><Label htmlFor={`${id}-tipo`}>Parentesco *</Label>
        <Select value={form.tipo} onValueChange={(tipo) => onChange({ tipo })}><SelectTrigger id={`${id}-tipo`}><SelectValue /></SelectTrigger><SelectContent>{TIPOS.map((tipo) => <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>)}</SelectContent></Select>
      </div>
      <div className="space-y-1.5"><Label htmlFor={`${id}-nascimento`}>Data de nascimento</Label><Input id={`${id}-nascimento`} type="date" max={hoje()} value={form.data_nascimento || ""} onChange={(e) => onChange({ data_nascimento: e.target.value })} /></div>
    </div>
    <p className="text-xs text-muted-foreground">Sem a data de nascimento, o familiar fica cadastrado, mas não aparece entre os aniversariantes.</p>
    <div className="space-y-1.5"><Label htmlFor={`${id}-telefone`}>Telefone</Label><Input id={`${id}-telefone`} type="tel" maxLength={40} value={form.telefone || ""} onChange={(e) => onChange({ telefone: e.target.value })} /></div>
    <div className="space-y-1.5"><Label htmlFor={`${id}-obs`}>Observações</Label><Textarea id={`${id}-obs`} rows={3} value={form.observacoes || ""} onChange={(e) => onChange({ observacoes: e.target.value })} /></div>
    <div className="flex items-center gap-2"><Checkbox id={`${id}-ativo`} checked={form.ativo} onCheckedChange={(value) => onChange({ ativo: value === true })} /><Label htmlFor={`${id}-ativo`}>Cadastro ativo para a lista de aniversários</Label></div>
  </div>;
}