import { History } from "lucide-react";
import LogAtividades from "@/components/vm/LogAtividades";

export default function AdminLogAtividades() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-border pb-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-card">
          <History className="h-7 w-7 text-lodge-gold" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-lodge-navy">Log de Acessos</h1>
          <p className="text-sm text-muted-foreground">Logins e downloads de arquivos dos Irmãos</p>
        </div>
      </div>
      <LogAtividades />
    </div>
  );
}