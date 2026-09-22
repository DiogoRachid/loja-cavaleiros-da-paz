import PortaisCargos from "@/components/vm/PortaisCargos";
import { LayoutGrid } from "lucide-react";

export default function AdminPortais() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-border pb-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-card"><LayoutGrid className="h-7 w-7 text-lodge-gold" /></div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-lodge-navy">Portais dos Cargos</h1>
          <p className="text-sm text-muted-foreground">Acesso do Venerável Mestre a todos os painéis administrativos da Loja</p>
        </div>
      </div>
      <PortaisCargos />
    </div>
  );
}