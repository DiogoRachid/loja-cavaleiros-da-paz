import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Music, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminMeusMp3s() {
  const [mp3s, setMp3s] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await base44.entities.MinhaMp3.list("-created_date", 100);
    setMp3s(data);
    setLoading(false);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErrorMsg("");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const nome = file.name.replace(/\.(mp3|mpeg|wav|m4a)$/i, "");
      const novo = await base44.entities.MinhaMp3.create({ nome, file_url });
      setMp3s((prev) => [novo, ...prev]);
    } catch (err) {
      setErrorMsg("Não foi possível enviar o arquivo. Tente novamente.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Deseja excluir este arquivo?")) return;
    await base44.entities.MinhaMp3.delete(id);
    setMp3s((prev) => prev.filter((m) => m.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
            <Music className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A5F]">Meus MP3s</h1>
            <p className="text-slate-500 text-sm">Envie arquivos de música próprios para usar no roteiro</p>
          </div>
        </div>

        <div>
          <Input
            ref={fileInputRef}
            type="file"
            accept="audio/mp3,audio/mpeg,audio/wav,audio/x-m4a,audio/mp4"
            className="hidden"
            id="mp3-upload-input"
            onChange={handleFileSelect}
          />
          <label htmlFor="mp3-upload-input">
            <Button asChild disabled={uploading} className="bg-[#1B3A5F] text-white hover:bg-[#152d49] cursor-pointer">
              <span>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                Enviar MP3
              </span>
            </Button>
          </label>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{errorMsg}</div>
      )}

      {mp3s.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-slate-400">
            <Music className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum arquivo MP3 enviado ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {mp3s.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <Music className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">{m.nome}</p>
                    {m.artista && <p className="text-xs text-slate-500 truncate">{m.artista}</p>}
                  </div>
                </div>
                <audio controls src={m.file_url} className="h-9 w-full sm:w-64" />
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
                  onClick={() => handleDelete(m.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}