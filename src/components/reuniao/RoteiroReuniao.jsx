import { Plus, Trash2, ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ITENS_PADRAO = [
  { numero: 1, texto: "Lista de Presença; Cédulas de PIX; Datas Festivas", subtexto: "" },
  { numero: 2, texto: "Verificação do Templo", subtexto: "" },
  { numero: 3, texto: "Distribuição de Joias e Montagem da Loja", subtexto: "" },
  { numero: 4, texto: "Desligar celulares e verificar assinatura dos presentes na Lista", subtexto: "" },
  { numero: 5, texto: "Abertura da Loja", subtexto: "" },
  { numero: 6, texto: "Balaustre (Votação)", subtexto: "" },
  { numero: 7, texto: "Bolsa de Propostas", subtexto: "" },
  { numero: 8, texto: "Ordem do Dia", subtexto: "" },
  { numero: 9, texto: "Tronco", subtexto: "" },
  { numero: 10, texto: "Palavra", subtexto: "" },
  { numero: 11, texto: "Minuto da Ritualística", subtexto: "" },
  { numero: 12, texto: "Encerramento", subtexto: "" },
  { numero: 13, texto: "Guarda das Joias; Cédulas; Outros", subtexto: "" },
];

export { ITENS_PADRAO };

export default function RoteiroReuniao({ itens, onChange }) {
  const adicionar = () => {
    const nums = itens.map(i => i.numero);
    const proximo = nums.length > 0 ? Math.max(...nums) + 1 : 1;
    onChange([...itens, { numero: proximo, texto: "", subtexto: "" }]);
  };

  const remover = (idx) => onChange(itens.filter((_, i) => i !== idx));

  const mover = (idx, dir) => {
    const n = [...itens];
    const target = idx + dir;
    if (target < 0 || target >= n.length) return;
    [n[idx], n[target]] = [n[target], n[idx]];
    onChange(n);
  };

  const atualizar = (idx, campo, valor) => {
    onChange(itens.map((item, i) => i === idx ? { ...item, [campo]: valor } : item));
  };

  return (
    <div className="space-y-2">
      {itens.map((item, idx) => (
        <div key={idx} className="flex gap-2 items-start p-3 bg-slate-50 rounded-lg border">
          <GripVertical className="w-4 h-4 text-slate-300 mt-2 flex-shrink-0" />
          <div className="w-16 flex-shrink-0">
            <Input
              type="number"
              value={item.numero}
              onChange={e => atualizar(idx, "numero", parseInt(e.target.value) || "")}
              className="h-8 text-sm text-center"
              placeholder="Nº"
            />
          </div>
          <div className="flex-1 space-y-1">
            <Input
              value={item.texto}
              onChange={e => atualizar(idx, "texto", e.target.value)}
              className="h-8 text-sm"
              placeholder="Descrição do item..."
            />
            <Textarea
              value={item.subtexto}
              onChange={e => atualizar(idx, "subtexto", e.target.value)}
              className="text-xs resize-none"
              rows={2}
              placeholder="Observação / instrução (opcional)..."
            />
          </div>
          <div className="flex flex-col gap-1 flex-shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => mover(idx, -1)} disabled={idx === 0}><ArrowUp className="w-3 h-3" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => mover(idx, 1)} disabled={idx === itens.length - 1}><ArrowDown className="w-3 h-3" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => remover(idx)}><Trash2 className="w-3 h-3" /></Button>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={adicionar} className="border-dashed border-slate-400 text-slate-600 w-full">
        <Plus className="w-3 h-3 mr-1" /> Adicionar Item
      </Button>
    </div>
  );
}