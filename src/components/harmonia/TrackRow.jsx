import { Play, Pause, Repeat, X, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import TrackProgressBar from "./TrackProgressBar";

export default function TrackRow({
  track, index, total, isCurrent, isPlaying,
  onToggle, onMove, onRemove, onRepeat, position, duration, onSeek,
}) {
  return (
    <div className={`rounded-lg px-2 py-2 transition-colors ${isCurrent ? "bg-[#253251] text-white" : "bg-slate-50"}`}>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold tabular-nums w-5 text-center flex-shrink-0 ${isCurrent ? "text-[#D6B45E]" : "text-slate-400"}`}>
          {String(index + 1).padStart(2, "0")}
        </span>

        {track.file_url && (
          <button
            title="Tocar ou pausar"
            onClick={() => onToggle(track)}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              isCurrent ? "border-[#D6B45E] text-[#D6B45E]" : "border-[#1B3A5F] text-[#1B3A5F] hover:bg-[#1B3A5F] hover:text-white"
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>
        )}

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isCurrent ? "text-white" : "text-slate-800"}`}>{track.name}</p>
          {track.artists && (
            <p className={`text-xs truncate ${isCurrent ? "text-slate-300" : "text-slate-400"}`}>{track.artists}</p>
          )}
        </div>

        <div className="flex items-center flex-shrink-0">
          <Button size="icon" variant="ghost" title="Subir" disabled={index === 0}
            className="h-7 w-7 text-slate-400 hover:text-[#C9A227] disabled:opacity-20"
            onClick={() => onMove(track.id, -1)}>
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" title="Descer" disabled={index === total - 1}
            className="h-7 w-7 text-slate-400 hover:text-[#C9A227] disabled:opacity-20"
            onClick={() => onMove(track.id, 1)}>
            <ChevronDown className="w-4 h-4" />
          </Button>
          {track.file_url && (
            <Button size="icon" variant="ghost" title="Repetir a partir desta música"
              className="h-7 w-7 text-slate-400 hover:text-[#C9A227]"
              onClick={() => onRepeat(index)}>
              <Repeat className="w-4 h-4" />
            </Button>
          )}
          <Button size="icon" variant="ghost" title="Remover música"
            className="h-7 w-7 text-slate-400 hover:text-red-500"
            onClick={() => {
              if (window.confirm(`Remover a música "${track.name}" desta etapa?`)) onRemove(track.id);
            }}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isCurrent && (
        <div className="mt-2 px-1">
          <TrackProgressBar position={position} duration={duration} onSeek={onSeek} />
        </div>
      )}
    </div>
  );
}