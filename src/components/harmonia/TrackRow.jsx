import { Play, Pause, Repeat, X, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import TrackProgressBar from "./TrackProgressBar";

export default function TrackRow({
  track, index, total, isCurrent, isPlaying,
  onToggle, onMove, onRemove, onRepeat, position, duration, onSeek,
}) {
  // Música em execução: player grande, fácil de ver e de tocar no celular
  if (isCurrent) {
    return (
      <div className="rounded-xl bg-[#253251] text-white px-4 py-4 shadow-lg ring-2 ring-[#D6B45E]">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold tabular-nums text-[#D6B45E] flex-shrink-0">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold leading-tight break-words">{track.name}</p>
            {track.artists && <p className="text-sm text-slate-300 truncate">{track.artists}</p>}
          </div>
        </div>

        <div className="mt-3">
          <TrackProgressBar position={position} duration={duration} onSeek={onSeek} />
        </div>

        <div className="mt-3 flex items-center justify-center gap-3">
          <Button size="icon" variant="ghost" title="Subir" disabled={index === 0}
            className="h-10 w-10 text-white hover:text-[#D6B45E] hover:bg-white/10 disabled:opacity-20"
            onClick={() => onMove(track.id, -1)}>
            <ChevronUp className="w-5 h-5" />
          </Button>
          <button
            title="Tocar ou pausar"
            onClick={() => onToggle(track)}
            className="w-16 h-16 rounded-full border-[3px] border-[#D6B45E] text-[#D6B45E] hover:bg-[#D6B45E] hover:text-[#253251] flex items-center justify-center transition-colors"
          >
            {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
          </button>
          <Button size="icon" variant="ghost" title="Descer" disabled={index === total - 1}
            className="h-10 w-10 text-white hover:text-[#D6B45E] hover:bg-white/10 disabled:opacity-20"
            onClick={() => onMove(track.id, 1)}>
            <ChevronDown className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost" title="Repetir a partir desta música"
            className="h-10 w-10 text-white hover:text-[#D6B45E] hover:bg-white/10"
            onClick={() => onRepeat(index)}>
            <Repeat className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost" title="Remover música"
            className="h-10 w-10 text-slate-300 hover:text-red-300 hover:bg-white/10"
            onClick={() => {
              if (window.confirm(`Remover a música "${track.name}" desta etapa?`)) onRemove(track.id);
            }}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  // Demais músicas: linha compacta
  return (
    <div className="rounded-lg bg-slate-50 px-2 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold tabular-nums w-5 text-center flex-shrink-0 text-slate-400">
          {String(index + 1).padStart(2, "0")}
        </span>

        {track.file_url && (
          <button
            title="Tocar"
            onClick={() => onToggle(track)}
            className="w-10 h-10 rounded-full border-2 border-[#1B3A5F] text-[#1B3A5F] hover:bg-[#1B3A5F] hover:text-white flex items-center justify-center flex-shrink-0 transition-colors"
          >
            <Play className="w-4 h-4 ml-0.5" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-slate-800">{track.name}</p>
          {track.artists && <p className="text-xs truncate text-slate-400">{track.artists}</p>}
        </div>

        <div className="flex items-center flex-shrink-0">
          <Button size="icon" variant="ghost" title="Subir" disabled={index === 0}
            className="h-8 w-8 text-slate-400 hover:text-[#C9A227] disabled:opacity-20"
            onClick={() => onMove(track.id, -1)}>
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" title="Descer" disabled={index === total - 1}
            className="h-8 w-8 text-slate-400 hover:text-[#C9A227] disabled:opacity-20"
            onClick={() => onMove(track.id, 1)}>
            <ChevronDown className="w-4 h-4" />
          </Button>
          {track.file_url && (
            <Button size="icon" variant="ghost" title="Repetir a partir desta música"
              className="h-8 w-8 text-slate-400 hover:text-[#C9A227]"
              onClick={() => onRepeat(index)}>
              <Repeat className="w-4 h-4" />
            </Button>
          )}
          <Button size="icon" variant="ghost" title="Remover música"
            className="h-8 w-8 text-slate-400 hover:text-red-500"
            onClick={() => {
              if (window.confirm(`Remover a música "${track.name}" desta etapa?`)) onRemove(track.id);
            }}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}