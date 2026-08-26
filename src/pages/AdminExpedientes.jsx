import { useState, useEffect } from "react";
import { db } from "@/api/db";
import { Mail, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ExpedienteForm from "@/components/secretario/ExpedienteForm";
import ExpedienteRow from "@/components/secretario/ExpedienteRow";
import { imprimirExpediente } from "@/components/secretario/imprimirExpediente";

export default function AdminExpedientes() {
  const [expedientes, setExpedientes] = useState([]);
  const [sessoes, setSessoes] = useState([]);
  const [dadosLoja, setDadosLoja] = useState(null);
  const [quadro, setQuadro] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const admin = JSON.parse(sessionStorage.getItem("admin_data") || "{}");

  const carregar = async () => {
    const [lista, sess, lojas, q] = await Promise.all([
      db.Expediente.list("-data", 500),
      db.Sessao.filter({ status: { $ne: "Cancelada" } }, "-data", 50),
      db.DadosLoja.list(),
      db.QuadroOficiais.filter({ exercicio: new Date().getFullYear().toString() }),
    ]);
    setExpedientes(lista || []);
    setSessoes(sess || []);
    setDadosLoja(lojas?.[0] || null);
    setQuadro(q || []);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

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
    setEditando(null);
    await carregar();
  };

  const marcarLido = async (e) => {
    await db.Expediente.update(e.id, { status: "Lido" });
    setExpedientes((atual) => atual.map((x) => (x.id === e.id ? { ...x, status: "Lido" } : x)));
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

  const recebidos = expedientes.filter((e) => e.tipo === "Recebido");
  const expedidos = expedientes.filter((e) => e.tipo === "Expedido");

  const lista = (itens) => (
    <Card><CardContent className="p-3 sm:p-4 space-y-2">
      {itens.length === 0 && <p className="text-center text-slate-400 py-8">Nenhum expediente registrado.</p>}
      {itens.map((e) => (
        <ExpedienteRow
          key={e.id}
          expediente={e}
          onEditar={(x) => { setEditando(x); setFormAberto(true); }}
          onImprimir={imprimir}
          onMarcarLido={marcarLido}
        />
      ))}
    </CardContent></Card>
  );

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
        <Button onClick={() => { setEditando(null); setFormAberto(true); }} className="bg-[#1B3A5F] hover:bg-[#152e4d] gap-2">
          <Plus className="w-4 h-4" /> Novo expediente
        </Button>
      </div>

      <Tabs defaultValue="recebidos">
        <TabsList>
          <TabsTrigger value="recebidos">Recebidos ({recebidos.length})</TabsTrigger>
          <TabsTrigger value="expedidos">Expedidos ({expedidos.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="recebidos">{lista(recebidos)}</TabsContent>
        <TabsContent value="expedidos">{lista(expedidos)}</TabsContent>
      </Tabs>

      {formAberto && (
        <ExpedienteForm
          key={editando?.id || "novo"}
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