import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Printer, Trash2 } from "lucide-react";

const CORES_STATUS = {
  "Rascunho": "bg-slate-100 text-slate-700",
  "Concluído": "bg-blue-100 text-blue-800",
  "Lido em Sessão": "bg-emerald-100 text-emerald-800",
};

const CORES_CONCLUSAO = {
  "Favorável": "bg-emerald-100 text-emerald-800",
  "Contrário": "bg-red-100 text-red-800",
  "Com ressalvas": "bg-amber-100 text-amber-800",
};

export default function ParecerRow({ parecer, onEditar, onImprimir, onExcluir }) {
  return (
    <div className="p-4 border rounded-xl bg-white flex flex-col md:flex-row md:items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-slate-800 truncate">{parecer.titulo}</p>
          <Badge variant="outline">{parecer.tipo}</Badge>
          <Badge className={CORES_CONCLUSAO[parecer.conclusao]}>{parecer.conclusao}</Badge>
          <Badge className={CORES_STATUS[parecer.status]}>{parecer.status}</Badge>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {parecer.referencia_descricao && `${parecer.referencia_descricao} • `}
          {parecer.data_parecer && new Date(parecer.data_parecer + "T12:00:00").toLocaleDateString("pt-BR")}
          {parecer.sessao_data && ` • Sessão de ${new Date(parecer.sessao_data + "T12:00:00").toLocaleDateString("pt-BR")}`}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={() => onImprimir(parecer)} title="Imprimir">
          <Printer className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onEditar(parecer)} title="Editar">
          <Pencil className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" className="text-red-600" onClick={() => onExcluir(parecer)} title="Excluir">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}