import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  QrCode, Camera, Loader2, BookOpen, ArrowLeft,
  CheckCircle, AlertTriangle, Package, X, SwitchCamera
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

const grauOrdem = { "Aprendiz": 1, "Companheiro": 2, "Mestre": 3 };

export default function IrmaoScan() {
  const [user, setUser] = useState(null);
  const [irmao, setIrmao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [codigoManual, setCodigoManual] = useState("");
  const [processing, setProcessing] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [facingMode, setFacingMode] = useState("environment");
  
  // Refs para câmera
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  
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
  const PREFIXO_PRESENCA = "LCP25-PRESENCA-";

  useEffect(() => {
    loadData();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError("");
    setCameraOpen(true);
    
    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Iniciar escaneamento
        startScanning();
      }
    } catch (error) {
      console.error("Erro ao acessar câmera:", error);
      setCameraError("Não foi possível acessar a câmera. Verifique as permissões.");
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setCameraOpen(false);
    setScanning(false);
  };

  const switchCamera = async () => {
    stopCamera();
    setFacingMode(prev => prev === "environment" ? "user" : "environment");
    setTimeout(() => startCamera(), 100);
  };

  const loadJsQR = () => {
    return new Promise((resolve, reject) => {
      if (window.jsQR) {
        resolve(window.jsQR);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
      script.onload = () => resolve(window.jsQR);
      script.onerror = () => reject(new Error('Falha ao carregar leitor de QR'));
      document.head.appendChild(script);
    });
  };

  const startScanning = async () => {
    setScanning(true);
    
    try {
      await loadJsQR();
    } catch (err) {
      setCameraError("Erro ao carregar leitor de QR Code.");
      return;
    }
    
    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        
        if (code && code.data) {
          stopCamera();
          processarCodigo(code.data);
        }
      }
    }, 250);
  };

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
      setIrmao(irmaoSessao);
        
      // Carregar empréstimos ativos
      const emps = await db.Emprestimo.filter(
        { irmao_id: irmaoSessao.id, status: "Ativo" }
      );
      setEmprestimosAtivos(emps);
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

      // Código de presença de sessão
      if (codigo.startsWith(PREFIXO_PRESENCA)) {
        await registrarPresenca(codigo.replace(PREFIXO_PRESENCA, ""));
        setProcessing(false);
        setCodigoManual("");
        return;
      }

      // Buscar item pelo código QR
      const itens = await db.Item.filter({ codigo_qr: codigo });
      
      if (itens.length === 0) {
        setResultado({
          tipo: "erro",
          mensagem: "Item não encontrado. Verifique o código."
        });
      } else {
        const item = itens[0];
        // Verificar grau mínimo
        const grauItem = item.grau_minimo || "Aprendiz";
        const grauIrmao = irmao?.grau || "Aprendiz";
        
        if (grauOrdem[grauIrmao] < grauOrdem[grauItem]) {
          setResultado({
            tipo: "erro",
            mensagem: `"${item.nome}" é restrito para ${grauItem}s. Seu grau atual é ${grauIrmao}.`
          });
        } else if ((item.quantidade_disponivel || 0) <= 0) {
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

  const registrarPresenca = async (sessaoId) => {
    const sessao = await db.Sessao.get(sessaoId);
    if (!sessao) {
      setResultado({ tipo: "erro", mensagem: "Sessão não encontrada para este QR Code." });
      return;
    }

    const existentes = await db.Presenca.filter({ sessao_id: sessaoId, irmao_id: irmao.id });
    const dados = {
      sessao_id: sessaoId,
      sessao_data: sessao.data,
      irmao_id: irmao.id,
      irmao_nome: irmao.nome_completo,
      irmao_cim: irmao.numero_glp,
      presente: true,
    };

    if (existentes.length > 0) {
      if (existentes[0].presente) {
        setResultado({ tipo: "sucesso", mensagem: "Sua presença já estava registrada nesta sessão." });
        return;
      }
      await db.Presenca.update(existentes[0].id, { presente: true });
    } else {
      await db.Presenca.create(dados);
    }

    const dataFmt = new Date(sessao.data + "T12:00:00").toLocaleDateString("pt-BR");
    setResultado({
      tipo: "sucesso",
      mensagem: `Presença registrada na Sessão ${sessao.tipo} de ${dataFmt}. Aguarde a conferência do Ir∴ Chanceler.`,
    });
  };

  const confirmarRetirada = async () => {
    if (!itemEncontrado || !irmao) return;
    setProcessing(true);

    try {
      // Criar empréstimo
      await db.Emprestimo.create({
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
      await db.Item.update(itemEncontrado.id, {
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
        await db.Emprestimo.update(emp.id, {
          data_devolucao: format(new Date(), "yyyy-MM-dd"),
          status: "Devolvido"
        });

        // Atualizar item
        const itens = await db.Item.filter({ id: emp.item_id });
        if (itens.length > 0) {
          await db.Item.update(itens[0].id, {
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
          <p className="text-slate-500">Presença na sessão, retirada ou devolução de itens</p>
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

      {/* Câmera para Escanear */}
      {cameraOpen ? (
        <Card className="overflow-hidden">
          <CardContent className="p-0 relative">
            <video 
              ref={videoRef} 
              className="w-full aspect-square object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Overlay com guia */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-white rounded-2xl shadow-lg">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#C9A227] rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#C9A227] rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#C9A227] rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#C9A227] rounded-br-xl" />
              </div>
            </div>
            
            {scanning && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Procurando QR Code...
              </div>
            )}
            
            {cameraError && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
                <div className="text-center text-white">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-amber-400" />
                  <p>{cameraError}</p>
                </div>
              </div>
            )}
            
            {/* Controles da câmera */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full w-12 h-12 bg-white/90 hover:bg-white"
                onClick={switchCamera}
              >
                <SwitchCamera className="w-5 h-5" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="rounded-full w-12 h-12"
                onClick={stopCamera}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-br from-[#1B3A5F] to-[#15304d] text-white">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-white/10 flex items-center justify-center">
                <Camera className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Escanear QR Code</h3>
                <p className="text-sm text-slate-300 mt-1">
                  Aponte a câmera para o QR Code do item
                </p>
              </div>
              <Button 
                className="w-full bg-[#C9A227] hover:bg-[#b8922a] text-[#1B3A5F] font-semibold"
                onClick={startCamera}
              >
                <Camera className="w-4 h-4 mr-2" />
                Abrir Câmera
              </Button>
            </div>
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
            <div className="w-8 h-8 rounded-full bg-[#C9A227]/20 flex items-center justify-center text-[#1B3A5F] font-bold text-sm flex-shrink-0">
              ★
            </div>
            <div>
              <p className="font-medium text-slate-800">Para marcar presença na sessão</p>
              <p className="text-sm text-slate-500">
                Escaneie o QR Code da lista de presença do dia — sua presença é registrada na hora
              </p>
            </div>
          </div>
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