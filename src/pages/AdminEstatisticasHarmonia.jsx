import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { ArrowLeft, Loader2, Clock, Timer, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const TIPOS = ["Ordinária", "Magna", "Pública", "Instrução", "Fúnebre"];
const GRAUS = ["Aprendiz", "Companheiro", "Mestre"];

function formatDuracao(segundos) {
  const s = Math.max(0, Math.round(segundos));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}

function formatDataHora(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminEstatisticasHarmonia() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroGrau, setFiltroGrau] = useState("todos");
  const [excluir, setExcluir] = useState(null);
  const [confirmarApagarTudo, setConfirmarApagarTudo] = useState(false);
  const [apagandoTudo, setApagandoTudo] = useState(false);

  useEffect(() => {
    loadDados();
  }, []);

  const loadDados = async () => {
    const r = await db.TempoEtapa.list("-hora_inicio", 500);
    setRegistros(r);
    setLoading(false);
  };

  const confirmarExclusao = async () => {
    await db.TempoEtapa.delete(excluir.id);
    setRegistros((prev) => prev.filter((r) => r.id !== excluir.id));
    setExcluir(null);
  };

  const apagarTodoHistorico = async () => {
    setApagandoTudo(true);
    let res = await db.TempoEtapa.deleteMany({ etapa_nome: { $exists: true } });
    while (res?.has_more) {
      res = await db.TempoEtapa.deleteMany({ etapa_nome: { $exists: true } });
    }
    setRegistros([]);
    setApagandoTudo(false);
    setConfirmarApagarTudo(false);
  };

  const filtrados = registros.filter((r) =>
    (filtroTipo === "todos" || r.sessao_tipo === filtroTipo) &&
    (filtroGrau === "todos" || r.grau === filtroGrau)
  );

  // Tempo médio por etapa
  const medias = {};
  filtrados.forEach((r) => {
    if (!medias[r.etapa_nome]) medias[r.etapa_nome] = { total: 0, count: 0 };
    medias[r.etapa_nome].total += r.duracao_segundos || 0;
    medias[r.etapa_nome].count += 1;
  });
  const mediasArr = Object.entries(medias)
    .map(([nome, { total, count }]) => ({ nome, media: total / count, count }))
    .sort((a, b) => b.media - a.media);

  const totalMedio = filtrados.length
    ? filtrados.reduce((acc, r) => acc + (r.duracao_segundos || 0), 0) / filtrados.length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/AdminMestreHarmonia">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
          <Timer className="w-6 h-6 text-[#C9A227]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1B3A5F]">Tempos das Etapas</h1>
          <p className="text-slate-500 text-sm">Tempo médio decorrido por etapa e histórico</p>
        </div>
        {registros.length > 0 && (
          <Button
            variant="outline"
            className="ml-auto border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => setConfirmarApagarTudo(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Apagar Todo Histórico
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Tipo de sessão" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroGrau} onValueChange={setFiltroGrau}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Grau" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os graus</SelectItem>
            {GRAUS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Tempo médio por etapa */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-sm font-semibold text-[#1B3A5F] mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Tempo médio por etapa
            {filtrados.length > 0 && (
              <span className="ml-auto text-xs font-normal text-slate-500">
                Média geral: {formatDuracao(totalMedio)}
              </span>
            )}
          </h2>
          {mediasArr.length === 0 ? (
            <p className="text-center text-slate-400 py-8 text-sm">
              Nenhum registro de tempo ainda. Use "Iniciar Etapa" no roteiro para cronometrar.
            </p>
          ) : (
            <div className="space-y-2">
              {mediasArr.map((m) => (
                <div key={m.nome} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <span className="text-sm font-medium text-slate-800 flex-1 truncate">{m.nome}</span>
                  <span className="text-xs text-slate-400">{m.count} registro{m.count > 1 ? "s" : ""}</span>
                  <span className="font-mono text-base font-bold text-[#1B3A5F] tabular-nums w-16 text-right">
                    {formatDuracao(m.media)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-sm font-semibold text-[#1B3A5F] mb-4">Histórico ({filtrados.length})</h2>
          {filtrados.length === 0 ? (
            <p className="text-center text-slate-400 py-8 text-sm">Nenhum registro.</p>
          ) : (
            <div className="space-y-2">
              {filtrados.map((r) => (
                <div key={r.id} className="flex items-center flex-wrap gap-3 p-3 rounded-lg border border-slate-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{r.etapa_nome}</p>
                    <p className="text-xs text-slate-400">
                      {r.sessao_tipo}{r.grau ? ` • ${r.grau}` : ""} • início {formatDataHora(r.hora_inicio)}
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-[#1B3A5F] tabular-nums">
                    {formatDuracao(r.duracao_segundos)}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50"
                    onClick={() => setExcluir(r)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!excluir} onOpenChange={(o) => !o && setExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir registro de tempo?</AlertDialogTitle>
            <AlertDialogDescription>
              {excluir && `${excluir.etapa_nome} • ${formatDuracao(excluir.duracao_segundos)} • ${formatDataHora(excluir.hora_inicio)}`}
              <br />Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmarApagarTudo} onOpenChange={(o) => !o && !apagandoTudo && setConfirmarApagarTudo(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar todo o histórico de tempos?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os {registros.length} registros de tempo serão excluídos permanentemente.
              <br />Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={apagandoTudo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); apagarTodoHistorico(); }}
              disabled={apagandoTudo}
              className="bg-red-600 hover:bg-red-700"
            >
              {apagandoTudo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Apagar Tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}