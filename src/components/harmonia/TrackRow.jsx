import { Repeat, X, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import InlinePlayerBar from "./InlinePlayerBar";
import { useMp3Playback } from "./Mp3PlaybackContext";

export default function TrackRow({
  track, index, total, isCurrent, isPlaying,
  onToggle, onMove, onRemove, onRepeat, position, duration, onSeek,
}) {
  const { volume, setVolume } = useMp3Playback();

  const player = track.file_url && (
    <InlinePlayerBar
      playing={isCurrent && isPlaying}
      position={isCurrent ? position : 0}
      duration={isCurrent ? duration : 0}
      volume={volume}
      onToggle={() => onToggle(track)}
      onSeek={(ms) => (isCurrent ? onSeek(ms) : onToggle(track))}
      onVolume={setVolume}
      className="w-full sm:w-[280px] flex-shrink-0"
    />
  );

  const acoes = (
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
  );

  return (
    <div className={`rounded-lg px-2 py-2 ${isCurrent ? "bg-[#1B3A5F]/10 ring-1 ring-[#C9A227]" : "bg-slate-50"}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={`text-xs font-bold tabular-nums w-5 text-center flex-shrink-0 ${isCurrent ? "text-[#C9A227]" : "text-slate-400"}`}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-slate-800">{track.name}</p>
            {track.artists && <p className="text-xs truncate text-slate-400">{track.artists}</p>}
          </div>
          <div className="sm:hidden">{acoes}</div>
        </div>
        {player}
        <div className="hidden sm:block">{acoes}</div>
      </div>
    </div>
  );
}