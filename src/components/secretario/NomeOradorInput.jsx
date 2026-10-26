import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import SugestoesIrmaos from "@/components/secretario/SugestoesIrmaos";

export default function NomeOradorInput({ value, onChange }) {
  const root = useRef(null);
  const [fechado, setFechado] = useState(false);
  const selecionar = (irmao) => { onChange(`Ir∴ ${irmao.nome_completo}`, irmao.id); setFechado(true); };
  return <div ref={root} className="relative min-w-0 flex-1" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFechado(true); }}>
    <Input aria-label="Nome do irmão que usou da palavra" value={value} onFocus={() => setFechado(false)} onChange={(e) => { onChange(e.target.value, ""); setFechado(false); }} placeholder="Digite @ e o nome do irmão" autoComplete="off" />
    {value.startsWith("@") && !fechado && <SugestoesIrmaos busca={value.slice(1)} alvoRef={root} onSelect={selecionar} onClose={() => setFechado(true)} />}
  </div>;
}