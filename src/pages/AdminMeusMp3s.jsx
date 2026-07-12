import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FolderPlus, ListMusic, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PastaMp3Card from "@/components/harmonia/PastaMp3Card";

export default function AdminMeusMp3s() {
  const [pastas, setPastas] = useState([]);
  const [mp3s, setMp3s] = useState([]);
  const [novaPasta, setNovaPasta] = useState("");
  const [loading, setLoading] = useState(true);
  const [criando, setCriando] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const [p, m] = await Promise.all([
      base44.entities.PastaMp3.list("nome", 100),
      base44.entities.MinhaMp3.list("-created_date", 500),
    ]);
    setPastas(p);
    setMp3s(m);
    setLoading(false);
  };

  const criarPasta = async () => {
    const nome = novaPasta.trim();
    if (!nome) return;
    setCriando(true);
    const nova = await base44.entities.PastaMp3.create({ nome });
    setPastas((prev) => [...prev, nova].sort((a, b) => a.nome.localeCompare(b.nome)));
    setNovaPasta("");
    setCriando(false);
  };

  const handleUpload = async (pasta, files) => {
    setErrorMsg("");
    try {
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        const nome = file.name.replace(/\.(mp3|mpeg|wav|m4a)$/i, "");
        const novo = await base44.entities.MinhaMp3.create({
          nome,
          file_url,
          pasta_id: pasta.id,
          pasta_nome: pasta.nome,
        });
        setMp3s((prev) => [novo, ...prev]);
      }
    } catch (err) {
      setErrorMsg("Não foi possível enviar um dos arquivos. Tente novamente.");
    }
  };

  const handleDeleteMp3 = async (mp3) => {
    if (!confirm(`Excluir a música "${mp3.nome}"?`)) return;
    await base44.entities.MinhaMp3.delete(mp3.id);
    setMp3s((prev) => prev.filter((m) => m.id !== mp3.id));
  };

  const handleDeletePasta = async (pasta) => {
    if (!confirm(`Excluir a pasta "${pasta.nome}" e todas as suas músicas?`)) return;
    await base44.entities.MinhaMp3.deleteMany({ pasta_id: pasta.id });
    await base44.entities.PastaMp3.delete(pasta.id);
    setMp3s((prev) => prev.filter((m) => m.pasta_id !== pasta.id));
    setPastas((prev) => prev.filter((p) => p.id !== pasta.id));
  };

  const semPasta = mp3s.filter((m) => !m.pasta_id);

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
            <ListMusic className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A5F]">Pastas de Músicas</h1>
            <p className="text-slate-500 text-sm">Organize seus MP3s em pastas para usar como playlists das etapas</p>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 flex items-center gap-2">
          <Input
            placeholder="Nome da nova pasta (ex: Abertura, Tronco...)"
            value={novaPasta}
            onChange={(e) => setNovaPasta(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && criarPasta()}
          />
          <Button onClick={criarPasta} disabled={criando || !novaPasta.trim()} className="bg-[#1B3A5F] text-white hover:bg-[#152d49] flex-shrink-0">
            {criando ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <FolderPlus className="w-4 h-4 mr-1" />}
            Criar Pasta
          </Button>
        </CardContent>
      </Card>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{errorMsg}</div>
      )}

      {pastas.length === 0 && semPasta.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-slate-400">
            <ListMusic className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhuma pasta criada ainda. Crie uma pasta e envie seus MP3s.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pastas.map((p) => (
            <PastaMp3Card
              key={p.id}
              pasta={p}
              mp3s={mp3s.filter((m) => m.pasta_id === p.id)}
              onUpload={handleUpload}
              onDeleteMp3={handleDeleteMp3}
              onDeletePasta={handleDeletePasta}
            />
          ))}

          {semPasta.length > 0 && (
            <PastaMp3Card
              pasta={{ id: "", nome: "Sem pasta" }}
              mp3s={semPasta}
              onUpload={async () => {}}
              onDeleteMp3={handleDeleteMp3}
              onDeletePasta={null}
            />
          )}
        </div>
      )}
    </div>
  );
}