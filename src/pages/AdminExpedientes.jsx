import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "@/api/db";
import { Mail, Loader2, Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ExpedienteForm from "@/components/secretario/ExpedienteForm";
import ExpedientesLista from "@/components/secretario/ExpedientesLista";
import { imprimirExpediente } from "@/components/secretario/imprimirExpediente";

export default function AdminExpedientes() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const [aba, setAba] = useState(urlParams.get("aba") === "avulsos" ? "avulsos" : "recebidos");
  const [avulso, setAvulso] = useState(false);
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const admin = JSON.parse(sessionStorage.getItem("admin_data") || "{}");
  const { data: contexto, isPending: loading, error, refetch } = useQuery({
    queryKey: ["contexto-documentos-secretaria"],
    queryFn: async () => {
      const [sess, lojas, q] = await Promise.all([
        db.Sessao.filter({ status: { $ne: "Cancelada" } }, "-data", 50),
        db.DadosLoja.list(),
        db.QuadroOficiais.filter({ exercicio: new Date().getFullYear().toString() }),
      ]);
      return { sessoes: sess || [], dadosLoja: lojas?.[0] || null, quadro: q || [] };
    },
  });
  const { sessoes = [], dadosLoja = null, quadro = [] } = contexto || {};

  const salvar = async (form) => {
    const sessao = sessoes.find((s) => s.id === form.sessao_id);
    const payload = {
      ...form,
      sessao_id: form.sessao_id || null,
      sessao_data: sessao?.data || null,
      registrado_por: admin.nome_completo || "Secretário",
    };
    if (editando) await db.Expediente.update(editando.id, payload);
    else await db.Expediente.create(payload);
    await queryClient.invalidateQueries({ queryKey: ["expedientes-secretaria"] });
    setAba(form.classe === "Documento avulso" ? "avulsos" : form.tipo === "Recebido" ? "recebidos" : "expedidos");
    setEditando(null);
  };

  const marcarLido = async (e) => {
    await db.Expediente.update(e.id, { status: "Lido" });
    await queryClient.invalidateQueries({ queryKey: ["expedientes-secretaria"] });
  };

  const imprimir = (e) =>
    imprimirExpediente({
      expediente: e,
      dadosLoja,
      secretarioNome: quadro.find((q) => q.cargo === "Secretário")?.titular_nome,
      vmNome: quadro.find((q) => q.cargo === "Venerável Mestre")?.titular_nome,
    });

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  }

  if (error) return <div role="alert" className="space-y-3"><p className="text-destructive">Não foi possível carregar os dados da Secretaria: {error.message}</p><Button variant="outline" onClick={() => refetch()}>Tentar novamente</Button></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center flex-shrink-0">
            <Mail className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1B3A5F]">Expedientes e Pranchas</h1>
            <p className="text-slate-500 text-sm">Recebimento, registro e emissão de documentos da Secretaria</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => { setEditando(null); setAvulso(true); setFormAberto(true); }} className="gap-2">
            <FileText className="h-4 w-4" /> Documento avulso
          </Button>
          <Button onClick={() => { setEditando(null); setAvulso(false); setFormAberto(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Novo expediente
          </Button>
        </div>
      </div>

      <Tabs value={aba} onValueChange={setAba}>
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="recebidos">Recebidos</TabsTrigger>
          <TabsTrigger value="expedidos">Expedidos</TabsTrigger>
          <TabsTrigger value="avulsos">Documentos avulsos</TabsTrigger>
        </TabsList>
        <TabsContent value={aba}>
          <ExpedientesLista key={aba} aba={aba} onEditar={(x) => { setEditando(x); setAvulso(x.classe === "Documento avulso"); setFormAberto(true); }} onImprimir={imprimir} onMarcarLido={marcarLido} />
        </TabsContent>
      </Tabs>

      {formAberto && (
        <ExpedienteForm
          key={editando?.id || (avulso ? "novo-avulso" : "novo")}
          avulso={avulso}
          open={formAberto}
          inicial={editando}
          sessoes={sessoes}
          onClose={() => { setFormAberto(false); setEditando(null); }}
          onSalvar={salvar}
        />
      )}
    </div>
  );
}