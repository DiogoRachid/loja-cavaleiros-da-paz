import { useState, useEffect } from "react";
import { db } from "@/api/db";
import { Users, Loader2, Shield, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VisitanteForm from "@/components/secretario/VisitanteForm";
import VisitantesList from "@/components/secretario/VisitantesList";
import CargosOcupados from "@/components/secretario/CargosOcupados";
import OrdemDoDiaEditor from "@/components/secretario/OrdemDoDiaEditor";

export default function AdminVisitantes() {
  const cargo = sessionStorage.getItem("admin_cargo") || "";
  const somenteLeitura = cargo === "Chanceler" || cargo === "Orador";

  const [sessoes, setSessoes] = useState([]);
  const [sessaoId, setSessaoId] = useState("");
  const [sessao, setSessao] = useState(null);
  const [visitantes, setVisitantes] = useState([]);
  const [autoridades, setAutoridades] = useState([]);
  const [presencas, setPresencas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSessao, setLoadingSessao] = useState(false);

  useEffect(() => {
    const init = async () => {
      const lista = await db.Sessao.filter({ status: { $ne: "Cancelada" } }, "-data", 100);
      setSessoes(lista || []);
      if (lista?.length) setSessaoId(lista[0].id);
      setLoading(false);
    };
    init();
  }, []);

  const carregarSessao = async (id) => {
    setLoadingSessao(true);
    const [sess, vis, ordem, pres] = await Promise.all([
      db.Sessao.get(id),
      db.VisitanteSessao.filter({ sessao_id: id }, "nome", 200),
      db.OrdemEntrada.filter({ sessao_id: id }),
      db.Presenca.filter({ sessao_id: id }),
    ]);
    setSessao(sess);
    setVisitantes(vis || []);
    setAutoridades((ordem || []).filter((o) => o.tipo_participante === "Autoridade" && (o.presente || o.confirmado)));
    setPresencas(pres || []);
    setLoadingSessao(false);
  };

  useEffect(() => {
    if (sessaoId) carregarSessao(sessaoId);
  }, [sessaoId]);

  const adicionarVisitante = async (form) => {
    await db.VisitanteSessao.create({ ...form, sessao_id: sessaoId, sessao_data: sessao?.data || null });
    const vis = await db.VisitanteSessao.filter({ sessao_id: sessaoId }, "nome", 200);
    setVisitantes(vis || []);
  };

  const removerVisitante = async (v) => {
    await db.VisitanteSessao.delete(v.id);
    setVisitantes((atual) => atual.filter((x) => x.id !== v.id));
  };

  const salvarOrdemDoDia = async (texto) => {
    await db.Sessao.update(sessaoId, { pauta: texto });
    setSessao((s) => ({ ...s, pauta: texto }));
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  }

  const presentes = presencas.filter((p) => p.presente).length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center flex-shrink-0">
          <Users className="w-6 h-6 text-[#C9A227]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1B3A5F]">Visitantes, Autoridades e Ordem do Dia</h1>
          <p className="text-slate-500 text-sm">Dados da sessão compartilhados com Chanceler, Orador e Balaústre</p>
        </div>
      </div>

      <Card><CardContent className="p-4 space-y-4">
        <Select value={sessaoId} onValueChange={setSessaoId}>
          <SelectTrigger><SelectValue placeholder="Selecione a sessão" /></SelectTrigger>
          <SelectContent>
            {sessoes.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {new Date(s.data + "T12:00:00").toLocaleDateString("pt-BR")} — {s.tipo} ({s.grau})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {sessao && !loadingSessao && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1"><UserCheck className="w-3 h-3" /> {presentes} irmãos do quadro presentes</Badge>
            <Badge variant="outline" className="gap-1"><Users className="w-3 h-3" /> {visitantes.length} visitantes</Badge>
            <Badge variant="outline" className="gap-1"><Shield className="w-3 h-3" /> {autoridades.length} autoridades</Badge>
          </div>
        )}
      </CardContent></Card>

      {loadingSessao && <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>}

      {sessao && !loadingSessao && (
        <>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base text-[#1B3A5F]">Irmãos Visitantes</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {!somenteLeitura && <VisitanteForm onAdicionar={adicionarVisitante} />}
              <VisitantesList visitantes={visitantes} onRemover={somenteLeitura ? () => {} : removerVisitante} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base text-[#1B3A5F]">Autoridades Presentes</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {autoridades.length === 0 && <p className="text-center text-slate-400 py-4 text-sm">Nenhuma autoridade confirmada nesta sessão.</p>}
              {autoridades.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Shield className="w-5 h-5 text-[#C9A227] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">{a.autoridade_nome}</p>
                    <p className="text-xs text-slate-500 truncate">{a.autoridade_titulo || ""}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base text-[#1B3A5F]">Cargos Ocupados na Sessão</CardTitle></CardHeader>
            <CardContent><CargosOcupados sessao={sessao} /></CardContent>
          </Card>

          {!somenteLeitura ? (
            <OrdemDoDiaEditor key={sessaoId} valor={sessao.pauta} onSalvar={salvarOrdemDoDia} />
          ) : (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base text-[#1B3A5F]">Ordem do Dia</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{sessao.pauta || "Ordem do dia não definida."}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}