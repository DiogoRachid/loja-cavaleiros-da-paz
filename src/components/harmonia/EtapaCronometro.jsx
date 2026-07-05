import { useState, useEffect, useRef } from "react";
import { Play, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
export default function EtapaCronometro({ etapaNome, onStop }) {
  const [inicio, setInicio] = useState(null);
  const [decorrido, setDecorrido] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [ultimo, setUltimo] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (inicio) {
      intervalRef.current = setInterval(() => {
        setDecorrido(Math.floor((Date.now() - inicio) / 1000));
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [inicio]);

  const iniciar = () => {
    setInicio(Date.now());
    setDecorrido(0);
  };

  const parar = async () => {
    clearInterval(intervalRef.current);
    const fim = Date.now();
    const registro = {
      hora_inicio: new Date(inicio).toISOString(),
      hora_fim: new Date(fim).toISOString(),
      duracao_segundos: Math.round((fim - inicio) / 1000),
    };
    setSalvando(true);
    await onStop(registro);
    setSalvando(false);
    setUltimo(registro);
    setInicio(null);
    setDecorrido(0);
  };

  return (
    <div className="flex items-center flex-wrap gap-3 px-4 pb-3 sm:ml-8">
      {inicio ? (
        <>
          <span className="font-mono text-lg font-bold text-[#1B3A5F] tabular-nums">
            {formatDuracao(decorrido)}
          </span>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white text-xs h-7"
            onClick={parar}
            disabled={salvando}
          >
            {salvando ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Square className="w-3 h-3 mr-1" />}
            Parar
          </Button>
          <span className="text-xs text-slate-400">Início às {formatHora(new Date(inicio).toISOString())}</span>
        </>
      ) : (
        <>
          <Button
            size="sm"
            variant="outline"
            className="border-green-600 text-green-700 hover:bg-green-600 hover:text-white text-xs h-7"
            onClick={iniciar}
          >
            <Play className="w-3 h-3 mr-1" /> Iniciar Etapa
          </Button>
          {ultimo && (
            <span className="text-xs text-green-700">
              ✓ {formatHora(ultimo.hora_inicio)} • durou {formatDuracao(ultimo.duracao_segundos)}
            </span>
          )}
        </>
      )}
    </div>
  );
}