import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function EscolhaCargoAcesso({ nome, opcoes, loading, onConfirmar, onVoltar }) {
  const [selecionado, setSelecionado] = useState("");
  const opcao = opcoes.find((item) => item.id === selecionado);
  return <form onSubmit={(event) => { event.preventDefault(); if (opcao) onConfirmar(opcao.id); }} className="space-y-5">
    <div className="space-y-1"><h2 className="font-heading text-xl font-semibold text-primary-foreground">Escolha como acessar</h2><p className="text-sm text-primary-foreground/80">{nome}, selecione a função que deseja exercer neste acesso.</p></div>
    <fieldset disabled={loading} className="space-y-3">
      <legend className="sr-only">Funções disponíveis</legend>
      {opcoes.map((item) => <label key={item.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${selecionado === item.id ? "border-lodge-gold bg-lodge-gold/10" : "border-lodge-gold/30 bg-landing-deep/70"}`}>
        <input type="radio" name="cargo-acesso" value={item.id} checked={selecionado === item.id} onChange={() => setSelecionado(item.id)} className="mt-1 shrink-0" required />
        <span className="min-w-0 space-y-1"><span className="block break-words font-semibold text-primary-foreground">{item.cargo}</span><span className="block text-sm text-lodge-gold">{item.tipo}</span><span className="block text-xs text-primary-foreground/70">{item.origem}</span></span>
      </label>)}
    </fieldset>
    <Button type="submit" disabled={loading || !opcao} className="w-full bg-lodge-gold font-semibold text-landing-deep hover:bg-lodge-gold/80">{loading ? "Verificando função..." : "Acessar função escolhida"}</Button>
    <Button type="button" disabled={loading} onClick={onVoltar} variant="outline" className="w-full border-lodge-gold/40 bg-transparent text-primary-foreground hover:bg-landing-bright/50 hover:text-primary-foreground">Voltar ao login</Button>
  </form>;
}