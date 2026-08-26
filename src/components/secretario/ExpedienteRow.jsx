import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDownLeft, ArrowUpRight, Printer, Pencil, Check } from "lucide-react";

const CORES_STATUS = {
  Pendente: "bg-amber-100 text-amber-800",
  Lido: "bg-blue-100 text-blue-800",
  Respondido: "bg-green-100 text-green-800",
  Arquivado: "bg-slate-200 text-slate-700",
};

export default function ExpedienteRow({ expediente: e, onEditar, onImprimir, onMarcarLido }) {
  const Icone = e.tipo === "Recebido" ? ArrowDownLeft : ArrowUpRight;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-slate-50 rounded-lg">
      <Icone className={`w-5 h-5 flex-shrink-0 ${e.tipo === "Recebido" ? "text-blue-600" : "text-[#C9A227]"}`} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 text-sm truncate">
          {e.classe}{e.numero ? ` nº ${e.numero}` : ""} — {e.assunto}
        </p>
        <p className="text-xs text-slate-500 truncate">
          {e.tipo === "Recebido" ? `De: ${e.remetente || "—"}` : `Para: ${e.destinatario || "—"}`}
          {e.data ? ` • ${new Date(e.data + "T12:00:00").toLocaleDateString("pt-BR")}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={`${CORES_STATUS[e.status] || "bg-slate-200 text-slate-700"} text-xs`}>{e.status}</Badge>
        {e.status === "Pendente" && (
          <Button size="sm" variant="outline" className="gap-1 text-blue-700 border-blue-300 hover:bg-blue-50" onClick={() => onMarcarLido(e)}>
            <Check className="w-4 h-4" /> Lido
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => onEditar(e)}><Pencil className="w-4 h-4" /></Button>
        <Button size="sm" variant="outline" onClick={() => onImprimir(e)}><Printer className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}