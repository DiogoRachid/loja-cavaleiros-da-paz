import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  BookOpen, Loader2, QrCode, Clock, CheckCircle, AlertTriangle,
  Calendar, ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO, isAfter } from "date-fns";

export default function IrmaoEmprestimos() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [irmao, setIrmao] = useState(null);
  const [emprestimos, setEmprestimos] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Verificar se tem sessão do irmão
      const irmaoAuth = sessionStorage.getItem("irmao_auth");
      const irmaoData = sessionStorage.getItem("irmao_data");
      
      if (irmaoAuth !== "true" || !irmaoData) {
        window.location.href = createPageUrl("IrmaoLogin");
        return;
      }

      const irmaoSessao = JSON.parse(irmaoData);
      setUser({ email: irmaoSessao.email });

      // Buscar irmão pelo email
      const irmaos = await base44.entities.Irmao.filter({ email: irmaoSessao.email });
      
      if (irmaos.length > 0) {
        setIrmao(irmaos[0]);
        
        // Buscar empréstimos do irmão
        const emps = await base44.entities.Emprestimo.filter(
          { irmao_email: currentUser.email },
          "-data_retirada",
          100
        );
        
        // Verificar atrasos
        const hoje = new Date();
        const updated = emps.map(emp => {
          if (emp.status === "Ativo" && emp.data_prevista_devolucao) {
            if (isAfter(hoje, parseISO(emp.data_prevista_devolucao))) {
              return { ...emp, status: "Atrasado" };
            }
          }
          return emp;
        });
        
        setEmprestimos(updated);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setLoading(false);
  };

  const ativos = emprestimos.filter(e => e.status === "Ativo" || e.status === "Atrasado");
  const historico = emprestimos.filter(e => e.status === "Devolvido");

  const statusIcons = {
    "Ativo": Clock,
    "Atrasado": AlertTriangle,
    "Devolvido": CheckCircle
  };

  const statusColors = {
    "Ativo": "bg-blue-100 text-blue-700",
    "Atrasado": "bg-red-100 text-red-700",
    "Devolvido": "bg-emerald-100 text-emerald-700"
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B3A5F]" />
      </div>
    );
  }

  if (!irmao) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Cadastro não encontrado</h2>
        <p className="text-slate-500 mb-6">
          Seu email ({user?.email}) não está cadastrado como irmão na biblioteca.
          Entre em contato com o bibliotecário para realizar seu cadastro.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Meus Empréstimos</h1>
          <p className="text-slate-500">
            Olá, {irmao.nome_completo}
          </p>
        </div>
        <Link to={createPageUrl("IrmaoScan")}>
          <Button className="bg-[#1B3A5F] hover:bg-[#15304d]">
            <QrCode className="w-4 h-4 mr-2" />
            Escanear QR Code
          </Button>
        </Link>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{ativos.length}</p>
                <p className="text-sm text-slate-500">Empréstimo(s) ativo(s)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-100">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{historico.length}</p>
                <p className="text-sm text-slate-500">Já devolvido(s)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ativos">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="ativos" className="flex-1 sm:flex-none">
            Ativos ({ativos.length})
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex-1 sm:flex-none">
            Histórico ({historico.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ativos" className="mt-4">
          {ativos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">Você não tem empréstimos ativos</p>
                <Link to={createPageUrl("IrmaoScan")}>
                  <Button variant="link" className="mt-2">
                    Fazer uma retirada <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {ativos.map((emp) => {
                const StatusIcon = statusIcons[emp.status];
                return (
                  <Card 
                    key={emp.id}
                    className={emp.status === "Atrasado" ? "border-red-200 bg-red-50/50" : ""}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${
                          emp.status === "Atrasado" ? "bg-red-100" : "bg-blue-100"
                        }`}>
                          <StatusIcon className={`w-5 h-5 ${
                            emp.status === "Atrasado" ? "text-red-600" : "text-blue-600"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800">{emp.item_nome}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge className={statusColors[emp.status]}>
                              {emp.status}
                            </Badge>
                          </div>
                          <div className="mt-3 text-sm text-slate-500 space-y-1">
                            <p className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Retirado: {emp.data_retirada && format(parseISO(emp.data_retirada), "dd/MM/yyyy")}
                            </p>
                            {emp.data_prevista_devolucao && (
                              <p className={`flex items-center gap-2 ${
                                emp.status === "Atrasado" ? "text-red-600 font-medium" : ""
                              }`}>
                                <Clock className="w-4 h-4" />
                                Devolver até: {format(parseISO(emp.data_prevista_devolucao), "dd/MM/yyyy")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="historico" className="mt-4">
          {historico.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">Nenhum histórico de devolução</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {historico.map((emp) => (
                <Card key={emp.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-emerald-100">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">{emp.item_nome}</h3>
                        <Badge className={statusColors[emp.status]} variant="secondary">
                          {emp.status}
                        </Badge>
                        <div className="mt-3 text-sm text-slate-500 space-y-1">
                          <p>Retirado: {emp.data_retirada && format(parseISO(emp.data_retirada), "dd/MM/yyyy")}</p>
                          <p className="text-emerald-600">
                            Devolvido: {emp.data_devolucao && format(parseISO(emp.data_devolucao), "dd/MM/yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}