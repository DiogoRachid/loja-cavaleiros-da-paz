import { Badge } from "@/components/ui/badge";
import { User, CalendarDays } from "lucide-react";

export default function IrmaoGrauCard({ irmao, mesesNoGrau, frequencia, apto }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {irmao.foto_url ? (
            <img src={irmao.foto_url} alt={irmao.nome_completo} className="w-full h-full object-cover" />
          ) : (
            <User className="w-5 h-5 text-slate-400" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-[#1B3A5F] text-sm truncate">{irmao.nome_completo}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            {mesesNoGrau !== null ? `${mesesNoGrau} ${mesesNoGrau === 1 ? "mês" : "meses"} no grau` : "Data do grau não cadastrada"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="text-xs">
          Frequência: {frequencia !== null ? `${frequencia}%` : "—"}
        </Badge>
        {apto ? (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">Apto ao próximo grau</Badge>
        ) : (
          <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 text-xs">Em formação</Badge>
        )}
      </div>
    </div>
  );
}