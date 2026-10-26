import { Checkbox } from "@/components/ui/checkbox";

export default function QuebraPaginaBalaustre({ ativa, onChange, label = "Iniciar esta seção em nova página na impressão" }) {
  return <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground"><Checkbox checked={ativa === true} onCheckedChange={(valor) => onChange(valor === true)} />{label}</label>;
}