import { BookOpen } from "lucide-react";

export default function PreviaCompartilhamento({ titulo, capa, tipo, autor, grau = "Aprendiz", tipoAcervo, itemId }) {
  const digital = tipoAcervo === "digital";
  const grauObra = grau || "Aprendiz";
  const emoji = { Aprendiz: "🔵", Companheiro: "🟡", Mestre: "🔴" }[grauObra] || "";
  const link = `${window.location.origin}/AcervoPublico?id=${encodeURIComponent(itemId)}&tipo=${tipoAcervo}`;
  const mensagem = `${digital ? "📄 Novo documento disponível no acervo digital!" : "📚 Novo item disponível no acervo físico!"}\n\n` +
    (tipo ? `Tipo: ${tipo}\n` : "") + `Título: ${titulo || "—"}\n` +
    (autor ? `Autor: ${autor}\n` : "") + `Grau mínimo: ${emoji} ${grauObra}\n` +
    `\nLoja Cavaleiros da Paz nº25\n${link}`;
  return <>
    <div className="flex flex-col items-center gap-2">
      {capa ? <>
        <img src={capa} alt={titulo} className="h-44 w-32 rounded-xl object-cover shadow-md" />
        <button type="button" className="text-xs text-primary underline" onClick={() => window.open(capa, "_blank", "noopener,noreferrer")}>Abrir capa separadamente</button>
      </> : <div className="flex h-44 w-32 items-center justify-center rounded-xl bg-muted"><BookOpen className="h-10 w-10 text-muted-foreground" /></div>}
    </div>
    <div className="whitespace-pre-wrap break-words rounded-xl border border-border bg-muted p-3 font-mono text-xs leading-relaxed text-foreground">{mensagem}</div>
  </>;
}
