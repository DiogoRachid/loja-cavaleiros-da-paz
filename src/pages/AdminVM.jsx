import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { Crown, Users, Calendar, DollarSign, Award, BarChart, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { autoRealizarSessoes } from "@/utils/autoRealizarSessoes";
import PortaisCargos from "@/components/vm/PortaisCargos";

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
      db.Irmao.filter({ ativo: true }),
      db.Sessao.list("-data", 5),
      db.Mensalidade.filter({ status: "Atrasado" }),
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
    { title: "Total de Irmãos", value: stats.total, icon: Users, color: "bg-lodge-navy/10 text-lodge-navy", link: "AdminMembros" },
    { title: "Irmãos Regulares", value: stats.regulares, icon: TrendingUp, color: "bg-lodge-navy/10 text-lodge-navy", link: "AdminMembros" },
    { title: "Inadimplentes", value: stats.inadimplentes, icon: AlertCircle, color: "bg-destructive/10 text-destructive", link: "AdminMensalidades" },
    { title: "Sessões Agendadas", value: stats.sessoes, icon: Calendar, color: "bg-lodge-navy/10 text-lodge-navy", link: "AdminSessoes" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-border pb-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-card">
          <Crown className="h-7 w-7 text-lodge-gold" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-lodge-navy">Painel do Venerável Mestre</h1>
          <p className="text-sm text-muted-foreground">Bem-vindo, Ir. {admin.nome_completo}</p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={createPageUrl(card.link)}>
              <Card className="h-full border-border shadow-sm transition-colors hover:border-lodge-gold">
                <CardContent className="p-4 sm:p-5">
                  <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-semibold text-lodge-navy">{loading ? "..." : card.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{card.title}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Atalhos de Módulos */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { title: "Quadro de Oficiais", desc: "Gerencie titulares e substitutos", icon: Award, page: "AdminQuadroOficiais" },
          { title: "Sessões & Rituais", desc: "Agende e registre sessões", icon: Calendar, page: "AdminSessoes",  },
          { title: "Comissões", desc: "Gerencie comissões da loja", icon: Users, page: "AdminComissoes",  },
          { title: "Membros", desc: "Lista completa de irmãos", icon: Users, page: "AdminMembros",  },
          { title: "Financeiro", desc: "Mensalidades e adimplência", icon: DollarSign, page: "AdminMensalidades",  },
          { title: "Relatórios", desc: "Relatórios executivos", icon: BarChart, page: "AdminRelatorios",  },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.page} to={createPageUrl(item.page)}>
              <Card className="h-full border-border shadow-sm transition-colors hover:border-lodge-gold">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-lodge-navy/10">
                    <Icon className="h-5 w-5 text-lodge-navy" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Portais dos Cargos */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-lodge-navy">Portais dos Cargos</h2>
        <PortaisCargos />
      </div>

      {/* Próximas Sessões */}
      {proximasSessoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lodge-navy flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Próximas Sessões
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {proximasSessoes.map(s => (
              <div key={s.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
                <div>
                  <p className="font-medium text-foreground">{s.tipo}</p>
                  <p className="text-sm text-muted-foreground">{s.data} às {s.hora}</p>
                </div>
                <Badge className="bg-lodge-navy dark:bg-primary text-primary-foreground">{s.grau}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}