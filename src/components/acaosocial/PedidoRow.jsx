import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Printer, Trash2, Gavel, BookOpenCheck, Clock, Ban } from "lucide-react";

const CORES_STATUS = {
  "Pendente": "bg-amber-100 text-amber-800",
  "Em Análise": "bg-blue-100 text-blue-800",
  "Parecer Emitido": "bg-emerald-100 text-emerald-800",
};

const CORES_LEITURA = {
  "Pendente": "bg-slate-100 text-slate-700",
  "Lido": "bg-emerald-100 text-emerald-800",
  "Não Constará": "bg-red-100 text-red-800",
};

const fmtValor = (v) =>
  v == null ? null : `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

export default function PedidoRow({ pedido, onEditar, onParecer, onImprimir, onExcluir, onLeitura }) {
  return (
    <div className="p-4 border rounded-xl bg-white space-y-3">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-800 truncate">{pedido.titulo}</p>
            <Badge variant="outline">{pedido.tipo_auxilio}</Badge>
            <Badge variant="outline">Grau de {pedido.grau}</Badge>
            <Badge className={CORES_STATUS[pedido.status]}>{pedido.status}</Badge>
            <Badge className={CORES_LEITURA[pedido.leitura_status]}>Leitura: {pedido.leitura_status}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {pedido.solicitante && `${pedido.solicitante} • `}
            {pedido.prancha_referencia && `Prancha nº ${pedido.prancha_referencia} • `}
            {fmtValor(pedido.valor_solicitado) && `Solicitado ${fmtValor(pedido.valor_solicitado)} • `}
            {pedido.data_recebimento && new Date(pedido.data_recebimento + "T12:00:00").toLocaleDateString("pt-BR")}
          </p>
          {pedido.parecer_conclusao && (
            <p className="text-xs text-slate-600 mt-1">
              Parecer <strong>{pedido.parecer_conclusao}</strong>
              {fmtValor(pedido.parecer_valor_sugerido) && ` — sugerido ${fmtValor(pedido.parecer_valor_sugerido)}`}
              {pedido.parecer_autor && ` — ${pedido.parecer_autor}`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => onParecer(pedido)} title="Emitir/editar parecer">
            <Gavel className="w-4 h-4" />
          </Button>
          {pedido.status === "Parecer Emitido" && (
            <Button variant="outline" size="icon" onClick={() => onImprimir(pedido)} title="Imprimir parecer">
              <Printer className="w-4 h-4" />
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={() => onEditar(pedido)} title="Editar pedido">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="text-red-600" onClick={() => onExcluir(pedido)} title="Excluir">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {onLeitura && pedido.status === "Parecer Emitido" && (
        <div className="flex flex-wrap gap-2 pt-1 border-t">
          <Button variant="ghost" size="sm" className="gap-1 text-slate-600" onClick={() => onLeitura(pedido, "Pendente")}>
            <Clock className="w-3.5 h-3.5" /> Pendente de leitura
          </Button>
          <Button variant="ghost" size="sm" className="gap-1 text-emerald-700" onClick={() => onLeitura(pedido, "Lido")}>
            <BookOpenCheck className="w-3.5 h-3.5" /> Marcar como lido
          </Button>
          <Button variant="ghost" size="sm" className="gap-1 text-red-600" onClick={() => onLeitura(pedido, "Não Constará")}>
            <Ban className="w-3.5 h-3.5" /> Não constará em ata
          </Button>
        </div>
      )}
    </div>
  );
}