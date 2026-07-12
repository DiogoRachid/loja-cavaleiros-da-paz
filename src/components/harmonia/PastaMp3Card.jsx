import { useState } from "react";
import { FolderOpen, Music, Plus, Trash2, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PastaMp3Card({ pasta, musicas, onAddMusicas, onRemoveMusica, onDeletePasta }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-10 h-10 rounded-lg bg-[#1B3A5F] flex items-center justify-center flex-shrink-0">
            <FolderOpen className="w-5 h-5 text-[#C9A227]" />
          </div>
          <button className="flex-1 min-w-0 text-left" onClick={() => setExpanded(!expanded)}>
            <p className="font-semibold text-slate-800 text-sm truncate">{pasta.nome}</p>
            <p className="text-xs text-slate-500">{musicas.length} música{musicas.length !== 1 ? "s" : ""}</p>
          </button>

          <Button
            size="sm"
            variant="outline"
            className="border-[#1B3A5F] text-[#1B3A5F] hover:bg-[#1B3A5F] hover:text-white"
            onClick={() => onAddMusicas(pasta)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Músicas
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-red-400 hover:text-red-500 hover:bg-red-50"
            onClick={() => onDeletePasta(pasta)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {expanded && (
          <div className="mt-4 space-y-2">
            {musicas.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-4">
                Nenhuma música vinculada. Use "Adicionar Músicas".
              </p>
            ) : (
              musicas.map((m) => (
                <div key={m.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <Music className="w-3 h-3 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-800 truncate">{m.nome}</p>
                  </div>
                  <audio controls src={m.file_url} className="h-8 w-full sm:w-56" />
                  <Button
                    size="icon"
                    variant="ghost"
                    title="Remover da pasta (o arquivo continua na biblioteca)"
                    className="h-7 w-7 text-red-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
                    onClick={() => onRemoveMusica(pasta, m)}
                  >
                    <X className="w-3 h-3" />
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