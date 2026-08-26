import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CargoIcon from "@/components/CargoIcon";
import SubstitutoSelect from "@/components/reuniao/SubstitutoSelect";

export default function OficiaisConfirmacao({ quadro, irmaos, onChange }) {
  const toggleConfirmado = (idx) => {
    const updated = quadro.map((o, i) =>
      i === idx ? { ...o, confirmado: !o.confirmado } : o
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

  // Após a troca de banco os IDs mudaram: revincula o substituto pelo nome
  const resolverSubstitutoId = (o) => {
    if (o.substituto_id && irmaos.some(ir => ir.id === o.substituto_id)) return o.substituto_id;
    const porNome = irmaos.find(ir => ir.nome_completo === o.substituto_nome);
    return porNome?.id || "";
  };

  const irmaosOrdenados = [...irmaos]
    .sort((a, b) => (a.nome_completo || "").localeCompare(b.nome_completo || "", "pt-BR"));

  if (quadro.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-slate-400">
          Nenhum oficial no quadro do ano atual.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {quadro.map((o, idx) => (
        <Card key={idx} className={`transition-all ${o.confirmado ? "border-green-300 bg-green-50" : ""}`}>
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              {/* Botão confirmar */}
              <button
                onClick={() => toggleConfirmado(idx)}
                className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center mt-1 transition-colors ${
                  o.confirmado ? "bg-green-500 text-white" : "bg-slate-200 text-slate-400 hover:bg-slate-300"
                }`}
              >
                <Check className="w-4 h-4" />
              </button>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-semibold text-[#1B3A5F] text-sm flex items-center gap-2">
                      <CargoIcon cargo={o.cargo} className="w-9 h-9 text-[#C9A227]" />
                      {o.cargo}
                    </p>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {o.titular_nome || <span className="text-slate-400 italic">Não definido</span>}
                    </p>
                  </div>
                  {o.confirmado && (
                    <Badge className="bg-green-100 text-green-800 flex-shrink-0">
                      {o.substituto_nome ? `Confirmado — Substituto: ${o.substituto_nome}` : "Confirmado"}
                    </Badge>
                  )}
                </div>

                <div className="mt-2">
                  <SubstitutoSelect
                    irmaos={irmaosOrdenados}
                    value={resolverSubstitutoId(o)}
                    onChange={v => setSubstituto(idx, v)}
                  />
                  {o.substituto_nome && (
                    <p className="text-xs text-amber-700 mt-1">✦ Substituto: {o.substituto_nome}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}