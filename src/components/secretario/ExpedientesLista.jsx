import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/api/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import ExpedienteRow from "@/components/secretario/ExpedienteRow";

export default function ExpedientesLista({ aba, onEditar, onImprimir, onMarcarLido }) {
  const [limite, setLimite] = useState(25);
  const filtro = aba === "avulsos" ? { classe: "Documento avulso" } : { tipo: aba === "recebidos" ? "Recebido" : "Expedido", classe: { $ne: "Documento avulso" } };
  const { data = [], isPending, isFetching, error, refetch } = useQuery({
    queryKey: ["expedientes-secretaria", aba, limite],
    queryFn: () => db.Expediente.filter(filtro, "-data", limite + 1),
    placeholderData: (anterior) => anterior,
  });
  return <Card><CardContent className="space-y-3 p-3 sm:p-4">
    {isPending && <p role="status" className="flex items-center justify-center gap-2 py-8 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Carregando documentos...</p>}
    {error && <div role="alert" className="space-y-2 text-destructive"><p>Não foi possível carregar os documentos: {error.message}</p><Button variant="outline" onClick={() => refetch()}>Tentar novamente</Button></div>}
    {!isPending && !error && !data.length && <p className="py-8 text-center text-muted-foreground">{aba === "avulsos" ? "Nenhum documento avulso salvo." : "Nenhum expediente registrado."}</p>}
    {!error && data.slice(0, limite).map((item) => <ExpedienteRow key={item.id} expediente={item} onEditar={onEditar} onImprimir={onImprimir} onMarcarLido={onMarcarLido} />)}
    {data.length > limite && <Button variant="outline" disabled={isFetching} onClick={() => setLimite((atual) => atual + 25)} className="w-full">{isFetching ? "Carregando..." : "Carregar mais"}</Button>}
  </CardContent></Card>;
}