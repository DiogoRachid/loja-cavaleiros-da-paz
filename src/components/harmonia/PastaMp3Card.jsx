import { useState } from "react";
import { FolderOpen, Music, Plus, Trash2, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PastaPlayer from "@/components/harmonia/PastaPlayer";

export default function PastaMp3Card({ pasta, musicas, onAddMusicas, onRemoveMusica, onMoveMusica, onDeletePasta }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-lodge-navy/10">
            <FolderOpen className="h-5 w-5 text-lodge-navy" />
          </div>
          <button className="flex-1 min-w-0 text-left" onClick={() => setExpanded(!expanded)}>
            <p className="font-semibold text-slate-800 text-sm truncate">{pasta.nome}</p>
            <p className="text-xs text-slate-500">{musicas.length} música{musicas.length !== 1 ? "s" : ""}</p>
          </button>

          <Button
            size="sm"
            variant="outline"
            className="border-lodge-navy/30 text-lodge-navy hover:bg-lodge-navy hover:text-primary-foreground"
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
          <Button size="icon" variant="ghost" onClick={() => setExpanded(!expanded)} aria-label={expanded ? "Recolher pasta" : "Expandir pasta"} aria-expanded={expanded}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {expanded && (
          <div className="mt-4">
            {musicas.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-4">
                Nenhuma música vinculada. Use "Adicionar Músicas".
              </p>
            ) : (
              <PastaPlayer
                musicas={musicas}
                expanded={expanded}
                renderRowActions={(m, i) => (
                  <>
                    <div className="flex flex-col">
                      <button
                        title="Mover para cima"
                        disabled={i === 0}
                        className="text-[#94a3b8] hover:text-[#D6B45E] disabled:opacity-20 disabled:cursor-default"
                        onClick={() => onMoveMusica(pasta, m, -1)}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        title="Mover para baixo"
                        disabled={i === musicas.length - 1}
                        className="text-[#94a3b8] hover:text-[#D6B45E] disabled:opacity-20 disabled:cursor-default"
                        onClick={() => onMoveMusica(pasta, m, 1)}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Remover da pasta (o arquivo continua na biblioteca)"
                      className="h-7 w-7 text-red-400 hover:text-red-500 hover:bg-red-50/10"
                      onClick={() => onRemoveMusica(pasta, m)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </>
                )}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}