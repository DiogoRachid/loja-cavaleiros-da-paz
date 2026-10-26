import { Check, HelpCircle, X } from "lucide-react";
export default function SinalLeituraPresenca({ valor, texto }) {
  return <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">{valor === true ? <Check className="h-3.5 w-3.5 text-primary" /> : valor === false ? <X className="h-3.5 w-3.5 text-destructive" /> : <HelpCircle className="h-3.5 w-3.5" />}{texto}: {valor === true ? "sim" : valor === false ? "não" : "incerto"}</span>;
}