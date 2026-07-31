import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { createPageUrl } from "@/utils";
import { PDFDocument } from "pdf-lib";
import {
  BookOpen, FileText, Lock, User, Eye, EyeOff, Loader2,
  AlertTriangle, ArrowLeft, Star, MapPin, GraduationCap,
  CheckCircle, XCircle, Calendar, Download, Minimize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";

export default function AcervoPublico() {
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get("id");
  const tipo = urlParams.get("tipo"); // "fisico" ou "digital"

  const [irmao, setIrmao] = useState(null);
  const [item, setItem] = useState(null);
  const [preview, setPreview] = useState(null); // dados públicos (capa+título)
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingItem, setLoadingItem] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Recuperar senha
  const [recuperarSenha, setRecuperarSenha] = useState(false);
  const [glpRecuperar, setGlpRecuperar] = useState("");
  const [msgRecuperar, setMsgRecuperar] = useState("");
  const [recuperarLoading, setRecuperarLoading] = useState(false);

  // Login state
  const [numeroGlp, setNumeroGlp] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const irmaoAuth = sessionStorage.getItem("irmao_auth");
    const irmaoData = sessionStorage.getItem("irmao_data");
    if (irmaoAuth === "true" && irmaoData) {
      setIrmao(JSON.parse(irmaoData));
    }
    // Carregar prévia pública (capa + título) independente de auth
    if (itemId) loadPreview();
    setLoading(false);
  }, []);

  const loadPreview = async () => {
    try {
      if (tipo === "digital") {
        const docs = await db.AcervoDigital.filter({ id: itemId });
        const doc = docs[0];
        if (doc) {
          const titulo = doc.titulo;
          const capa = doc.capa_url;
          setPreview({ titulo, capa });
          setMetaTags(titulo, capa);
        }
      } else {
        const its = await db.Item.filter({ id: itemId });
        const it = its[0];
        if (it) {
          const titulo = it.nome;
          const capa = it.imagem_capa;
          setPreview({ titulo, capa });
          setMetaTags(titulo, capa);
        }
      }
    } catch (e) {}
  };

  const setMetaTags = (titulo, capaUrl) => {
    document.title = `${titulo} — Biblioteca Cavaleiros da Paz nº25`;
    const setMeta = (property, content) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute("property", property); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("og:title", titulo);
    setMeta("og:description", "Biblioteca Cavaleiros da Paz nº25");
    if (capaUrl) setMeta("og:image", capaUrl);
    setMeta("og:type", "book");
  };

  useEffect(() => {
    if (irmao && itemId) {
      loadItem();
    }
  }, [irmao, itemId]);

  const loadItem = async () => {
    setLoadingItem(true);
    if (tipo === "digital") {
      const [doc, avs] = await Promise.all([
        db.AcervoDigital.filter({ id: itemId }),
        db.Avaliacao.filter({ documento_id: itemId }, "-data_avaliacao")
      ]);
      setItem(doc[0] || null);
      setAvaliacoes(avs);
    } else {
      const [it, avs] = await Promise.all([
        db.Item.filter({ id: itemId }),
        db.Avaliacao.filter({ item_id: itemId }, "-data_avaliacao")
      ]);
      setItem(it[0] || null);
      setAvaliacoes(avs);
    }
    setLoadingItem(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setError("");

    const irmaos = await db.Irmao.filter({ numero_glp: numeroGlp.trim(), ativo: true });
    if (irmaos.length === 0) {
      setError("Número GLP não encontrado.");
      setLoginLoading(false);
      return;
    }
    const ir = irmaos[0];
    const senhaCorreta = ir.senha || ir.numero_glp;
    if (senha !== senhaCorreta) {
      setError("Senha incorreta.");
      setLoginLoading(false);
      return;
    }

    // Registrar log de acesso via backend (sem auth Base44)
    await base44.functions.invoke('registrarLog', {
      tipo: 'acesso',
      dados: {
        irmao_id: ir.id,
        irmao_nome: ir.nome_completo,
        irmao_numero_glp: ir.numero_glp,
        data_acesso: new Date().toISOString(),
        tipo_acesso: 'Login'
      }
    }).catch(console.error);

    sessionStorage.setItem("irmao_auth", "true");
    sessionStorage.setItem("irmao_data", JSON.stringify(ir));
    setIrmao(ir);
    setLoginLoading(false);
  };

  const handleRecuperarSenha = async (e) => {
    e.preventDefault();
    setRecuperarLoading(true);
    setError("");
    setMsgRecuperar("");
    const irmaos = await db.Irmao.filter({ numero_glp: glpRecuperar.trim(), ativo: true });
    if (irmaos.length === 0) {
      setError("Número GLP não encontrado.");
      setRecuperarLoading(false);
      return;
    }
    const ir = irmaos[0];
    await db.Irmao.update(ir.id, { senha: ir.numero_glp, primeiro_acesso: true });
    setMsgRecuperar(`Senha redefinida! Use seu número GLP (${ir.numero_glp}) como senha.`);
    setRecuperarLoading(false);
  };

  const abrirPDF = (url) => {
    // Registrar log de download via backend (sem auth Base44)
    if (irmao && item) {
      base44.functions.invoke('registrarLog', {
        tipo: 'download',
        dados: {
          documento_id: item.id,
          documento_titulo: item.titulo,
          irmao_id: irmao.id,
          irmao_nome: irmao.nome_completo,
          irmao_numero_glp: irmao.numero_glp,
          data_download: new Date().toISOString()
        }
      }).catch(console.error);
    }
  };

  const compactarPDF = async (url) => {
    setPdfLoading(true);
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const compressed = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([compressed], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'documento_compactado.pdf';
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error('Erro ao compactar PDF:', e);
    }
    setPdfLoading(false);
  };

  const mediaAvaliacao = avaliacoes.length > 0
    ? avaliacoes.reduce((acc, av) => acc + av.nota, 0) / avaliacoes.length
    : 0;

  const renderStars = (rating) => (
    <div className="flex text-amber-400">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? "fill-current" : "text-slate-200"}`} />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1B3A5F] to-[#0D1F33]">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  // Tela de login se não autenticado
  if (!irmao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B3A5F] to-[#0D1F33] flex items-center justify-center p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#C9A227]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C9A227]/5 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="border-0 shadow-2xl">
            {preview?.capa && (
              <div className="h-48 overflow-hidden rounded-t-xl">
                <img src={preview.capa} alt={preview.titulo} className="w-full h-full object-cover" />
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#C9A227] to-[#8B7019] flex items-center justify-center">
                <Lock className="w-8 h-8 text-[#1B3A5F]" />
              </div>
              <CardTitle className="text-2xl text-[#1B3A5F]">Acesso Restrito</CardTitle>
              <p className="text-sm text-slate-500">Faça login para visualizar este conteúdo da Biblioteca Cavaleiros da Paz nº25</p>
            </CardHeader>
            <CardContent>
              {recuperarSenha ? (
                <form onSubmit={handleRecuperarSenha} className="space-y-4">
                  <p className="text-sm text-slate-600">Informe seu número GLP. A senha será redefinida para o número GLP.</p>
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}
                    </div>
                  )}
                  {msgRecuperar && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">{msgRecuperar}</div>
                  )}
                  <div className="space-y-2">
                    <Label>Número GLP</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input value={glpRecuperar} onChange={(e) => setGlpRecuperar(e.target.value)} placeholder="Seu número GLP" className="pl-10" required />
                    </div>
                  </div>
                  {!msgRecuperar && (
                    <Button type="submit" className="w-full bg-[#1B3A5F] hover:bg-[#15304d]" disabled={recuperarLoading || !glpRecuperar}>
                      {recuperarLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Redefinindo...</> : "Redefinir Senha"}
                    </Button>
                  )}
                  <Button type="button" variant="outline" className="w-full" onClick={() => { setRecuperarSenha(false); setError(""); setMsgRecuperar(""); }}>
                    Voltar ao login
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Número GLP</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input value={numeroGlp} onChange={(e) => setNumeroGlp(e.target.value)} placeholder="Seu número GLP" className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="Sua senha"
                        className="pl-10 pr-10"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-[#1B3A5F] hover:bg-[#15304d]" disabled={loginLoading || !numeroGlp || !senha}>
                    {loginLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verificando...</> : "Entrar"}
                  </Button>
                </form>
              )}
              <div className="mt-4 text-center space-y-2">
                {!recuperarSenha && (
                  <button type="button" onClick={() => { setRecuperarSenha(true); setError(""); }}
                    className="text-sm text-[#C9A227] hover:text-[#b08c1e] w-full">
                    Esqueci minha senha
                  </button>
                )}
                <Link to={createPageUrl("Home")} className="text-sm text-slate-500 hover:text-[#1B3A5F] flex items-center justify-center gap-1">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para o início
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Carregando item
  if (loadingItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B3A5F]" />
      </div>
    );
  }

  // Item não encontrado
  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">Item não encontrado</h2>
        <Link to={createPageUrl("IrmaoEmprestimos")} className="mt-4 text-[#1B3A5F] hover:underline text-sm">
          Ir para o portal
        </Link>
      </div>
    );
  }

  // Exibir item
  const titulo = tipo === "digital" ? item.titulo : item.nome;
  const capa = tipo === "digital" ? item.capa_url : item.imagem_capa;

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Header */}
      <header className="bg-[#1B3A5F] text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#C9A227] flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-[#1B3A5F]" />
          </div>
          <span className="font-semibold text-sm hidden sm:block">Biblioteca Cavaleiros da Paz nº25</span>
        </div>
        <Link to={tipo === "digital" ? createPageUrl("IrmaoAcervoDigital") : createPageUrl("IrmaoAcervo")}
          className="text-sm text-[#C9A227] hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Ver acervo completo
        </Link>
      </header>

      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Card principal */}
        <Card className="overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-40 h-44 sm:h-56 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden mx-auto max-w-[200px] sm:max-w-none">
                {capa ? (
                  <img src={capa} alt="" className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="w-16 h-16 text-slate-300" />
                )}
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-slate-800 break-words leading-tight">{titulo}</h1>
                  {item.autor && <p className="text-slate-500 mt-1 text-sm sm:text-base break-words">{item.autor}</p>}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-xs">{item.tipo}</Badge>
                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    Grau {item.grau_minimo}
                  </Badge>
                  {tipo === "fisico" && (
                    <Badge className={item.quantidade_disponivel > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                      {item.quantidade_disponivel > 0 ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                      {item.quantidade_disponivel > 0 ? "Disponível" : "Indisponível"}
                    </Badge>
                  )}
                </div>

                {avaliacoes.length > 0 && (
                  <div className="flex items-center gap-2">
                    {renderStars(mediaAvaliacao)}
                    <span className="text-sm text-slate-500">{mediaAvaliacao.toFixed(1)} ({avaliacoes.length} avaliações)</span>
                  </div>
                )}

                {item.data_publicacao && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    {format(parseISO(item.data_publicacao), "dd/MM/yyyy")}
                  </div>
                )}

                {tipo === "fisico" && item.localizacao && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="w-4 h-4" />
                    {item.localizacao}
                  </div>
                )}

                {tipo === "digital" && item.arquivo_url && (
                  <a
                    href={item.arquivo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => abrirPDF(item.arquivo_url)}
                    className="inline-flex items-center justify-center bg-[#1B3A5F] hover:bg-[#15304d] text-white rounded-md px-4 py-2 text-sm font-medium w-full sm:w-auto"
                  >
                    <Eye className="w-4 h-4 mr-2" />Ver PDF
                  </a>
                )}
              </div>
            </div>

            {item.descricao && (
              <div className="mt-4 pt-4 border-t text-sm text-slate-600 leading-relaxed">
                {item.descricao}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Avaliações */}
        {avaliacoes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Avaliações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {avaliacoes.map((av) => (
                <div key={av.id} className="bg-slate-50 p-3 rounded-lg text-sm">
                  <div className="flex flex-wrap justify-between items-start gap-1 mb-1">
                    <span className="font-medium text-slate-700 text-sm">{av.irmao_nome}</span>
                    {renderStars(av.nota)}
                  </div>
                  {av.comentario && <p className="text-slate-600">{av.comentario}</p>}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>


    </div>
  );
}