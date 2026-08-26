import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, FileText } from "lucide-react";

const CORES = {
  Pendente: "bg-amber-100 text-amber-800",
  Aprovado: "bg-green-100 text-green-800",
  Reprovado: "bg-red-100 text-red-800",
};

export default function TrabalhoRow({ trabalho, onAvaliar }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-slate-50 rounded-lg">
      <FileText className="w-5 h-5 text-[#1B3A5F] flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 text-sm truncate">{trabalho.titulo}</p>
        <p className="text-xs text-slate-500">
          {trabalho.irmao_nome} • {trabalho.tipo}
          {trabalho.data_apresentacao ? ` • ${new Date(trabalho.data_apresentacao + "T12:00:00").toLocaleDateString("pt-BR")}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={`${CORES[trabalho.status] || "bg-slate-200 text-slate-700"} text-xs`}>
          {trabalho.status}
        </Badge>
        {trabalho.status === "Pendente" && (
          <>
            <Button size="sm" variant="outline" className="text-green-700 border-green-300 hover:bg-green-50 gap-1" onClick={() => onAvaliar(trabalho, "Aprovado")}>
              <Check className="w-4 h-4" /> Aprovar
            </Button>
            <Button size="sm" variant="outline" className="text-red-700 border-red-300 hover:bg-red-50 gap-1" onClick={() => onAvaliar(trabalho, "Reprovado")}>
              <X className="w-4 h-4" /> Reprovar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}