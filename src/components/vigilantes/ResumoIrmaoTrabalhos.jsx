import { Badge } from "@/components/ui/badge";

export default function ResumoIrmaoTrabalhos({ irmao, instrucoes, aprovados, pendentes, frequencia }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 text-sm truncate">{irmao.nome_completo}</p>
        <p className="text-xs text-slate-500">GLP: {irmao.numero_glp} • {irmao.grau}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="text-xs">{instrucoes} instrução(ões)</Badge>
        <Badge className="bg-green-100 text-green-800 text-xs">{aprovados} aprovado(s)</Badge>
        {pendentes > 0 && <Badge className="bg-amber-100 text-amber-800 text-xs">{pendentes} pendente(s)</Badge>}
        <Badge variant="outline" className="text-xs">
          Frequência: {frequencia !== null ? `${frequencia}%` : "—"}
        </Badge>
      </div>
    </div>
  );
}