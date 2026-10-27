import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { consultarObrasPermitidas, podeLerObra } from "@/lib/acessoBiblioteca";
import { useLocation } from "react-router-dom";
import { 
  QrCode, Loader2, CheckCircle, AlertTriangle, BookOpen, ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, addDays } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ScanRetirada() {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const [irmao, setIrmao] = useState(null);
  const [item, setItem] = useState(null);
  const [resultado, setResultado] = useState(null);
  
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const codigo = urlParams.get("codigo");

  useEffect(() => {
    loadData();
  }, [codigo]);

  const loadData = async () => {
    setLoading(true);
    setItem(null);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      const irmaos = currentUser.email ? await db.Irmao.filter({ email: currentUser.email, ativo: true }) : [];
      const atual = irmaos.length === 1 ? irmaos[0] : null;
      setIrmao(atual);
      if (codigo && atual) {
        const [obra] = await consultarObrasPermitidas("fisico", atual, { codigo_qr: codigo });
        if (podeLerObra(atual, obra)) setItem(obra);
        else setResultado({ tipo: "erro", mensagem: "Obra indisponível para o seu grau ou código não encontrado." });
      }
    } catch (error) {
      if (error.status === 401 || error.response?.status === 401) base44.auth.redirectToLogin(window.location.href);
      else setResultado({ tipo: "erro", mensagem: "Não foi possível conferir seu acesso. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  const confirmarRetirada = async () => {
    if (!item || !irmao) return;
    setProcessing(true);

    try {
      const currentUser = await base44.auth.me();
      const irmaos = currentUser.email ? await db.Irmao.filter({ email: currentUser.email, ativo: true }) : [];
      const atual = irmaos.length === 1 ? irmaos[0] : null;
      const [obra] = await consultarObrasPermitidas("fisico", atual, { id: item.id });
      if (!podeLerObra(atual, obra)) throw new Error("Obra indisponível para o seu grau.");
      if ((obra.quantidade_disponivel || 0) <= 0) {
        setResultado({
          tipo: "erro",
          mensagem: "Este item não está disponível no momento."
        });
        setProcessing(false);
        return;
      }

      await db.Emprestimo.create({
        item_id: obra.id,
        item_nome: obra.nome,
        irmao_id: atual.id,
        irmao_nome: atual.nome_completo,
        irmao_email: atual.email,
        data_retirada: format(new Date(), "yyyy-MM-dd"),
        data_prevista_devolucao: format(addDays(new Date(), 30), "yyyy-MM-dd"),
        status: "Ativo",
        tipo_operacao: "QR Code"
      });

      await db.Item.update(obra.id, {
        quantidade_disponivel: obra.quantidade_disponivel - 1,
        quantidade_emprestada: (obra.quantidade_emprestada || 0) + 1
      });

      setResultado({
        tipo: "sucesso",
        mensagem: `Retirada confirmada! "${item.nome}" foi emprestado para você.`
      });
    } catch (error) {
      console.error("Erro:", error);
      setResultado({
        tipo: "erro",
        mensagem: error.message || "Erro ao processar. Tente novamente."
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
              <QrCode className="w-5 h-5" />
              Retirada de Item
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
            ) : item ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-10 h-10 text-[#1B3A5F]" />
                    <div>
                      <h3 className="font-semibold text-slate-800">{item.nome}</h3>
                      <p className="text-sm text-slate-500">{item.autor}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge>{item.tipo}</Badge>
                        <Badge variant={item.quantidade_disponivel > 0 ? "default" : "destructive"}>
                          {item.quantidade_disponivel} disponível
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-500">
                  Prazo de devolução: 30 dias
                </p>

                <Button 
                  className="w-full bg-[#1B3A5F] hover:bg-[#15304d]"
                  onClick={confirmarRetirada}
                  disabled={processing || (item.quantidade_disponivel || 0) <= 0}
                >
                  {processing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Confirmar Retirada"
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-3" />
                <p className="text-slate-600">
                  Código não encontrado ou inválido.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}