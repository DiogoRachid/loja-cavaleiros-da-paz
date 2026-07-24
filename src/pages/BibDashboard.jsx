import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  BookOpen, Users, BookMarked, AlertTriangle,
  TrendingUp, Calendar, ArrowRight, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isAfter, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BibDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItens: 0,
    totalIrmaos: 0,
    emprestimosAtivos: 0,
    emprestimosAtrasados: 0
  });
  const [emprestimosRecentes, setEmprestimosRecentes] = useState([]);
  const [atrasados, setAtrasados] = useState([]);

  useEffect(() => {
    // Verificar autenticação do bibliotecário
    const bibAuth = sessionStorage.getItem("bib_auth");
    if (bibAuth !== "true") {
      navigate(createPageUrl("BibLogin"));
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [itens, irmaos, emprestimos] = await Promise.all([
        db.Item.filter({ ativo: true }),
        db.Irmao.filter({ ativo: true }),
        db.Emprestimo.list("-created_date", 100)
      ]);

      const hoje = new Date();
      const ativos = emprestimos.filter(e => e.status === "Ativo");
      const atrasadosList = ativos.filter(e => 
        e.data_prevista_devolucao && isAfter(hoje, parseISO(e.data_prevista_devolucao))
      );

      setStats({
        totalItens: itens.length,
        totalIrmaos: irmaos.length,
        emprestimosAtivos: ativos.length,
        emprestimosAtrasados: atrasadosList.length
      });

      setEmprestimosRecentes(emprestimos.slice(0, 5));
      setAtrasados(atrasadosList.slice(0, 5));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B3A5F]" />
      </div>
    );
  }

  const statCards = [
    { 
      title: "Total do Acervo", 
      value: stats.totalItens, 
      icon: BookOpen, 
      color: "bg-blue-500",
      link: "BibAcervo"
    },
    { 
      title: "Irmãos Cadastrados", 
      value: stats.totalIrmaos, 
      icon: Users, 
      color: "bg-emerald-500",
      link: "BibIrmaos"
    },
    { 
      title: "Empréstimos Ativos", 
      value: stats.emprestimosAtivos, 
      icon: BookMarked, 
      color: "bg-amber-500",
      link: "BibEmprestimos"
    },
    { 
      title: "Atrasados", 
      value: stats.emprestimosAtrasados, 
      icon: AlertTriangle, 
      color: "bg-red-500",
      link: "BibEmprestimos"
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Visão geral da biblioteca</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Link key={index} to={createPageUrl(stat.link)}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-xl`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Empréstimos Recentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Empréstimos Recentes</CardTitle>
            <Link 
              to={createPageUrl("BibEmprestimos")}
              className="text-sm text-[#1B3A5F] hover:underline flex items-center gap-1"
            >
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {emprestimosRecentes.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                Nenhum empréstimo registrado
              </p>
            ) : (
              <div className="space-y-3">
                {emprestimosRecentes.map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-800">{emp.item_nome}</p>
                      <p className="text-sm text-slate-500">{emp.irmao_nome}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={emp.status === "Ativo" ? "default" : "secondary"}>
                        {emp.status}
                      </Badge>
                      <p className="text-xs text-slate-400 mt-1">
                        {emp.data_retirada && format(parseISO(emp.data_retirada), "dd/MM/yyyy")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Empréstimos Atrasados */}
        <Card className={atrasados.length > 0 ? "border-red-200" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {atrasados.length > 0 && <AlertTriangle className="w-5 h-5 text-red-500" />}
              Empréstimos Atrasados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {atrasados.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-slate-500">Nenhum empréstimo atrasado!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {atrasados.map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                    <div>
                      <p className="font-medium text-slate-800">{emp.item_nome}</p>
                      <p className="text-sm text-slate-500">{emp.irmao_nome}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">Atrasado</Badge>
                      <p className="text-xs text-red-500 mt-1">
                        Vencia: {emp.data_prevista_devolucao && format(parseISO(emp.data_prevista_devolucao), "dd/MM/yyyy")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}