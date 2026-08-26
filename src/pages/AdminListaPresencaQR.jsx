import { useState, useEffect } from "react";
import { db } from "@/api/db";
import QRCodeDisplay from "@/components/biblioteca/QRCodeDisplay";
import { imprimirListaPresenca } from "@/components/presenca/imprimirListaPresenca";
import { QrCode, Loader2, Printer, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const codigoPresenca = (sessaoId) => `LCP25-PRESENCA-${sessaoId}`;

export default function AdminListaPresencaQR() {
  const [sessoes, setSessoes] = useState([]);
  const [sessaoId, setSessaoId] = useState("");
  const [sessao, setSessao] = useState(null);
  const [irmaos, setIrmaos] = useState([]);
  const [presencas, setPresencas] = useState([]);
  const [dadosLoja, setDadosLoja] = useState(null);
  const [loading, setLoading] = useState(true);
  const [carregandoSessao, setCarregandoSessao] = useState(false);

  useEffect(() => {
    const init = async () => {
      const [lista, irs, lojas] = await Promise.all([
        db.Sessao.filter({ status: { $ne: "Cancelada" } }, "-data", 60),
        db.Irmao.filter({ ativo: true }, "nome_completo", 500),
        db.DadosLoja.list(),
      ]);
      setSessoes(lista || []);
      setIrmaos(irs || []);
      setDadosLoja(lojas?.[0] || null);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!sessaoId) return;
    const load = async () => {
      setCarregandoSessao(true);
      const [s, p] = await Promise.all([
        db.Sessao.get(sessaoId),
        db.Presenca.filter({ sessao_id: sessaoId }),
      ]);
      setSessao(s);
      setPresencas(p || []);
      setCarregandoSessao(false);
    };
    load();
  }, [sessaoId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const marcadas = presencas.filter((p) => p.presente).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center flex-shrink-0">
          <QrCode className="w-6 h-6 text-[#C9A227]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1B3A5F]">QR Code de Presença</h1>
          <p className="text-slate-500 text-sm">Imprima a lista com o QR Code para os irmãos assinarem ou escanearem</p>
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
                  {new Date(s.data + "T12:00:00").toLocaleDateString("pt-BR")} — {s.tipo} ({s.grau})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {sessao && !carregandoSessao && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1"><Users className="w-3 h-3" /> {irmaos.length} irmãos ativos</Badge>
              <Badge variant="outline" className="gap-1"><CheckCircle className="w-3 h-3" /> {marcadas} presenças registradas</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {sessao && !carregandoSessao && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <QRCodeDisplay value={codigoPresenca(sessao.id)} itemName={`Presenca-${sessao.data}`} size={220} />

            <Button
              className="w-full gap-2 bg-[#1B3A5F] hover:bg-[#152e4d]"
              onClick={() => imprimirListaPresenca({ sessao, irmaos, dadosLoja, codigo: codigoPresenca(sessao.id) })}
            >
              <Printer className="w-4 h-4" /> Imprimir lista de presença com QR Code
            </Button>

            <p className="text-xs text-slate-500 text-center">
              O irmão escaneia este QR Code em "Escanear QR" no portal dele e a presença é registrada automaticamente,
              ficando para conferência do Ir∴ Chanceler em Presenças.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}