import { useState, useEffect } from "react";
import { db } from "@/api/db";
import { gerarSecoes } from "@/components/secretario/gerarMinuta";
import { imprimirBalaustre } from "@/components/secretario/imprimirBalaustre";
import BalaustreEditor from "@/components/secretario/BalaustreEditor";
import { FileText, Loader2, Wand2, Save, Printer, Users, Timer, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminBalaustre() {
  const [sessoes, setSessoes] = useState([]);
  const [sessaoId, setSessaoId] = useState("");
  const [dados, setDados] = useState(null); // { sessao, presencas, tempos, ordemEntrada, dadosLoja, vmNome }
  const [secoes, setSecoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSessao, setLoadingSessao] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    const init = async () => {
      const lista = await db.Sessao.filter({ status: { $ne: "Cancelada" } }, "-data", 100);
      setSessoes(lista || []);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!sessaoId) return;
    const load = async () => {
      setLoadingSessao(true);
      setSalvo(false);
      const [sessao, presencas, tempos, ordemEntrada, lojas, quadro, visitantes, expedientes] = await Promise.all([
        db.Sessao.get(sessaoId),
        db.Presenca.filter({ sessao_id: sessaoId }),
        db.TempoEtapa.filter({ sessao_id: sessaoId }),
        db.OrdemEntrada.filter({ sessao_id: sessaoId }),
        db.DadosLoja.list(),
        db.QuadroOficiais.filter({ exercicio: new Date().getFullYear().toString() }),
        db.VisitanteSessao.filter({ sessao_id: sessaoId }, "nome", 200),
        db.Expediente.filter({ sessao_id: sessaoId }, "data", 200),
      ]);
      const contexto = {
        sessao,
        presencas: presencas || [],
        tempos: tempos || [],
        ordemEntrada: ordemEntrada || [],
        dadosLoja: lojas?.[0] || null,
        vmNome: quadro?.find((q) => q.cargo === "Venerável Mestre")?.titular_nome || "",
        assinaturas: {
          vm: quadro?.find((q) => q.cargo === "Venerável Mestre")?.titular_nome || "",
          secretario: quadro?.find((q) => q.cargo === "Secretário")?.titular_nome || "",
          orador: quadro?.find((q) => q.cargo === "Orador")?.titular_nome || "",
        },
        visitantes: visitantes || [],
        expedientes: expedientes || [],
      };
      setDados(contexto);

      // Ata já salva? Carrega. Senão, gera minuta pelo andamento.
      let carregadas = null;
      if (sessao.ata) {
        try {
          const parsed = JSON.parse(sessao.ata);
          if (Array.isArray(parsed?.secoes)) carregadas = parsed.secoes;
        } catch {
          carregadas = [{ id: "texto", titulo: "Ata", texto: sessao.ata }];
        }
      }
      setSecoes(carregadas || gerarSecoes(contexto));
      setLoadingSessao(false);
    };
    load();
  }, [sessaoId]);

  const gerarPeloAndamento = () => {
    if (!dados) return;
    if (secoes.some((s) => s.texto?.trim()) && !confirm("Substituir o texto atual pela minuta gerada a partir do andamento da reunião?")) return;
    setSecoes(gerarSecoes(dados));
    setSalvo(false);
  };

  const salvar = async () => {
    setSalvando(true);
    await db.Sessao.update(sessaoId, { ata: JSON.stringify({ secoes }) });
    setSalvando(false);
    setSalvo(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const presentes = dados?.presencas.filter((p) => p.presente).length || 0;
  const autoridades = dados?.ordemEntrada.filter((o) => o.tipo_participante === "Autoridade" && (o.presente || o.confirmado)).length || 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center flex-shrink-0">
          <FileText className="w-6 h-6 text-[#C9A227]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1B3A5F]">Balaústre (Ata)</h1>
          <p className="text-slate-500 text-sm">Montagem da ata conforme o andamento da reunião</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <Select value={sessaoId} onValueChange={setSessaoId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a sessão" />
            </SelectTrigger>
            <SelectContent>
              {sessoes.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {new Date(s.data + "T12:00:00").toLocaleDateString("pt-BR")} — {s.tipo} ({s.grau}) {s.status === "Realizada" ? "• Realizada" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {dados && !loadingSessao && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1"><Users className="w-3 h-3" /> {presentes} presentes</Badge>
              <Badge variant="outline" className="gap-1"><Timer className="w-3 h-3" /> {dados.tempos.length} etapas cronometradas</Badge>
              <Badge variant="outline" className="gap-1"><Shield className="w-3 h-3" /> {autoridades} autoridades</Badge>
              <Badge variant="outline" className="gap-1"><Users className="w-3 h-3" /> {dados.visitantes.length} visitantes</Badge>
              <Badge variant="outline" className="gap-1"><FileText className="w-3 h-3" /> {dados.expedientes.length} expedientes</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {loadingSessao && (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      )}

      {dados && !loadingSessao && (
        <>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={gerarPeloAndamento} className="gap-2">
              <Wand2 className="w-4 h-4" /> Gerar minuta pelo andamento
            </Button>
            <Button onClick={salvar} disabled={salvando} className="gap-2 bg-[#1B3A5F] hover:bg-[#152e4d]">
              {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : salvo ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {salvando ? "Salvando..." : salvo ? "Salvo" : "Salvar"}
            </Button>
            <Button variant="outline" onClick={() => imprimirBalaustre({ sessao: dados.sessao, secoes, dadosLoja: dados.dadosLoja, assinaturas: dados.assinaturas })} className="gap-2">
              <Printer className="w-4 h-4" /> Imprimir
            </Button>
          </div>

          <BalaustreEditor secoes={secoes} onChange={(s) => { setSecoes(s); setSalvo(false); }} />
        </>
      )}
    </div>
  );
}