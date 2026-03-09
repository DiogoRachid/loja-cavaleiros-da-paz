import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Star, Shield, ClipboardList, Calendar, CheckSquare, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminMC() {
  const [stats, setStats] = useState({ autoridades: 0, sessoes: 0, checklist: 0 });
  const [proximasSessoes, setProximasSessoes] = useState([]);
  const admin = JSON.parse(sessionStorage.getItem("admin_data") || "{}");

  useEffect(() => {
    loadDados();
  }, []);

  const loadDados = async () => {
    const [autoridades, sessoes] = await Promise.all([
      base44.entities.Autoridade.filter({ ativa: true }),
      base44.entities.Sessao.filter({ status: "Agendada" }),
    ]);
    setStats({ autoridades: autoridades.length, sessoes: sessoes.length });
    setProximasSessoes(sessoes.slice(0, 3));
  };

  const modulos = [
    { title: "Quadro de Oficiais", desc: "Consulta dos oficiais da loja", icon: Users, page: "AdminQuadroOficiais" },
    { title: "Autoridades", desc: "Cadastro das 58 autoridades", icon: Shield, page: "AdminAutoridades" },
    { title: "Ordem de Entrada", desc: "Protocolo de entrada no templo", icon: ClipboardList, page: "AdminOrdemEntrada" },
    { title: "Agenda Ritual", desc: "Próximas sessões e rituais", icon: Calendar, page: "AdminAgendaRitual" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
          <Star className="w-6 h-6 text-[#C9A227]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A5F]">Painel do Mestre de Cerimônias</h1>
          <p className="text-slate-500">Bem-vindo, Ir. {admin.nome_completo}</p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center mb-3">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats.autoridades}</p>
            <p className="text-sm text-slate-500 mt-1">Autoridades Cadastradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats.sessoes}</p>
            <p className="text-sm text-slate-500 mt-1">Sessões Agendadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Módulos */}
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
                <Link to={createPageUrl("AdminOrdemEntrada")}>
                  <Badge className="bg-[#C9A227] text-[#1B3A5F] cursor-pointer hover:bg-[#8B7019]">
                    Preparar
                  </Badge>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}