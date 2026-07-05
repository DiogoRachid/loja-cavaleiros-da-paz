import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

function formatDuracao(segundos) {
  const s = Math.max(0, Math.floor(segundos));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}

function formatHora(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// onStop recebe { hora_inicio, hora_fim, duracao_segundos }
// startSignal: incrementa para iniciar externamente ("Tocar Etapa")
// stopSignal: incrementa para encerrar e salvar (outra etapa iniciou)
// isPaused: quando true, o tempo pausa; ao voltar a false, retoma somando os tempos
export default function EtapaCronometro({ etapaNome, onStop, startSignal = 0, stopSignal = 0, isPaused = false }) {
  const [rodando, setRodando] = useState(false);
  const [decorrido, setDecorrido] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [ultimo, setUltimo] = useState(null);

  const intervalRef = useRef(null);
  const inicioRef = useRef(null); // ISO do primeiro start
  const acumuladoRef = useRef(0); // segundos já acumulados (antes da atual retomada)
  const trechoInicioRef = useRef(null); // timestamp (ms) do trecho atual em execução

  // Controla o ticker: conta apenas enquanto rodando e não pausado
  useEffect(() => {
    clearInterval(intervalRef.current);
    if (rodando && !isPaused) {
      if (!trechoInicioRef.current) trechoInicioRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const trecho = (Date.now() - trechoInicioRef.current) / 1000;
        setDecorrido(acumuladoRef.current + trecho);
      }, 500);
    } else if (rodando && isPaused && trechoInicioRef.current) {
      // Fecha o trecho atual, somando ao acumulado
      acumuladoRef.current += (Date.now() - trechoInicioRef.current) / 1000;
      trechoInicioRef.current = null;
      setDecorrido(acumuladoRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [rodando, isPaused]);

  const iniciar = () => {
    inicioRef.current = new Date().toISOString();
    acumuladoRef.current = 0;
    trechoInicioRef.current = null;
    setDecorrido(0);
    setRodando(true);
  };

  const parar = async () => {
    if (!inicioRef.current) return;
    clearInterval(intervalRef.current);
    // Fecha trecho aberto, se houver
    if (trechoInicioRef.current) {
      acumuladoRef.current += (Date.now() - trechoInicioRef.current) / 1000;
      trechoInicioRef.current = null;
    }
    const registro = {
      hora_inicio: inicioRef.current,
      hora_fim: new Date().toISOString(),
      duracao_segundos: Math.round(acumuladoRef.current),
    };
    setSalvando(true);
    await onStop(registro);
    setSalvando(false);
    setUltimo(registro);
    setRodando(false);
    inicioRef.current = null;
    acumuladoRef.current = 0;
    setDecorrido(0);
  };

  // Início externo ("Tocar Etapa")
  useEffect(() => {
    if (startSignal > 0) iniciar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startSignal]);

  // Encerramento externo (outra etapa iniciou)
  useEffect(() => {
    if (stopSignal > 0 && inicioRef.current) parar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopSignal]);

  return (
    <div className="flex items-center flex-wrap gap-3 px-4 pb-3 sm:ml-8">
      {rodando ? (
        <>
          <span className="font-mono text-lg font-bold text-[#1B3A5F] tabular-nums">
            {formatDuracao(decorrido)}
          </span>
          {salvando && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
          {isPaused ? (
            <span className="text-xs text-amber-600 font-medium">Pausado</span>
          ) : (
            <span className="text-xs text-green-700 font-medium">Contando…</span>
          )}
          <span className="text-xs text-slate-400">Início às {formatHora(inicioRef.current)}</span>
        </>
      ) : (
        ultimo && (
          <span className="text-xs text-green-700">
            ✓ {formatHora(ultimo.hora_inicio)} • durou {formatDuracao(ultimo.duracao_segundos)}
          </span>
        )
      )}
    </div>
  );
}