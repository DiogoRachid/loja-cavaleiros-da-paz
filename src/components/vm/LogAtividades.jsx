import { useEffect, useState } from "react";
import { db } from "@/api/db";
import { History, LogIn, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LogAtividadeRow from "@/components/vm/LogAtividadeRow";

const FILTROS = [
  { id: "todos", label: "Todos" },
  { id: "login", label: "Logins", icon: LogIn },
  { id: "download", label: "Downloads", icon: Download },
];

export default function LogAtividades() {
  const [itens, setItens] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [acessos, downloads, irmaos] = await Promise.all([
        db.LogAcesso.list("-data_acesso", 50),
        db.LogDownload.list("-data_download", 50),
        db.Irmao.list(),
      ]);
      const cargos = Object.fromEntries((irmaos || []).map((i) => [i.id, i.cargo]));
      const lista = [
        ...(acessos || []).map((l) => ({ id: "a" + l.id, tipo: "login", nome: l.irmao_nome, irmao_id: l.irmao_id, data: l.data_acesso, detalhe: l.tipo_acesso || "Login" })),
        ...(downloads || []).map((l) => ({ id: "d" + l.id, tipo: "download", nome: l.irmao_nome, irmao_id: l.irmao_id, data: l.data_download, detalhe: l.documento_titulo })),
      ].map((i) => ({ ...i, cargo: cargos[i.irmao_id] }));
      lista.sort((a, b) => new Date(b.data) - new Date(a.data));
      setItens(lista);
      setLoading(false);
    })();
  }, []);

  const visiveis = filtro === "todos" ? itens : itens.filter((i) => i.tipo === filtro);

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2 text-lodge-navy">
          <History className="h-5 w-5" /> Log de Acessos
        </CardTitle>
        <div className="flex gap-2">
          {FILTROS.map((f) => (
            <Button key={f.id} size="sm" variant={filtro === f.id ? "default" : "outline"} onClick={() => setFiltro(f.id)}>
              {f.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : visiveis.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Nenhum registro encontrado.</p>
        ) : (
          <div className="max-h-[420px] divide-y divide-border overflow-y-auto">
            {visiveis.map((i) => <LogAtividadeRow key={i.id} item={i} />)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}