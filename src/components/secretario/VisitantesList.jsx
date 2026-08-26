import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, UserCheck } from "lucide-react";

export default function VisitantesList({ visitantes, onRemover }) {
  if (visitantes.length === 0) {
    return <p className="text-center text-slate-400 py-6 text-sm">Nenhum irmão visitante registrado nesta sessão.</p>;
  }
  return (
    <div className="space-y-2">
      {visitantes.map((v) => (
        <div key={v.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <UserCheck className="w-5 h-5 text-[#1B3A5F] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-800 text-sm truncate">{v.nome}</p>
            <p className="text-xs text-slate-500 truncate">
              {[v.loja, v.potencia].filter(Boolean).join(" • ") || "Loja não informada"}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">{v.grau}</Badge>
          <Button size="sm" variant="outline" className="text-red-700 border-red-300 hover:bg-red-50" onClick={() => onRemover(v)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}