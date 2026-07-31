import { useState, useEffect } from "react";
import { uploadFile } from "@/lib/upload";
import { db } from "@/api/db";
import { FolderPlus, ListMusic, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import BibliotecaMp3 from "@/components/harmonia/BibliotecaMp3";
import PastaMp3Card from "@/components/harmonia/PastaMp3Card";
import SelecionarMusicasModal from "@/components/harmonia/SelecionarMusicasModal";

export default function AdminMeusMp3s() {
  const [pastas, setPastas] = useState([]);
  const [mp3s, setMp3s] = useState([]);
  const [vinculos, setVinculos] = useState([]);
  const [novaPasta, setNovaPasta] = useState("");
  const [loading, setLoading] = useState(true);
  const [criando, setCriando] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [avisoDuplicadas, setAvisoDuplicadas] = useState("");
  const [modalPasta, setModalPasta] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const [p, m, v] = await Promise.all([
      db.PastaMp3.list("nome", 100),
      db.MinhaMp3.list("nome", 5000),
      db.PastaMusica.list("ordem", 5000),
    ]);
    setPastas(p);
    setMp3s(m);
    setVinculos(v);
    setLoading(false);
  };

  const criarPasta = async () => {
    const nome = novaPasta.trim();
    if (!nome) return;
    setCriando(true);
    const nova = await db.PastaMp3.create({ nome });
    setPastas((prev) => [...prev, nova].sort((a, b) => a.nome.localeCompare(b.nome)));
    setNovaPasta("");
    setCriando(false);
  };

  const handleUpload = async (files) => {
    setErrorMsg("");
    setAvisoDuplicadas("");
    const duplicadas = [];
    const nomesExistentes = new Set(mp3s.map((m) => m.nome.trim().toLowerCase()));
    try {
      for (const file of files) {
        const nome = file.name.replace(/\.(mp3|mpeg|wav|m4a)$/i, "");
        if (nomesExistentes.has(nome.trim().toLowerCase())) {
          duplicadas.push(nome);
          continue;
        }
        const { file_url } = await uploadFile({ file });
        const novo = await db.MinhaMp3.create({ nome, file_url });
        nomesExistentes.add(nome.trim().toLowerCase());
        setMp3s((prev) => [...prev, novo].sort((a, b) => a.nome.localeCompare(b.nome)));
      }
    } catch (err) {
      setErrorMsg("Não foi possível enviar um dos arquivos. Tente novamente.");
    }
    if (duplicadas.length > 0) {
      setAvisoDuplicadas(
        duplicadas.length === 1
          ? `A música "${duplicadas[0]}" já está presente na biblioteca e não foi enviada novamente.`
          : `As músicas ${duplicadas.map((n) => `"${n}"`).join(", ")} já estão presentes na biblioteca e não foram enviadas novamente.`
      );
    }
  };

  const handleDeleteMp3 = async (mp3) => {
    if (!confirm(`Excluir a música "${mp3.nome}" da biblioteca? Ela será removida de todas as pastas.`)) return;
    await db.MinhaMp3.delete(mp3.id);
    await db.PastaMusica.deleteMany({ mp3_id: mp3.id });
    setMp3s((prev) => prev.filter((m) => m.id !== mp3.id));
    setVinculos((prev) => prev.filter((v) => v.mp3_id !== mp3.id));
  };

  const handleTogglePasta = async (mp3, pasta) => {
    const existente = vinculos.find((v) => v.pasta_id === pasta.id && v.mp3_id === mp3.id);
    if (existente) {
      await db.PastaMusica.delete(existente.id);
      setVinculos((prev) => prev.filter((v) => v.id !== existente.id));
    } else {
      const ordem = vinculos.filter((v) => v.pasta_id === pasta.id).length;
      const novo = await db.PastaMusica.create({ pasta_id: pasta.id, mp3_id: mp3.id, ordem });
      setVinculos((prev) => [...prev, novo]);
    }
  };

  const handleConfirmMusicas = async (ids) => {
    const pasta = modalPasta;
    setModalPasta(null);
    const atuais = vinculos.filter((v) => v.pasta_id === pasta.id);
    const atuaisIds = atuais.map((v) => v.mp3_id);

    // Remove os desmarcados
    const remover = atuais.filter((v) => !ids.includes(v.mp3_id));
    for (const v of remover) {
      await db.PastaMusica.delete(v.id);
    }

    // Adiciona os novos
    const adicionar = ids.filter((id) => !atuaisIds.includes(id));
    let novos = [];
    if (adicionar.length > 0) {
      novos = await db.PastaMusica.bulkCreate(
        adicionar.map((mp3Id, i) => ({
          pasta_id: pasta.id,
          mp3_id: mp3Id,
          ordem: atuais.length + i,
        }))
      );
    }

    setVinculos((prev) => [
      ...prev.filter((v) => v.pasta_id !== pasta.id || ids.includes(v.mp3_id)),
      ...novos,
    ]);
  };

  const handleMoveMusica = async (pasta, mp3, dir) => {
    const lista = vinculos
      .filter((v) => v.pasta_id === pasta.id)
      .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    const idx = lista.findIndex((v) => v.mp3_id === mp3.id);
    const alvo = idx + dir;
    if (idx === -1 || alvo < 0 || alvo >= lista.length) return;
    const nova = [...lista];
    [nova[idx], nova[alvo]] = [nova[alvo], nova[idx]];
    const updates = nova.map((v, i) => ({ id: v.id, ordem: i }));
    setVinculos((prev) =>
      prev.map((v) => {
        const u = updates.find((x) => x.id === v.id);
        return u ? { ...v, ordem: u.ordem } : v;
      })
    );
    await db.PastaMusica.bulkUpdate(updates);
  };

  const handleRemoveMusica = async (pasta, mp3) => {
    const vinculo = vinculos.find((v) => v.pasta_id === pasta.id && v.mp3_id === mp3.id);
    if (!vinculo) return;
    await db.PastaMusica.delete(vinculo.id);
    setVinculos((prev) => prev.filter((v) => v.id !== vinculo.id));
  };

  const handleDeletePasta = async (pasta) => {
    if (!confirm(`Excluir a pasta "${pasta.nome}"? As músicas continuam na biblioteca.`)) return;
    await db.PastaMusica.deleteMany({ pasta_id: pasta.id });
    await db.PastaMp3.delete(pasta.id);
    setVinculos((prev) => prev.filter((v) => v.pasta_id !== pasta.id));
    setPastas((prev) => prev.filter((p) => p.id !== pasta.id));
  };

  const musicasDaPasta = (pasta) =>
    vinculos
      .filter((v) => v.pasta_id === pasta.id)
      .sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
      .map((v) => mp3s.find((m) => m.id === v.mp3_id))
      .filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
          <ListMusic className="w-6 h-6 text-[#C9A227]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A5F]">Pastas de Músicas</h1>
          <p className="text-slate-500 text-sm">Envie MP3s para a biblioteca e vincule-os a quantas pastas quiser</p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{errorMsg}</div>
      )}

      {avisoDuplicadas && (
        <div className="bg-amber-50 text-amber-700 text-sm rounded-lg p-3 flex items-start justify-between gap-3">
          <span>{avisoDuplicadas}</span>
          <button className="font-bold flex-shrink-0" onClick={() => setAvisoDuplicadas("")}>✕</button>
        </div>
      )}

      <BibliotecaMp3
        mp3s={mp3s}
        pastas={pastas}
        vinculos={vinculos}
        onUpload={handleUpload}
        onDelete={handleDeleteMp3}
        onTogglePasta={handleTogglePasta}
      />

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

      {pastas.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-slate-400">
            <ListMusic className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhuma pasta criada ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pastas.map((p) => (
            <PastaMp3Card
              key={p.id}
              pasta={p}
              musicas={musicasDaPasta(p)}
              onAddMusicas={setModalPasta}
              onRemoveMusica={handleRemoveMusica}
              onMoveMusica={handleMoveMusica}
              onDeletePasta={handleDeletePasta}
            />
          ))}
        </div>
      )}

      <SelecionarMusicasModal
        open={modalPasta !== null}
        onClose={() => setModalPasta(null)}
        mp3s={mp3s}
        initialIds={modalPasta ? vinculos.filter((v) => v.pasta_id === modalPasta.id).map((v) => v.mp3_id) : []}
        onConfirm={handleConfirmMusicas}
        titulo={modalPasta ? `Músicas da pasta "${modalPasta.nome}"` : ""}
      />
    </div>
  );
}