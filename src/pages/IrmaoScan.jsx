import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  QrCode, Camera, Loader2, BookOpen, ArrowLeft,
  CheckCircle, AlertTriangle, Package
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { format, addDays } from "date-fns";

export default function IrmaoScan() {
  const [user, setUser] = useState(null);
  const [irmao, setIrmao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [codigoManual, setCodigoManual] = useState("");
  const [processing, setProcessing] = useState(false);
  
  // Estados para retirada
  const [itemEncontrado, setItemEncontrado] = useState(null);
  const [retiradaDialogOpen, setRetiradaDialogOpen] = useState(false);
  
  // Estados para devolução
  const [devolucaoDialogOpen, setDevolucaoDialogOpen] = useState(false);
  const [emprestimosAtivos, setEmprestimosAtivos] = useState([]);
  const [itensSelecionados, setItensSelecionados] = useState([]);
  
  // Resultado
  const [resultado, setResultado] = useState(null);

  const CODIGO_DEVOLUCAO = "LCP25-DEVOLUCAO-BIBLIOTECA";

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
        
        // Carregar empréstimos ativos
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

  const processarCodigo = async (codigo) => {
    if (!codigo || processing) return;
    setProcessing(true);

    try {
      // Verificar se é código de devolução
      if (codigo === CODIGO_DEVOLUCAO) {
        if (emprestimosAtivos.length === 0) {
          setResultado({
            tipo: "erro",
            mensagem: "Você não tem empréstimos ativos para devolver."
          });
        } else {
          setDevolucaoDialogOpen(true);
        }
        setProcessing(false);
        return;
      }

      // Buscar item pelo código QR
      const itens = await base44.entities.Item.filter({ codigo_qr: codigo });
      
      if (itens.length === 0) {
        setResultado({
          tipo: "erro",
          mensagem: "Item não encontrado. Verifique o código."
        });
      } else {
        const item = itens[0];
        if ((item.quantidade_disponivel || 0) <= 0) {
          setResultado({
            tipo: "erro",
            mensagem: `"${item.nome}" não está disponível no momento.`
          });
        } else {
          setItemEncontrado(item);
          setRetiradaDialogOpen(true);
        }
      }
    } catch (error) {
      console.error("Erro ao processar código:", error);
      setResultado({
        tipo: "erro",
        mensagem: "Erro ao processar. Tente novamente."
      });
    }
    
    setProcessing(false);
    setCodigoManual("");
  };

  const confirmarRetirada = async () => {
    if (!itemEncontrado || !irmao) return;
    setProcessing(true);

    try {
      // Criar empréstimo
      await base44.entities.Emprestimo.create({
        item_id: itemEncontrado.id,
        item_nome: itemEncontrado.nome,
        irmao_id: irmao.id,
        irmao_nome: irmao.nome_completo,
        irmao_email: irmao.email,
        data_retirada: format(new Date(), "yyyy-MM-dd"),
        data_prevista_devolucao: format(addDays(new Date(), 30), "yyyy-MM-dd"),
        status: "Ativo",
        tipo_operacao: "QR Code"
      });

      // Atualizar quantidades
      await base44.entities.Item.update(itemEncontrado.id, {
        quantidade_disponivel: (itemEncontrado.quantidade_disponivel || 1) - 1,
        quantidade_emprestada: (itemEncontrado.quantidade_emprestada || 0) + 1
      });

      setResultado({
        tipo: "sucesso",
        mensagem: `Retirada confirmada! "${itemEncontrado.nome}" foi emprestado para você.`
      });

      setRetiradaDialogOpen(false);
      setItemEncontrado(null);
      await loadData(); // Recarregar dados
    } catch (error) {
      console.error("Erro na retirada:", error);
      setResultado({
        tipo: "erro",
        mensagem: "Erro ao processar retirada. Tente novamente."
      });
    }
    
    setProcessing(false);
  };

  const confirmarDevolucao = async () => {
    if (itensSelecionados.length === 0) return;
    setProcessing(true);

    try {
      for (const empId of itensSelecionados) {
        const emp = emprestimosAtivos.find(e => e.id === empId);
        if (!emp) continue;

        // Atualizar empréstimo
        await base44.entities.Emprestimo.update(emp.id, {
          data_devolucao: format(new Date(), "yyyy-MM-dd"),
          status: "Devolvido"
        });

        // Atualizar item
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

      setDevolucaoDialogOpen(false);
      setItensSelecionados([]);
      await loadData();
    } catch (error) {
      console.error("Erro na devolução:", error);
      setResultado({
        tipo: "erro",
        mensagem: "Erro ao processar devolução. Tente novamente."
      });
    }
    
    setProcessing(false);
  };

  const toggleItemSelecionado = (empId) => {
    setItensSelecionados(prev => 
      prev.includes(empId) 
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    );
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
        <AlertTriangle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Cadastro não encontrado</h2>
        <p className="text-slate-500">
          Entre em contato com o bibliotecário para realizar seu cadastro.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-4">
        <Link to={createPageUrl("IrmaoEmprestimos")}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Escanear QR Code</h1>
          <p className="text-slate-500">Retirada ou devolução de itens</p>
        </div>
      </div>

      {/* Resultado */}
      {resultado && (
        <Card className={resultado.tipo === "sucesso" ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}>
          <CardContent className="p-4 flex items-center gap-3">
            {resultado.tipo === "sucesso" ? (
              <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
            )}
            <p className={resultado.tipo === "sucesso" ? "text-emerald-800" : "text-red-800"}>
              {resultado.mensagem}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Como funciona
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium text-slate-800">Para retirar um item</p>
              <p className="text-sm text-slate-500">
                Escaneie o QR Code do livro/revista que deseja retirar
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium text-slate-800">Para devolver</p>
              <p className="text-sm text-slate-500">
                Escaneie o QR Code de "Devolução" fixado na biblioteca
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Manual */}
      <Card>
        <CardHeader>
          <CardTitle>Digite o código manualmente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Código do QR</Label>
            <Input
              placeholder="Ex: LCP25-1234567890-ABC"
              value={codigoManual}
              onChange={(e) => setCodigoManual(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && processarCodigo(codigoManual)}
            />
          </div>
          <Button 
            className="w-full bg-[#1B3A5F] hover:bg-[#15304d]"
            onClick={() => processarCodigo(codigoManual)}
            disabled={!codigoManual || processing}
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4 mr-2" />
                Verificar Código
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Atalho para Devolução */}
      {emprestimosAtivos.length > 0 && (
        <Card className="border-emerald-200">
          <CardContent className="p-4">
            <Button 
              variant="outline"
              className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              onClick={() => setDevolucaoDialogOpen(true)}
            >
              <Package className="w-4 h-4 mr-2" />
              Devolver itens ({emprestimosAtivos.length} ativo)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog Retirada */}
      <Dialog open={retiradaDialogOpen} onOpenChange={setRetiradaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Retirada</DialogTitle>
            <DialogDescription>
              Você está retirando o seguinte item:
            </DialogDescription>
          </DialogHeader>
          {itemEncontrado && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-[#1B3A5F]" />
                  <div>
                    <h3 className="font-semibold text-slate-800">{itemEncontrado.nome}</h3>
                    <p className="text-sm text-slate-500">{itemEncontrado.autor}</p>
                    <Badge className="mt-1">{itemEncontrado.tipo}</Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                Prazo de devolução: 30 dias ({format(addDays(new Date(), 30), "dd/MM/yyyy")})
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => { setRetiradaDialogOpen(false); setItemEncontrado(null); }}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 bg-[#1B3A5F] hover:bg-[#15304d]"
                  onClick={confirmarRetirada}
                  disabled={processing}
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar Retirada"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Devolução */}
      <Dialog open={devolucaoDialogOpen} onOpenChange={setDevolucaoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecione os itens para devolver</DialogTitle>
            <DialogDescription>
              Marque os itens que você está devolvendo:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-64 overflow-y-auto">
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
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => { setDevolucaoDialogOpen(false); setItensSelecionados([]); }}
            >
              Cancelar
            </Button>
            <Button 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={confirmarDevolucao}
              disabled={itensSelecionados.length === 0 || processing}
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                `Devolver ${itensSelecionados.length} item(ns)`
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}