import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { CheckCircle, XCircle, Pencil, Loader2, FileText, GraduationCap, Clock, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SugestaoForm from "@/components/biblioteca/SugestaoForm";

const statusColors = {
  "Pendente": "bg-amber-100 text-amber-700",
  "Aprovado": "bg-emerald-100 text-emerald-700",
  "Reprovado": "bg-red-100 text-red-700",
  "Em Revisão": "bg-blue-100 text-blue-700",
};

export default function BibAprovacoes() {
  const [sugestoes, setSugestoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revisando, setRevisando] = useState(null);
  const [processando, setProcessando] = useState(null);

  useEffect(() => {
    const bibAuth = sessionStorage.getItem("bib_auth");
    if (bibAuth !== "true") { window.location.href = createPageUrl("BibLogin"); return; }
    load();
  }, []);

  const load = async () => {
    const data = await base44.entities.SugestaoAcervo.list("-created_date");
    setSugestoes(data);
    setLoading(false);
  };

  const aprovar = async (s) => {
    setProcessando(s.id);
    await base44.entities.AcervoDigital.create({
      titulo: s.titulo,
      autor: s.autor,
      tipo: s.tipo,
      descricao: s.descricao ? `${s.descricao}\n\nSugerido por: ${s.irmao_nome} (GLP: ${s.irmao_numero_glp})` : `Sugerido por: ${s.irmao_nome} (GLP: ${s.irmao_numero_glp})`,
      data_publicacao: s.data_publicacao,
      grau_minimo: s.grau_minimo,
      arquivo_url: s.arquivo_url,
      capa_url: s.capa_url,
      ativo: true,
      disponivel: true,
    });
    await base44.entities.SugestaoAcervo.update(s.id, { status: "Aprovado" });
    toast.success(`"${s.titulo}" aprovado e adicionado ao acervo digital!`);
    setProcessando(null);
    load();
  };

  const reprovar = async (s) => {
    setProcessando(s.id);
    await base44.entities.SugestaoAcervo.update(s.id, { status: "Reprovado" });
    toast.info(`"${s.titulo}" reprovado.`);
    setProcessando(null);
    load();
  };

  const deletar = async (id) => {
    await base44.entities.SugestaoAcervo.delete(id);
    toast.success("Registro removido do histórico.");
    load();
  };

  const handleRevisar = async (form) => {
    await base44.entities.SugestaoAcervo.update(revisando.id, { ...form, status: "Em Revisão" });
    toast.success("Sugestão atualizada.");
    setRevisando(null);
    load();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-[#1B3A5F]" />
    </div>
  );

  const pendentes = sugestoes.filter(s => s.status === "Pendente" || s.status === "Em Revisão");
  const historico = sugestoes.filter(s => s.status === "Aprovado" || s.status === "Reprovado");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Aprovações de Acervo</h1>
        <p className="text-slate-500">{pendentes.length} pendente(s) de revisão</p>
      </div>

      {pendentes.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-slate-400">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
            Nenhuma sugestão pendente.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {pendentes.map(s => (
          <Card key={s.id} className="overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <div className="flex gap-3">
                <div className="w-12 h-16 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {s.capa_url
                    ? <img src={s.capa_url} alt="" className="w-full h-full object-cover rounded-lg" />
                    : <FileText className="w-6 h-6 text-slate-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">{s.titulo}</h3>
                  {s.autor && <p className="text-xs text-slate-500 truncate">{s.autor}</p>}
                  <p className="text-xs text-slate-400 mt-0.5">Por: {s.irmao_nome} ({s.irmao_numero_glp})</p>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    <Badge variant="outline" className="text-xs">{s.tipo}</Badge>
                    <Badge className={`${statusColors[s.status]} text-xs`}>{s.status}</Badge>
                    <Badge className="bg-blue-50 text-blue-600 text-xs">
                      <GraduationCap className="w-3 h-3 mr-1" />{s.grau_minimo}
                    </Badge>
                  </div>
                </div>
              </div>

              {s.descricao && (
                <p className="text-xs text-slate-600 bg-slate-50 rounded p-2 line-clamp-2">{s.descricao}</p>
              )}

              <div className="flex gap-2 pt-1 flex-wrap">
                {s.arquivo_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-slate-300 text-slate-600 hover:bg-slate-50"
                    onClick={() => window.open(s.arquivo_url, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-1" />Visualizar Arquivo
                  </Button>
                )}
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 flex-1"
                  onClick={() => aprovar(s)}
                  disabled={processando === s.id}
                >
                  {processando === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4 mr-1" />Aprovar</>}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                  onClick={() => setRevisando(s)}
                  disabled={processando === s.id}
                >
                  <Pencil className="w-4 h-4 mr-1" />Revisar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => reprovar(s)}
                  disabled={processando === s.id}
                >
                  <XCircle className="w-4 h-4 mr-1" />Reprovar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {historico.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-700 mb-3">Histórico</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {historico.map(s => (
              <Card key={s.id} className="opacity-70">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-10 h-12 bg-slate-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {s.capa_url
                      ? <img src={s.capa_url} alt="" className="w-full h-full object-cover rounded" />
                      : <FileText className="w-5 h-5 text-slate-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{s.titulo}</p>
                    <p className="text-xs text-slate-400">{s.irmao_nome}</p>
                  </div>
                  <Badge className={`${statusColors[s.status]} text-xs`}>{s.status}</Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                    onClick={() => deletar(s.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!revisando} onOpenChange={() => setRevisando(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Revisar Sugestão</DialogTitle>
          </DialogHeader>
          {revisando && (
            <SugestaoForm
              sugestao={revisando}
              onSave={handleRevisar}
              onCancel={() => setRevisando(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}