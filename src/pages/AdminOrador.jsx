import { useState, useEffect } from "react";
import { db } from "@/api/db";
import { Gavel, Mail, FileText, Users, Calendar, ClipboardCheck, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminOrador() {
  const [stats, setStats] = useState({ rascunhos: 0, concluidos: 0, expedientes: 0, trabalhos: 0 });
  const [ultimos, setUltimos] = useState([]);
  const [proximaSessao, setProximaSessao] = useState(null);
  const [loading, setLoading] = useState(true);
  const admin = JSON.parse(sessionStorage.getItem("admin_data") || "{}");

  useEffect(() => {
    const carregar = async () => {
      const [pareceres, expedientes, trabalhos, sessoes] = await Promise.all([
        db.Parecer.list("-data_parecer", 100),
        db.Expediente.filter({ status: "Pendente" }),
        db.TrabalhoIrmao.filter({ status: "Pendente" }),
        db.Sessao.filter({ status: "Agendada" }, "data", 1),
      ]);
      setStats({
        rascunhos: (pareceres || []).filter((p) => p.status === "Rascunho").length,
        concluidos: (pareceres || []).filter((p) => p.status !== "Rascunho").length,
        expedientes: (expedientes || []).length,
        trabalhos: (trabalhos || []).length,
      });
      setUltimos((pareceres || []).slice(0, 5));
      setProximaSessao(sessoes?.[0] || null);
      setLoading(false);
    };
    carregar();
  }, []);

  const modulos = [
    { title: "Pareceres", desc: "Emitir e imprimir pareceres", icon: Gavel, page: "AdminPareceres" },
    { title: "Expedientes e Pranchas", desc: "Correspondências da Loja", icon: Mail, page: "AdminExpedientes" },
    { title: "Balaústre (Ata)", desc: "Conferir a ata da sessão", icon: FileText, page: "AdminBalaustre" },
    { title: "Trabalhos e Instruções", desc: "Trabalhos dos irmãos", icon: ClipboardCheck, page: "AdminTrabalhos" },
    { title: "Visitantes e Autoridades", desc: "Presenças protocolares", icon: Users, page: "AdminVisitantes" },
    { title: "Agenda Ritual", desc: "Calendário das sessões", icon: Calendar, page: "AdminAgendaRitual" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
          <Gavel className="w-6 h-6 text-[#C9A227]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A5F]">Painel do Orador</h1>
          <p className="text-slate-500">Bem-vindo, Ir. {admin.nome_completo}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pareceres em rascunho", value: stats.rascunhos, color: "bg-amber-500" },
          { label: "Pareceres emitidos", value: stats.concluidos, color: "bg-emerald-600" },
          { label: "Expedientes pendentes", value: stats.expedientes, color: "bg-blue-500" },
          { label: "Trabalhos pendentes", value: stats.trabalhos, color: "bg-purple-500" },
        ].map((card) => (
          <Card key={card.label}>
            <CardContent className="p-5">
              <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
                <Gavel className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
              <p className="text-sm text-slate-500 mt-1">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {proximaSessao && (
        <Card className="border-[#C9A227]/50 bg-[#C9A227]/5">
          <CardContent className="p-5 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-[#1B3A5F]" />
            <p className="text-sm text-slate-700">
              Próxima sessão: <strong>{new Date(proximaSessao.data + "T12:00:00").toLocaleDateString("pt-BR")}</strong>
              {proximaSessao.hora && ` às ${proximaSessao.hora}`} — {proximaSessao.tipo} no Grau de {proximaSessao.grau}
            </p>
          </CardContent>
        </Card>
      )}

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
          <CardTitle className="text-[#1B3A5F] text-base">Últimos pareceres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ultimos.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum parecer registrado ainda.</p>
          ) : (
            ultimos.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">{p.titulo}</p>
                  <p className="text-xs text-slate-500">
                    {p.tipo}
                    {p.data_parecer && ` • ${new Date(p.data_parecer + "T12:00:00").toLocaleDateString("pt-BR")}`}
                  </p>
                </div>
                <Badge variant="outline">{p.status}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}