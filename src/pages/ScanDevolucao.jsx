import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { 
  QrCode, Loader2, CheckCircle, AlertTriangle, Package, ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ScanDevolucao() {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const [irmao, setIrmao] = useState(null);
  const [emprestimosAtivos, setEmprestimosAtivos] = useState([]);
  const [itensSelecionados, setItensSelecionados] = useState([]);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const irmaos = await base44.entities.Irmao.filter({ email: currentUser.email });
      if (irmaos.length > 0) {
        setIrmao(irmaos[0]);
        
        const emps = await base44.entities.Emprestimo.filter(
          { irmao_email: currentUser.email, status: "Ativo" }
        );
        setEmprestimosAtivos(emps);
      }
    } catch (error) {
      console.error("Erro:", error);
    }
    setLoading(false);
  };

  const toggleItemSelecionado = (empId) => {
    setItensSelecionados(prev => 
      prev.includes(empId) 
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    );
  };

  const confirmarDevolucao = async () => {
    if (itensSelecionados.length === 0) return;
    setProcessing(true);

    try {
      for (const empId of itensSelecionados) {
        const emp = emprestimosAtivos.find(e => e.id === empId);
        if (!emp) continue;

        await base44.entities.Emprestimo.update(emp.id, {
          data_devolucao: format(new Date(), "yyyy-MM-dd"),
          status: "Devolvido"
        });

        const itens = await base44.entities.Item.filter({ id: emp.item_id });
        if (itens.length > 0) {
          await base44.entities.Item.update(itens[0].id, {
            quantidade_disponivel: (itens[0].quantidade_disponivel || 0) + 1,
            quantidade_emprestada: Math.max(0, (itens[0].quantidade_emprestada || 1) - 1)
          });
        }
      }

      setResultado({
        tipo: "sucesso",
        mensagem: `${itensSelecionados.length} item(ns) devolvido(s) com sucesso!`
      });
    } catch (error) {
      console.error("Erro:", error);
      setResultado({
        tipo: "erro",
        mensagem: "Erro ao processar. Tente novamente."
      });
    }
    
    setProcessing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B3A5F]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B3A5F] to-[#0D1F33] p-6">
      <div className="max-w-md mx-auto pt-8">
        <Link to={createPageUrl("Home")}>
          <Button variant="ghost" className="text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Devolução de Itens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!irmao ? (
              <div className="text-center py-4">
                <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-3" />
                <p className="text-slate-600">
                  Seu email não está cadastrado. Entre em contato com o bibliotecário.
                </p>
              </div>
            ) : resultado ? (
              <div className={`p-4 rounded-xl ${
                resultado.tipo === "sucesso" ? "bg-emerald-50" : "bg-red-50"
              }`}>
                {resultado.tipo === "sucesso" ? (
                  <CheckCircle className="w-12 h-12 mx-auto text-emerald-600 mb-3" />
                ) : (
                  <AlertTriangle className="w-12 h-12 mx-auto text-red-600 mb-3" />
                )}
                <p className={`text-center ${
                  resultado.tipo === "sucesso" ? "text-emerald-800" : "text-red-800"
                }`}>
                  {resultado.mensagem}
                </p>
                <Link to={createPageUrl("IrmaoEmprestimos")} className="block mt-4">
                  <Button className="w-full">Ver meus empréstimos</Button>
                </Link>
              </div>
            ) : emprestimosAtivos.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
                <p className="text-slate-600">
                  Você não tem itens para devolver.
                </p>
                <Link to={createPageUrl("IrmaoEmprestimos")} className="block mt-4">
                  <Button variant="outline" className="w-full">Ver meus empréstimos</Button>
                </Link>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-500">
                  Selecione os itens que você está devolvendo:
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {emprestimosAtivos.map((emp) => (
                    <div 
                      key={emp.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        itensSelecionados.includes(emp.id) 
                          ? "border-emerald-300 bg-emerald-50" 
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                      onClick={() => toggleItemSelecionado(emp.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={itensSelecionados.includes(emp.id)}
                          onCheckedChange={() => toggleItemSelecionado(emp.id)}
                        />
                        <div>
                          <p className="font-medium text-slate-800">{emp.item_nome}</p>
                          <p className="text-xs text-slate-500">
                            Retirado em: {emp.data_retirada}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={confirmarDevolucao}
                  disabled={itensSelecionados.length === 0 || processing}
                >
                  {processing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    `Confirmar Devolução (${itensSelecionados.length})`
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}