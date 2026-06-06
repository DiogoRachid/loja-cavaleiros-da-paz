import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Crown, Users, Calendar, DollarSign, Award, BarChart, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { autoRealizarSessoes } from "@/utils/autoRealizarSessoes";

export default function AdminVM() {
  const [stats, setStats] = useState({ total: 0, regulares: 0, inadimplentes: 0, sessoes: 0 });
  const [proximasSessoes, setProximasSessoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const admin = JSON.parse(sessionStorage.getItem("admin_data") || "{}");

  useEffect(() => {
    loadDados();
  }, []);

  const loadDados = async () => {
    await autoRealizarSessoes();
    const [irmaos, sessoes, mensalidades] = await Promise.all([
      base44.entities.Irmao.filter({ ativo: true }),
      base44.entities.Sessao.list("-data", 5),
      base44.entities.Mensalidade.filter({ status: "Atrasado" }),
    ]);
    const regulares = irmaos.filter(i => i.situacao === "Regular").length;
    setStats({
      total: irmaos.length,
      regulares,
      inadimplentes: mensalidades.length,
      sessoes: sessoes.filter(s => s.status === "Agendada").length,
    });
    setProximasSessoes(sessoes.filter(s => s.status === "Agendada").slice(0, 3));
    setLoading(false);
  };

  const cards = [
    { title: "Total de Irmãos", value: stats.total, icon: Users, color: "bg-blue-500", link: "AdminMembros" },
    { title: "Irmãos Regulares", value: stats.regulares, icon: TrendingUp, color: "bg-green-500", link: "AdminMembros" },
    { title: "Inadimplentes", value: stats.inadimplentes, icon: AlertCircle, color: "bg-red-500", link: "AdminMensalidades" },
    { title: "Sessões Agendadas", value: stats.sessoes, icon: Calendar, color: "bg-purple-500", link: "AdminSessoes" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
          <Crown className="w-6 h-6 text-[#C9A227]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A5F]">Painel do Venerável Mestre</h1>
          <p className="text-slate-500">Bem-vindo, Ir. {admin.nome_completo}</p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={createPageUrl(card.link)}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{loading ? "..." : card.value}</p>
                  <p className="text-sm text-slate-500 mt-1">{card.title}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Atalhos de Módulos */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { title: "Quadro de Oficiais", desc: "Gerencie titulares e substitutos", icon: Award, page: "AdminQuadroOficiais", cor: "#1B3A5F" },
          { title: "Sessões & Rituais", desc: "Agende e registre sessões", icon: Calendar, page: "AdminSessoes", cor: "#1B3A5F" },
          { title: "Comissões", desc: "Gerencie comissões da loja", icon: Users, page: "AdminComissoes", cor: "#1B3A5F" },
          { title: "Membros", desc: "Lista completa de irmãos", icon: Users, page: "AdminMembros", cor: "#1B3A5F" },
          { title: "Financeiro", desc: "Mensalidades e adimplência", icon: DollarSign, page: "AdminMensalidades", cor: "#1B3A5F" },
          { title: "Relatórios", desc: "Relatórios executivos", icon: BarChart, page: "AdminRelatorios", cor: "#1B3A5F" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.page} to={createPageUrl(item.page)}>
              <Card className="hover:shadow-md hover:border-[#C9A227] transition-all cursor-pointer">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1B3A5F]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-[#1B3A5F]" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Próximas Sessões */}
      {proximasSessoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1B3A5F] flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Próximas Sessões
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {proximasSessoes.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800">{s.tipo}</p>
                  <p className="text-sm text-slate-500">{s.data} às {s.hora}</p>
                </div>
                <Badge className="bg-[#1B3A5F] text-white">{s.grau}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}