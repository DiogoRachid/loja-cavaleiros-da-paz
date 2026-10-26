import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { db } from "@/api/db";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FamiliarForm from "@/components/familiares/FamiliarForm";
import FamiliarRow from "@/components/familiares/FamiliarRow";
import useFamiliares from "@/components/familiares/useFamiliares";
import { atualizarFamiliares, novoFamiliar } from "@/components/familiares/utils";

export default function FamiliaresCadastro({ irmao }) {
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState("");
  const consulta = useFamiliares(busca, irmao);
  const client = useQueryClient();
  const registros = consulta.data?.pages.flatMap((pagina) => pagina.slice(0, 25)) || [];
  const excluir = async (familiar) => {
    if (!window.confirm(`Excluir o cadastro de ${familiar.nome_completo}?`)) return;
    setExcluindo(true); setErro("");
    try { await db.Familiar.delete(familiar.id); await atualizarFamiliares(client); }
    catch (error) { setErro(`Não foi possível excluir: ${error.message}`); }
    finally { setExcluindo(false); }
  };
  return <Card><CardContent className="space-y-4 p-4 sm:p-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-heading text-lg font-semibold text-foreground">Familiares{irmao ? ` de ${irmao.nome_completo}` : " cadastrados"}</h2><Button className="gap-2" onClick={() => setEditando(novoFamiliar(irmao))}><Plus className="h-4 w-4" /> Cadastrar familiar</Button></div>
    <Input aria-label="Buscar familiares" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={irmao ? "Buscar familiar pelo nome..." : "Buscar pelo familiar, irmão ou número GLP..."} />
    {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
    {consulta.isPending && <p role="status" className="py-6 text-center text-muted-foreground">Carregando familiares...</p>}
    {consulta.error && <div role="alert" className="space-y-2"><p className="text-sm text-destructive">Não foi possível carregar: {consulta.error.message}</p><Button variant="outline" onClick={() => consulta.refetch()}>Tentar novamente</Button></div>}
    {!consulta.isPending && !consulta.error && !registros.length && <p className="py-6 text-center text-muted-foreground">{busca ? "Nenhum familiar encontrado." : "Nenhum familiar cadastrado. Use o botão acima para cadastrar."}</p>}
    {registros.map((familiar) => <FamiliarRow key={familiar.id} familiar={familiar} mostrarIrmao={!irmao} onEditar={setEditando} onExcluir={excluir} excluindo={excluindo} />)}
    {consulta.hasNextPage && <Button variant="outline" className="w-full" disabled={consulta.isFetchingNextPage} onClick={() => consulta.fetchNextPage()}>{consulta.isFetchingNextPage ? "Carregando..." : "Carregar mais familiares"}</Button>}
    {editando && <FamiliarForm key={editando.id || "novo"} inicial={editando} irmao={irmao} onClose={() => setEditando(null)} />}
  </CardContent></Card>;
}