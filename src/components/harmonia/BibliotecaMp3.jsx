import { useState, useRef } from "react";
import { Music, Upload, Trash2, Loader2, ChevronDown, ChevronUp, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AudioPlayer from "@/components/harmonia/AudioPlayer";

export default function BibliotecaMp3({ mp3s, onUpload, onDelete }) {
  const [expanded, setExpanded] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    await onUpload(files);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-10 h-10 rounded-lg bg-[#C9A227] flex items-center justify-center flex-shrink-0">
            <Library className="w-5 h-5 text-[#1B3A5F]" />
          </div>
          <button className="flex-1 min-w-0 text-left" onClick={() => setExpanded(!expanded)}>
            <p className="font-semibold text-slate-800 text-sm">Biblioteca de Músicas</p>
            <p className="text-xs text-slate-500">{mp3s.length} música{mp3s.length !== 1 ? "s" : ""} enviada{mp3s.length !== 1 ? "s" : ""}</p>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/mp3,audio/mpeg,audio/wav,audio/x-m4a,audio/mp4"
            className="hidden"
            onChange={handleFiles}
          />
          <Button
            size="sm"
            disabled={uploading}
            className="bg-[#1B3A5F] text-white hover:bg-[#152d49]"
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
            Enviar MP3s
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {expanded && (
          <div className="mt-4 space-y-2">
            {mp3s.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-4">Nenhuma música enviada ainda.</p>
            ) : (
              mp3s.map((m) => (
                <div key={m.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <Music className="w-3 h-3 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-800 break-words">{m.nome}</p>
                      {m.artista && <p className="text-xs text-slate-400 break-words">{m.artista}</p>}
                    </div>
                  </div>
                  <AudioPlayer src={m.file_url} />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-red-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
                    onClick={() => onDelete(m)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}