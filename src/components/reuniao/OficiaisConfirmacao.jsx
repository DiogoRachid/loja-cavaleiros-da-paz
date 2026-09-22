import { Card, CardContent } from "@/components/ui/card";
import OficialConfirmacaoRow from "@/components/reuniao/OficialConfirmacaoRow";

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

  const removerSubstituto = (idx) => setSubstituto(idx, "");

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
      <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)_8rem] gap-4 px-4 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground xl:grid">
        <span>Cargo</span><span>Titular</span><span>Substituto</span><span className="text-center">Presença</span>
      </div>
      {quadro.map((o, idx) => <OficialConfirmacaoRow key={`${o.cargo}-${idx}`} oficial={o} irmaos={irmaosOrdenados} substitutoId={resolverSubstitutoId(o)} onToggle={() => toggleConfirmado(idx)} onSubstituto={v => setSubstituto(idx, v)} onRemove={() => removerSubstituto(idx)} />)}
    </div>
  );
}