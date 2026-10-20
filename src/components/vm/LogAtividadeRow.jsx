import { LogIn, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const formatar = (d) => d ? new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export default function LogAtividadeRow({ item }) {
  const download = item.tipo === "download";
  const Icon = download ? Download : LogIn;
  return (
    <div className="flex items-center gap-3 py-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${download ? "bg-info-soft text-info" : "bg-lodge-success-soft text-lodge-success"}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-foreground">{item.nome || "—"}</p>
          {item.cargo && item.cargo !== "Nenhum" && <Badge variant="outline" className="text-xs">{item.cargo}</Badge>}
        </div>
        <p className="truncate text-sm text-muted-foreground">
          {download ? `Baixou: ${item.detalhe || "documento"}` : item.detalhe}
        </p>
      </div>
      <p className="shrink-0 text-xs text-muted-foreground">{formatar(item.data)}</p>
    </div>
  );
}