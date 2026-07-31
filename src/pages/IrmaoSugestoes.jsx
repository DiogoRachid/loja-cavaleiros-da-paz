import { useState, useEffect } from "react";
import { db } from "@/api/db";
import { createPageUrl } from "@/utils";
import { FileText, Plus, Loader2, GraduationCap, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import SugestaoForm from "@/components/biblioteca/SugestaoForm";
import UploadLote from "@/components/biblioteca/UploadLote";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors = {
  "Pendente": "bg-amber-100 text-amber-700",
  "Aprovado": "bg-emerald-100 text-emerald-700",
  "Reprovado": "bg-red-100 text-red-700",
  "Em Revisão": "bg-blue-100 text-blue-700",
};

const statusIcons = {
  "Pendente": <Clock className="w-3 h-3 mr-1" />,
  "Aprovado": <CheckCircle className="w-3 h-3 mr-1" />,
  "Reprovado": <XCircle className="w-3 h-3 mr-1" />,
  "Em Revisão": <Clock className="w-3 h-3 mr-1" />,
};

export default function IrmaoSugestoes() {
  const [sugestoes, setSugestoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [irmao, setIrmao] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const irmaoAuth = sessionStorage.getItem("irmao_auth");
    const irmaoData = sessionStorage.getItem("irmao_data");
    if (irmaoAuth !== "true" || !irmaoData) {
      window.location.href = createPageUrl("IrmaoLogin");
      return;
    }
    const ir = JSON.parse(irmaoData);
    setIrmao(ir);
    loadSugestoes(ir.id);
  }, []);

  const loadSugestoes = async (irmaoId) => {
    const data = await db.SugestaoAcervo.filter({ irmao_id: irmaoId }, "-created_date");
    setSugestoes(data);
    setLoading(false);
  };

  const handleEnviar = async (form) => {
    if (!irmao) return;
    setSalvando(true);
    await db.SugestaoAcervo.create({
      ...form,
      irmao_id: irmao.id,
      irmao_nome: irmao.nome_completo,
      irmao_numero_glp: irmao.numero_glp,
      status: "Pendente"
    });
    toast.success("Sugestão enviada! Aguarde aprovação do bibliotecário.");
    setFormOpen(false);
    setSalvando(false);
    loadSugestoes(irmao.id);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-[#1B3A5F]" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Minhas Sugestões</h1>
          <p className="text-slate-500">{sugestoes.length} sugestão(ões) enviada(s)</p>
        </div>
        <Button
          className="bg-[#C9A227] hover:bg-[#b08c1e] text-[#1B3A5F] font-semibold"
          onClick={() => setFormOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Sugestão
        </Button>
      </div>

      {/* Upload em Lote */}
      <UploadLote modo="irmao" irmao={irmao} onConcluido={() => loadSugestoes(irmao.id)} />

      {sugestoes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 mb-4">Você ainda não enviou nenhuma sugestão.</p>
            <Button
              className="bg-[#1B3A5F] hover:bg-[#15304d]"
              onClick={() => setFormOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Enviar primeira sugestão
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sugestoes.map(s => (
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
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      <Badge variant="outline" className="text-xs">{s.tipo}</Badge>
                      <Badge className={`${statusColors[s.status]} text-xs flex items-center`}>
                        {statusIcons[s.status]}{s.status}
                      </Badge>
                      {s.grau_minimo && (
                        <Badge className="bg-blue-50 text-blue-600 text-xs">
                          <GraduationCap className="w-3 h-3 mr-1" />{s.grau_minimo}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {s.observacoes_revisao && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-700">
                    <strong>Observação do bibliotecário:</strong> {s.observacoes_revisao}
                  </div>
                )}

                {s.descricao && (
                  <p className="text-xs text-slate-600 bg-slate-50 rounded p-2 line-clamp-2">{s.descricao}</p>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t">
                  <span>
                    {s.created_date ? format(new Date(s.created_date), "dd/MM/yyyy", { locale: ptBR }) : "—"}
                  </span>
                  {s.arquivo_url && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-7 text-[#1B3A5F]"
                      onClick={() => window.open(s.arquivo_url, '_blank')}
                    >
                      <Eye className="w-3 h-3 mr-1" />Ver arquivo
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sugerir Documento para o Acervo</DialogTitle>
          </DialogHeader>
          <SugestaoForm
            onSave={handleEnviar}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}