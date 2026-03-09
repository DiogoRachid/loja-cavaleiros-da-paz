import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, BarChart, ClipboardList, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminChanceler() {
  const [stats, setStats] = useState({ total: 0, regulares: 0, irregulares: 0, mediaFreq: 0 });
  const admin = JSON.parse(sessionStorage.getItem("admin_data") || "{}");

  useEffect(() => {
    loadDados();
  }, []);

  const loadDados = async () => {
    const irmaos = await base44.entities.Irmao.filter({ ativo: true });
    const regulares = irmaos.filter(i => i.situacao === "Regular").length;
    const irregulares = irmaos.filter(i => i.situacao === "Irregular").length;
    const mediaFreq = irmaos.length > 0 ? Math.round((regulares / irmaos.length) * 100) : 0;
    setStats({ total: irmaos.length, regulares, irregulares, mediaFreq });
  };

  const modulos = [
    { title: "Relatório de Frequências", desc: "Assiduidade por irmão e sessão", icon: BarChart, page: "AdminFrequencias" },
    { title: "Comunicados", desc: "Envio de comunicados oficiais", icon: ClipboardList, page: "AdminComunicados" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
          <FileText className="w-6 h-6 text-[#C9A227]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A5F]">Painel da Chancelaria</h1>
          <p className="text-slate-500">Bem-vindo, Ir. {admin.nome_completo}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total de Irmãos", value: stats.total, color: "bg-blue-500", icon: TrendingUp },
          { label: "Regulares", value: stats.regulares, color: "bg-green-500", icon: CheckCircle },
          { label: "Irregulares", value: stats.irregulares, color: "bg-red-500", icon: AlertCircle },
          { label: "Taxa de Regularidade", value: `${stats.mediaFreq}%`, color: "bg-purple-500", icon: BarChart },
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
        {modulos.map((item) => {
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
    </div>
  );
}