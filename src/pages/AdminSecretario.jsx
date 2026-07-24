import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { FileText, Users, ClipboardList, Award, UserPlus, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminSecretario() {
  const [stats, setStats] = useState({ total: 0, aprendizes: 0, companheiros: 0, mestres: 0 });
  const [recentes, setRecentes] = useState([]);
  const admin = JSON.parse(sessionStorage.getItem("admin_data") || "{}");

  useEffect(() => {
    loadDados();
  }, []);

  const loadDados = async () => {
    const irmaos = await db.Irmao.filter({ ativo: true });
    setStats({
      total: irmaos.length,
      aprendizes: irmaos.filter(i => i.grau === "Aprendiz").length,
      companheiros: irmaos.filter(i => i.grau === "Companheiro").length,
      mestres: irmaos.filter(i => i.grau === "Mestre").length,
    });
    setRecentes(irmaos.slice(0, 5));
  };

  const modulos = [
    { title: "Cadastro de Irmãos", desc: "Adicionar e editar membros", icon: UserPlus, page: "AdminCadastroIrmaos" },
    { title: "Controle de Presenças", desc: "Marcar frequência nas sessões", icon: ClipboardList, page: "AdminPresencas" },
    { title: "Emitir Atestados", desc: "Atestado de regularidade", icon: Award, page: "AdminAtestados" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
          <FileText className="w-6 h-6 text-[#C9A227]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A5F]">Painel da Secretaria</h1>
          <p className="text-slate-500">Bem-vindo, Ir. {admin.nome_completo}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total de Irmãos", value: stats.total, color: "bg-blue-500", icon: Users },
          { label: "Aprendizes", value: stats.aprendizes, color: "bg-yellow-500", icon: TrendingUp },
          { label: "Companheiros", value: stats.companheiros, color: "bg-green-500", icon: TrendingUp },
          { label: "Mestres", value: stats.mestres, color: "bg-purple-500", icon: Award },
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

      <div className="grid md:grid-cols-3 gap-4">
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

      <Card>
        <CardHeader>
          <CardTitle className="text-[#1B3A5F]">Irmãos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentes.map(ir => (
            <div key={ir.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-800 text-sm">{ir.nome_completo}</p>
                <p className="text-xs text-slate-500">CIM: {ir.cim}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-slate-200 text-slate-700 text-xs">{ir.grau}</Badge>
                <Badge className={ir.situacao === "Regular" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {ir.situacao}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}