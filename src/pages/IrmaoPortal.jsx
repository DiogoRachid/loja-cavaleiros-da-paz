import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
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
      base44.entities.Mensalidade.filter({ irmao_id: ir.id }),
      base44.entities.Presenca.filter({ irmao_id: ir.id }),
      base44.entities.Sessao.filter({ status: "Agendada" }),
      base44.entities.Emprestimo.filter({ irmao_id: ir.id, status: "Ativo" }),
      base44.entities.MembroComissao.filter({ irmao_id: ir.id, ativo: true }),
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
      <div className="bg-gradient-to-r from-[#1B3A5F] to-[#0D1F33] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#C9A227]/20 flex items-center justify-center text-2xl font-bold text-[#C9A227]">
            {irmao.nome_completo?.charAt(0)}
          </div>
          <div>
            <p className="text-slate-300 text-sm">Bem-vindo, Irmão</p>
            <h1 className="text-xl font-bold">{irmao.nome_completo}</h1>
            <div className="flex gap-2 mt-1 flex-wrap">
              <Badge className="bg-[#C9A227]/20 text-[#C9A227] border-0">{irmao.grau}</Badge>
              {irmao.cargo && irmao.cargo !== "Nenhum" && <Badge className="bg-white/10 text-white border-0">{irmao.cargo}</Badge>}
              <Badge className={irmao.situacao === "Regular" ? "bg-green-500/20 text-green-300 border-0" : "bg-red-500/20 text-red-300 border-0"}>{irmao.situacao}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {pendentes.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Mensalidade(s) em aberto</p>
            <p className="text-sm text-red-600">{pendentes.length} mensalidade(s) pendente(s) ou atrasada(s).</p>
          </div>
        </div>
      )}
      {emprestimos.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">{emprestimos.length} livro(s) emprestado(s)</p>
            <p className="text-sm text-yellow-700">Verifique os prazos de devolução.</p>
          </div>
        </div>
      )}

      {/* Cards KPI */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{freqPct}%</p>
                <p className="text-xs text-slate-500">Frequência ({presentes}/{totalSessoes})</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${pendentes.length > 0 ? "bg-red-500" : "bg-green-500"}`}>
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{pendentes.length}</p>
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
              <Card className="hover:shadow-md hover:border-[#C9A227] transition-all cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                  <div className="w-10 h-10 rounded-xl bg-[#1B3A5F]/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#1B3A5F]" />
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
          <CardHeader><CardTitle className="text-[#1B3A5F] flex items-center gap-2 text-base"><Calendar className="w-4 h-4" /> Próximas Sessões</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {sessoes.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800 text-sm">{s.tipo}</p>
                  <p className="text-xs text-slate-500">{s.data} às {s.hora}{s.local ? ` • ${s.local}` : ""}</p>
                </div>
                <Badge className="bg-[#1B3A5F]/10 text-[#1B3A5F]">{s.grau}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Últimas Mensalidades */}
      <Card>
        <CardHeader><CardTitle className="text-[#1B3A5F] flex items-center gap-2 text-base"><DollarSign className="w-4 h-4" /> Minhas Mensalidades</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {ultimasMensalidades.length === 0 && <p className="text-slate-400 text-sm text-center py-3">Nenhum lançamento encontrado.</p>}
          {ultimasMensalidades.map(m => (
            <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
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
        <CardHeader><CardTitle className="text-[#1B3A5F] flex items-center gap-2 text-base"><User className="w-4 h-4" /> Dados Cadastrais</CardTitle></CardHeader>
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