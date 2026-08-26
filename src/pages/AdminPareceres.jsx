import { useState, useEffect } from "react";
import { db } from "@/api/db";
import ParecerForm from "@/components/orador/ParecerForm";
import ParecerRow from "@/components/orador/ParecerRow";
import { imprimirParecer } from "@/components/orador/imprimirParecer";
import { Gavel, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FILTROS = ["Todos", "Rascunho", "Concluído", "Lido em Sessão"];

export default function AdminPareceres() {
  const [pareceres, setPareceres] = useState([]);
  const [sessoes, setSessoes] = useState([]);
  const [dadosLoja, setDadosLoja] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("Todos");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const admin = JSON.parse(sessionStorage.getItem("admin_data") || "{}");

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    const [ps, ss, lojas] = await Promise.all([
      db.Parecer.list("-data_parecer", 200),
      db.Sessao.filter({ status: { $ne: "Cancelada" } }, "-data", 40),
      db.DadosLoja.list(),
    ]);
    setPareceres(ps || []);
    setSessoes(ss || []);
    setDadosLoja(lojas?.[0] || null);
    setLoading(false);
  };

  const salvar = async (dados) => {
    if (editando) {
      await db.Parecer.update(editando.id, dados);
    } else {
      await db.Parecer.create({ ...dados, autor_nome: admin.nome_completo });
    }
    setDialogAberto(false);
    setEditando(null);
    await carregar();
  };

  const excluir = async (parecer) => {
    if (!window.confirm(`Excluir o parecer "${parecer.titulo}"?`)) return;
    await db.Parecer.delete(parecer.id);
    await carregar();
  };

  const abrirNovo = () => {
    setEditando(null);
    setDialogAberto(true);
  };

  const abrirEdicao = (parecer) => {
    setEditando(parecer);
    setDialogAberto(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const lista = filtro === "Todos" ? pareceres : pareceres.filter((p) => p.status === filtro);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center flex-shrink-0">
            <Gavel className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1B3A5F]">Pareceres do Orador</h1>
            <p className="text-slate-500 text-sm">Registro e emissão dos pareceres sobre propostas, pranchas e trabalhos</p>
          </div>
        </div>
        <Button className="gap-2 bg-[#1B3A5F] hover:bg-[#152e4d]" onClick={abrirNovo}>
          <Plus className="w-4 h-4" /> Novo parecer
        </Button>
      </div>

      <Tabs value={filtro} onValueChange={setFiltro}>
        <TabsList>
          {FILTROS.map((f) => (
            <TabsTrigger key={f} value={f}>{f}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {lista.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-slate-500 text-sm">
            Nenhum parecer registrado nesta situação.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {lista.map((p) => (
            <ParecerRow
              key={p.id}
              parecer={p}
              onEditar={abrirEdicao}
              onExcluir={excluir}
              onImprimir={(parecer) => imprimirParecer({ parecer, dadosLoja })}
            />
          ))}
        </div>
      )}

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar parecer" : "Novo parecer"}</DialogTitle>
          </DialogHeader>
          <ParecerForm
            parecer={editando}
            sessoes={sessoes}
            onSalvar={salvar}
            onCancelar={() => { setDialogAberto(false); setEditando(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}