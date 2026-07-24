import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, FileText, BarChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminTesoureiro() {
  const [stats, setStats] = useState({ pagos: 0, pendentes: 0, atrasados: 0, totalRecebido: 0 });
  const [recentes, setRecentes] = useState([]);
  const admin = JSON.parse(sessionStorage.getItem("admin_data") || "{}");

  useEffect(() => {
    loadDados();
  }, []);

  const loadDados = async () => {
    const mensalidades = await db.Mensalidade.list("-created_date", 50);
    const pagos = mensalidades.filter(m => m.status === "Pago");
    const pendentes = mensalidades.filter(m => m.status === "Pendente");
    const atrasados = mensalidades.filter(m => m.status === "Atrasado");
    const totalRecebido = pagos.reduce((acc, m) => acc + (m.valor || 0), 0);
    setStats({ pagos: pagos.length, pendentes: pendentes.length, atrasados: atrasados.length, totalRecebido });
    setRecentes(mensalidades.slice(0, 5));
  };

  const statusColor = { Pago: "bg-green-100 text-green-800", Pendente: "bg-yellow-100 text-yellow-800", Atrasado: "bg-red-100 text-red-800" };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-[#C9A227]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A5F]">Painel Financeiro</h1>
          <p className="text-slate-500">Bem-vindo, Ir. {admin.nome_completo}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Recebido", value: `R$ ${stats.totalRecebido.toFixed(2)}`, icon: TrendingUp, color: "bg-green-500" },
          { label: "Pagamentos OK", value: stats.pagos, icon: CheckCircle, color: "bg-blue-500" },
          { label: "Pendentes", value: stats.pendentes, icon: FileText, color: "bg-yellow-500" },
          { label: "Atrasados", value: stats.atrasados, icon: AlertCircle, color: "bg-red-500" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                <p className="text-sm text-slate-500 mt-1">{card.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link to={createPageUrl("AdminMensalidades")}>
          <Card className="hover:shadow-md hover:border-[#C9A227] transition-all cursor-pointer">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#1B3A5F]/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#1B3A5F]" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Lançar Mensalidades</p>
                <p className="text-xs text-slate-500">Registrar pagamentos recebidos</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to={createPageUrl("AdminRelatorioFinanceiro")}>
          <Card className="hover:shadow-md hover:border-[#C9A227] transition-all cursor-pointer">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#1B3A5F]/10 flex items-center justify-center">
                <BarChart className="w-6 h-6 text-[#1B3A5F]" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Relatório Financeiro</p>
                <p className="text-xs text-slate-500">Balancete e exportações</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#1B3A5F]">Lançamentos Recentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentes.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">Nenhum lançamento encontrado.</p>
          ) : recentes.map(m => (
            <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-800 text-sm">{m.irmao_nome}</p>
                <p className="text-xs text-slate-500">{m.competencia}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">R$ {(m.valor || 0).toFixed(2)}</span>
                <Badge className={statusColor[m.status] || ""}>{m.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}