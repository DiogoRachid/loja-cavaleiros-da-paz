import { useState } from "react";
import { Music, Plus, X, Play, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import SpotifyPlayer from "./SpotifyPlayer";

export default function RoteiroEtapa({ etapa, index, onRename, onSelectTrack, onRemoveTrack, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(etapa.nome);
  const [showPlayer, setShowPlayer] = useState(false);

  const num = String(index + 1).padStart(2, "0");
  const hasTrack = !!etapa.track;

  const handleSaveName = () => {
    onRename(etapa.id, name.trim() || `Etapa ${num}`);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#3D3730] bg-[#221F1B] hover:border-[#4A4239] transition-colors group">
      <GripVertical className="w-4 h-4 text-[#5A5249] flex-shrink-0" />

      <span className="text-[#D1C7B7] text-sm font-serif w-8 flex-shrink-0">{num}</span>

      {editing ? (
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={handleSaveName}
          onKeyDown={e => e.key === "Enter" && handleSaveName()}
          className="bg-transparent text-white font-semibold text-sm border-b border-[#C9A227] outline-none flex-1 min-w-0"
        />
      ) : (
        <button
          onClick={() => { setEditing(true); setName(etapa.nome); }}
          className="text-white font-semibold text-sm text-left flex-1 min-w-0 truncate hover:text-[#C9A227] transition-colors"
        >
          {etapa.nome}
        </button>
      )}

      {hasTrack ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          {etapa.track.image && (
            <img src={etapa.track.image} alt="" className="w-8 h-8 rounded object-cover" />
          )}
          <div className="hidden sm:block max-w-[180px]">
            <p className="text-[#C6A97A] text-xs font-medium truncate">{etapa.track.name}</p>
            <p className="text-[#8A8275] text-[10px] truncate">{etapa.track.artists}</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-[#C6A97A] hover:text-white hover:bg-[#3D3730]"
            onClick={() => setShowPlayer(!showPlayer)}
          >
            {showPlayer ? "⏹" : <Play className="w-3 h-3" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-950/40"
            onClick={() => onRemoveTrack(etapa.id)}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="border-[#3D3730] text-[#C6A97A] hover:bg-[#3D3730] hover:text-white text-xs h-7"
          onClick={() => onSelectTrack(etapa.id)}
        >
          <Music className="w-3 h-3 mr-1" />Selecionar
        </Button>
      )}

      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 text-[#5A5249] hover:text-red-400 hover:bg-red-950/40"
        onClick={() => onRemove(etapa.id)}
      >
        <Trash2 className="w-3 h-3" />
      </Button>

      {showPlayer && hasTrack && (
        <div className="w-full mt-2 ml-12">
          <SpotifyPlayer trackId={etapa.track.id} />
        </div>
      )}
    </div>
  );
}