import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OficiaisConfirmacao({ quadro, irmaos, onChange }) {
  const toggleConfirmado = (idx) => {
    const updated = quadro.map((o, i) =>
      i === idx ? { ...o, confirmado: !o.confirmado, substituto_id: "", substituto_nome: "" } : o
    );
    onChange(updated);
  };

  const setSubstituto = (idx, irmaoId) => {
    const irmao = irmaos.find(ir => ir.id === irmaoId);
    const updated = quadro.map((o, i) =>
      i === idx ? { ...o, substituto_id: irmaoId, substituto_nome: irmao?.nome_completo || "" } : o
    );
    onChange(updated);
  };

  // IDs dos titulares que já estão confirmados como presentes
  const titularesConfirmados = new Set(quadro.filter(o => o.confirmado && o.titular_id).map(o => o.titular_id));
  const irmaosOrdenados = [...irmaos]
    .filter(ir => !titularesConfirmados.has(ir.id))
    .sort((a, b) => a.nome_completo.localeCompare(b.nome_completo, "pt-BR"));

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#1B3A5F] text-white">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Cargo</th>
                <th className="text-left px-4 py-3 font-medium">Titular</th>
                <th className="text-center px-4 py-3 font-medium w-24">Presente</th>
                <th className="text-left px-4 py-3 font-medium">Substituto (se ausente)</th>
              </tr>
            </thead>
            <tbody>
              {quadro.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Nenhum oficial no quadro do ano atual.</td></tr>
              )}
              {quadro.map((o, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="px-4 py-2">
                    <p className="font-medium text-[#1B3A5F] text-sm">{o.cargo}</p>
                  </td>
                  <td className="px-4 py-2">
                    <p className="text-sm text-slate-700">{o.titular_nome || <span className="text-slate-400 italic">Não definido</span>}</p>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => toggleConfirmado(idx)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors ${o.confirmado ? "bg-green-500 text-white" : "bg-slate-200 text-slate-400 hover:bg-slate-300"}`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    {o.confirmado ? (
                      <Badge className="bg-green-100 text-green-800">Confirmado</Badge>
                    ) : (
                      <Select value={o.substituto_id} onValueChange={v => setSubstituto(idx, v)}>
                        <SelectTrigger className="h-8 text-sm max-w-xs">
                          <SelectValue placeholder="Selecionar substituto..." />
                        </SelectTrigger>
                        <SelectContent>
                          {irmaosOrdenados.map(ir => (
                            <SelectItem key={ir.id} value={ir.id}>{ir.nome_completo}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}