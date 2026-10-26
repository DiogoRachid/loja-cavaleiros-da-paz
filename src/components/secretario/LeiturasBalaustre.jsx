import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { db } from "@/api/db";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CLASSES } from "@/components/secretario/ExpedienteForm";
import DocumentoLeituraRow from "@/components/secretario/DocumentoLeituraRow";
import { resumirLeitura, tituloLeitura } from "@/components/secretario/leiturasBalaustre";

export default function LeiturasBalaustre({ sessaoId, leituras, onChange }) {
  const [busca, setBusca] = useState("");
  const [classe, setClasse] = useState("todas");
  const [origem, setOrigem] = useState("todos");
  const consulta = useInfiniteQuery({
    queryKey: ["leituras-balaustre", sessaoId, busca, classe, origem], initialPageParam: 0,
    queryFn: ({ pageParam }) => db.Expediente.filter({
      ...(busca.trim() ? { assunto: { $ilike: `%${busca.trim().replace(/[\\%_]/g, "\\$&")}%` } } : {}),
      ...(classe !== "todas" ? { classe } : {}), ...(origem === "sessao" ? { sessao_id: sessaoId } : {}),
    }, "-data,id", 26, pageParam),
    getNextPageParam: (ultima, paginas) => ultima.length > 25 ? paginas.length * 25 : undefined,
  });
  const toggle = (doc) => onChange(leituras.some((item) => item.id === doc.id) ? leituras.filter((item) => item.id !== doc.id) : [...leituras, resumirLeitura(doc)]);
  return <Card><CardContent className="space-y-3 p-4">
    <h2 className="text-sm font-semibold text-foreground">Expedientes, leis, decretos e atos lidos</h2>
    <p className="text-xs text-muted-foreground">Marque os documentos lidos no dia para incluí-los na ata. Os vinculados à sessão e marcados como Lido na Secretaria vêm selecionados em um novo balaústre; a seleção é registrada neste balaústre ao salvar.</p>
    {leituras.length > 0 && <div className="space-y-2 rounded-md bg-muted p-3"><p className="text-xs font-semibold">Documentos selecionados</p>{leituras.map((item) => <div key={item.id} className="flex items-start justify-between gap-2 text-sm"><span className="break-words">{tituloLeitura(item)}</span><Button size="sm" variant="ghost" onClick={() => toggle(item)} aria-label={`Remover ${tituloLeitura(item)}`}>Remover</Button></div>)}</div>}
    <div className="grid gap-2 sm:grid-cols-3"><Input aria-label="Buscar documento pelo assunto" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar pelo assunto ou título" /><Select value={classe} onValueChange={setClasse}><SelectTrigger aria-label="Espécie do documento"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todas">Todas as espécies</SelectItem>{CLASSES.map((valor) => <SelectItem key={valor} value={valor}>{valor}</SelectItem>)}</SelectContent></Select><Select value={origem} onValueChange={setOrigem}><SelectTrigger aria-label="Documentos disponíveis"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os documentos</SelectItem><SelectItem value="sessao">Vinculados à sessão</SelectItem></SelectContent></Select></div>
    {consulta.isPending && <p role="status" className="text-sm text-muted-foreground">Carregando documentos...</p>}
    {consulta.error && <div role="alert"><p className="text-sm text-destructive">Não foi possível carregar: {consulta.error.message}</p><Button variant="outline" onClick={() => consulta.refetch()}>Tentar novamente</Button></div>}
    {consulta.data?.pages.flatMap((pagina) => pagina.slice(0, 25)).map((doc) => <DocumentoLeituraRow key={doc.id} documento={doc} sessaoId={sessaoId} selecionado={leituras.some((item) => item.id === doc.id)} onToggle={() => toggle(doc)} />)}
    {!consulta.isPending && !consulta.error && !consulta.data?.pages[0]?.length && <p className="text-sm text-muted-foreground">Nenhum documento encontrado. Cadastre expedientes, leis, decretos e atos na Secretaria para selecioná-los aqui.</p>}
    {consulta.hasNextPage && <Button variant="outline" disabled={consulta.isFetchingNextPage} onClick={() => consulta.fetchNextPage()}>{consulta.isFetchingNextPage ? "Carregando..." : "Carregar mais documentos"}</Button>}
  </CardContent></Card>;
}