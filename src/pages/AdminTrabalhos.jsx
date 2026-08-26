import { useState, useEffect } from "react";
import { db } from "@/api/db";
import { Loader2, ClipboardCheck, Plus, GraduationCap, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TrabalhoRow from "@/components/vigilantes/TrabalhoRow";
import TrabalhoForm from "@/components/vigilantes/TrabalhoForm";
import ResumoIrmaoTrabalhos from "@/components/vigilantes/ResumoIrmaoTrabalhos";

export default function AdminTrabalhos() {
  const cargo = sessionStorage.getItem("admin_cargo") || "";
  const admin = JSON.parse(sessionStorage.getItem("admin_data") || "{}");
  // 1º Vigilante -> Aprendizes | 2º Vigilante -> Companheiros | outros cargos veem todos
  const grauAlvo =
    cargo === "Primeiro Vigilante" ? "Aprendiz" : cargo === "Segundo Vigilante" ? "Companheiro" : null;

  const [loading, setLoading] = useState(true);
  const [irmaos, setIrmaos] = useState([]);
  const [trabalhos, setTrabalhos] = useState([]);
  const [presencas, setPresencas] = useState([]);
  const [sessoes, setSessoes] = useState([]);
  const [formAberto, setFormAberto] = useState(false);

  const carregar = async () => {
    const [todosIrmaos, todosTrabalhos, todasPresencas, todasSessoes] = await Promise.all([
      grauAlvo
        ? db.Irmao.filter({ grau: grauAlvo, ativo: true }, "nome_completo", 500)
        : db.Irmao.filter({ ativo: true }, "nome_completo", 500),
      db.TrabalhoIrmao.list("-data_apresentacao", 1000),
      db.Presenca.list("-created_date", 2000),
      db.Sessao.list("-data", 50),
    ]);
    setIrmaos(todosIrmaos || []);
    setTrabalhos(todosTrabalhos || []);
    setPresencas(todasPresencas || []);
    setSessoes(todasSessoes || []);
    setLoading(false);
  };

  useEffect(() => {
    carregar();
  }, [grauAlvo]);

  const avaliar = async (trabalho, status) => {
    await db.TrabalhoIrmao.update(trabalho.id, {
      status,
      avaliado_por: admin.nome_completo || cargo,
      data_avaliacao: new Date().toISOString(),
    });
    setTrabalhos((atual) => atual.map((t) => (t.id === trabalho.id ? { ...t, status } : t)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const idsIrmaos = new Set(irmaos.map((i) => i.id));
  const meusTrabalhos = trabalhos.filter((t) => idsIrmaos.has(t.irmao_id));
  const pendentes = meusTrabalhos.filter((t) => t.status === "Pendente");
  const avaliados = meusTrabalhos.filter((t) => t.status !== "Pendente");

  const resumo = irmaos.map((irmao) => {
    const dele = meusTrabalhos.filter((t) => t.irmao_id === irmao.id);
    const presencasDele = presencas.filter((p) => p.irmao_id === irmao.id && !p.dispensado);
    return {
      irmao,
      instrucoes: dele.filter((t) => t.tipo === "Instrução").length,
      aprovados: dele.filter((t) => t.status === "Aprovado").length,
      pendentes: dele.filter((t) => t.status === "Pendente").length,
      frequencia: presencasDele.length
        ? Math.round((presencasDele.filter((p) => p.presente).length / presencasDele.length) * 100)
        : null,
    };
  });

  const totalInstrucoes = meusTrabalhos.filter((t) => t.tipo === "Instrução").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center flex-shrink-0">
            <ClipboardCheck className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1B3A5F]">Trabalhos e Instruções</h1>
            <p className="text-slate-500 text-sm">
              {grauAlvo ? `Acompanhamento dos ${grauAlvo === "Aprendiz" ? "Aprendizes" : "Companheiros"}` : "Todos os graus"}
            </p>
          </div>
        </div>
        <Button onClick={() => setFormAberto(true)} className="bg-[#1B3A5F] hover:bg-[#152e4d] gap-2">
          <Plus className="w-4 h-4" /> Registrar apresentação
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <FileText className="w-8 h-8 text-[#1B3A5F]" />
          <div><p className="text-2xl font-bold text-[#1B3A5F]">{meusTrabalhos.length}</p><p className="text-xs text-slate-500">Apresentações registradas</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-green-600" />
          <div><p className="text-2xl font-bold text-green-600">{totalInstrucoes}</p><p className="text-xs text-slate-500">Instruções apresentadas</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <ClipboardCheck className="w-8 h-8 text-amber-500" />
          <div><p className="text-2xl font-bold text-amber-600">{pendentes.length}</p><p className="text-xs text-slate-500">Aguardando aprovação</p></div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="pendentes">
        <TabsList>
          <TabsTrigger value="pendentes">Aprovações ({pendentes.length})</TabsTrigger>
          <TabsTrigger value="avaliados">Avaliados ({avaliados.length})</TabsTrigger>
          <TabsTrigger value="por_irmao">Por irmão</TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes">
          <Card><CardContent className="p-3 sm:p-4 space-y-2">
            {pendentes.length === 0 && <p className="text-center text-slate-400 py-8">Nenhum trabalho aguardando aprovação.</p>}
            {pendentes.map((t) => <TrabalhoRow key={t.id} trabalho={t} onAvaliar={avaliar} />)}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="avaliados">
          <Card><CardContent className="p-3 sm:p-4 space-y-2">
            {avaliados.length === 0 && <p className="text-center text-slate-400 py-8">Nenhum trabalho avaliado ainda.</p>}
            {avaliados.map((t) => <TrabalhoRow key={t.id} trabalho={t} onAvaliar={avaliar} />)}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="por_irmao">
          <Card>
            <CardHeader><CardTitle className="text-base text-[#1B3A5F]">Instruções e frequência por irmão</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {resumo.length === 0 && <p className="text-center text-slate-400 py-8">Nenhum irmão encontrado.</p>}
              {resumo.map((r) => <ResumoIrmaoTrabalhos key={r.irmao.id} {...r} />)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {formAberto && (
        <TrabalhoForm
          open={formAberto}
          onClose={() => setFormAberto(false)}
          onSalvo={carregar}
          irmaos={irmaos}
          sessoes={sessoes}
          registradoPor={admin.nome_completo || cargo}
        />
      )}
    </div>
  );
}