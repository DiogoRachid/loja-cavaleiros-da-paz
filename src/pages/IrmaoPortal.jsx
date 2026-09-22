import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { User, DollarSign, Calendar, BookOpen, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function IrmaoPortal() {
  const [irmao, setIrmao] = useState(null);
  const [mensalidades, setMensalidades] = useState([]);
  const [presencas, setPresencas] = useState([]);
  const [sessoes, setSessoes] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]);
  const [comissoesDoIrmao, setComissoesDoIrmao] = useState([]);

  useEffect(() => { loadDados(); }, []);

  const loadDados = async () => {
    const ir = JSON.parse(sessionStorage.getItem("irmao_data") || "{}");
    if (!ir.id) return;
    setIrmao(ir);
    const [m, p, s, e, mc] = await Promise.all([
      db.Mensalidade.filter({ irmao_id: ir.id }),
      db.Presenca.filter({ irmao_id: ir.id }),
      db.Sessao.filter({ status: "Agendada" }),
      db.Emprestimo.filter({ irmao_id: ir.id, status: "Ativo" }),
      db.MembroComissao.filter({ irmao_id: ir.id, ativo: true }),
    ]);
    setMensalidades(m.sort((a, b) => b.competencia?.localeCompare(a.competencia)));
    setPresencas(p);
    setSessoes(s.slice(0, 3));
    setEmprestimos(e);
    setComissoesDoIrmao(mc);
  };

  if (!irmao) return null;

  const totalSessoes = presencas.length;
  const presentes = presencas.filter(p => p.presente).length;
  const freqPct = totalSessoes > 0 ? Math.round((presentes / totalSessoes) * 100) : 0;
  const pendentes = mensalidades.filter(m => m.status === "Pendente" || m.status === "Atrasado");
  const ultimasMensalidades = mensalidades.slice(0, 4);

  const statusMensColors = { Pago: "bg-green-100 text-green-800", Pendente: "bg-yellow-100 text-yellow-800", Atrasado: "bg-red-100 text-red-800", Isento: "bg-slate-100 text-slate-600" };

  return (
    <div className="space-y-6">
      {/* Saudação */}
      <div className="rounded-xl bg-lodge-navy p-6 text-primary-foreground">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-lodge-gold/20 text-2xl font-semibold text-lodge-gold">
            {irmao.nome_completo?.charAt(0)}
          </div>
          <div>
            <p className="text-slate-300 text-sm">Bem-vindo, Irmão</p>
            <h1 className="text-xl font-bold">{irmao.nome_completo}</h1>
            <div className="flex gap-2 mt-1 flex-wrap">
              <Badge className="border-0 bg-lodge-gold/20 text-lodge-gold">{irmao.grau}</Badge>
              {irmao.cargo && irmao.cargo !== "Nenhum" && <Badge className="bg-white/10 text-white border-0">{irmao.cargo}</Badge>}
              {comissoesDoIrmao.map(mc => (
                <Badge key={mc.id} className="bg-white/10 text-white border-0">Membro da Comissão {mc.comissao_nome}</Badge>
              ))}
              <Badge className={irmao.situacao === "Regular" ? "bg-green-500/20 text-green-300 border-0" : "bg-red-500/20 text-red-300 border-0"}>{irmao.situacao}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {pendentes.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Mensalidade(s) em aberto</p>
            <p className="text-sm text-red-600">{pendentes.length} mensalidade(s) pendente(s) ou atrasada(s).</p>
          </div>
        </div>
      )}
      {emprestimos.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-lodge-gold/30 bg-lodge-gold/10 p-4">
          <BookOpen className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">{emprestimos.length} livro(s) emprestado(s)</p>
            <p className="text-sm text-yellow-700">Verifique os prazos de devolução.</p>
          </div>
        </div>
      )}

      {/* Cards KPI */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-lodge-navy/10">
                <Calendar className="h-5 w-5 text-lodge-navy" />
              </div>
              <div>
                <p className="text-xl font-semibold text-lodge-navy">{freqPct}%</p>
                <p className="text-xs text-slate-500">Frequência ({presentes}/{totalSessoes})</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${pendentes.length > 0 ? "bg-destructive/10" : "bg-lodge-navy/10"}`}>
                <DollarSign className={`h-5 w-5 ${pendentes.length > 0 ? "text-destructive" : "text-lodge-navy"}`} />
              </div>
              <div>
                <p className="text-xl font-semibold text-lodge-navy">{pendentes.length}</p>
                <p className="text-xs text-slate-500">Mensalidades em aberto</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Atalhos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Meus Empréstimos", icon: BookOpen, page: "IrmaoEmprestimos" },
          { label: "Acervo Físico", icon: BookOpen, page: "IrmaoAcervo" },
          { label: "Acervo Digital", icon: BookOpen, page: "IrmaoAcervoDigital" },
          { label: "Escanear QR", icon: CheckCircle, page: "IrmaoScan" },
        ].map(item => {
          const Icon = item.icon;
          return (
            <Link key={item.page} to={createPageUrl(item.page)}>
              <Card className="h-full border-border shadow-sm transition-colors hover:border-lodge-gold">
                <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lodge-navy/10">
                    <Icon className="h-5 w-5 text-lodge-navy" />
                  </div>
                  <p className="text-xs font-medium text-slate-700">{item.label}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Próximas Sessões */}
      {sessoes.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base text-lodge-navy"><Calendar className="w-4 h-4" /> Próximas Sessões</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {sessoes.map(s => (
              <div key={s.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
                <div>
                  <p className="font-medium text-slate-800 text-sm">{s.tipo}</p>
                  <p className="text-xs text-slate-500">{s.data} às {s.hora}{s.local ? ` • ${s.local}` : ""}</p>
                </div>
                <Badge className="bg-lodge-navy/10 text-lodge-navy">{s.grau}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Últimas Mensalidades */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base text-lodge-navy"><DollarSign className="w-4 h-4" /> Minhas Mensalidades</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {ultimasMensalidades.length === 0 && <p className="text-slate-400 text-sm text-center py-3">Nenhum lançamento encontrado.</p>}
          {ultimasMensalidades.map(m => (
            <div key={m.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
              <div>
                <p className="font-medium text-slate-800 text-sm">{m.competencia}</p>
                <p className="text-xs text-slate-500">Venc: {m.vencimento}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">R$ {(m.valor || 0).toFixed(2)}</span>
                <Badge className={statusMensColors[m.status]}>{m.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dados Pessoais */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base text-lodge-navy"><User className="w-4 h-4" /> Dados Cadastrais</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3 text-sm">
          <div><span className="text-slate-500">CIM: </span><span className="font-medium">{irmao.cim}</span></div>
          <div><span className="text-slate-500">Nº GLP: </span><span className="font-medium">{irmao.numero_glp || "—"}</span></div>
          <div><span className="text-slate-500">Email: </span><span className="font-medium">{irmao.email || "—"}</span></div>
          <div><span className="text-slate-500">Telefone: </span><span className="font-medium">{irmao.telefone || "—"}</span></div>
          <div><span className="text-slate-500">Iniciação: </span><span className="font-medium">{irmao.data_iniciacao || "—"}</span></div>
          <div><span className="text-slate-500">Grau: </span><span className="font-medium">{irmao.grau}</span></div>
        </CardContent>
      </Card>
    </div>
  );
}