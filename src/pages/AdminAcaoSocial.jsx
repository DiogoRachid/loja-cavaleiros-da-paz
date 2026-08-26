import { useState, useEffect } from "react";
import { db } from "@/api/db";
import PedidoForm from "@/components/acaosocial/PedidoForm";
import ParecerAcaoSocialForm from "@/components/acaosocial/ParecerAcaoSocialForm";
import PedidoRow from "@/components/acaosocial/PedidoRow";
import { imprimirParecer } from "@/components/orador/imprimirParecer";
import { HeartHandshake, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FILTROS = ["Todos", "Pendente", "Em Análise", "Parecer Emitido", "Pendente de leitura"];

export default function AdminAcaoSocial() {
  const [pedidos, setPedidos] = useState([]);
  const [sessoes, setSessoes] = useState([]);
  const [dadosLoja, setDadosLoja] = useState(null);
  const [sessaoLeitura, setSessaoLeitura] = useState("");
  const [filtro, setFiltro] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [dialogPedido, setDialogPedido] = useState(false);
  const [dialogParecer, setDialogParecer] = useState(false);
  const [selecionado, setSelecionado] = useState(null);
  const admin = JSON.parse(sessionStorage.getItem("admin_data") || "{}");

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    const [ps, ss, lojas] = await Promise.all([
      db.PedidoAcaoSocial.list("-data_recebimento", 200),
      db.Sessao.filter({ status: { $ne: "Cancelada" } }, "-data", 40),
      db.DadosLoja.list(),
    ]);
    setPedidos(ps || []);
    setSessoes(ss || []);
    setDadosLoja(lojas?.[0] || null);
    setLoading(false);
  };

  const salvarPedido = async (dados) => {
    if (selecionado) {
      await db.PedidoAcaoSocial.update(selecionado.id, dados);
    } else {
      await db.PedidoAcaoSocial.create({ ...dados, registrado_por: admin.nome_completo, status: "Pendente" });
    }
    setDialogPedido(false);
    setSelecionado(null);
    await carregar();
  };

  const salvarParecer = async (dados) => {
    await db.PedidoAcaoSocial.update(selecionado.id, { ...dados, parecer_autor: admin.nome_completo });
    setDialogParecer(false);
    setSelecionado(null);
    await carregar();
  };

  const marcarLeitura = async (pedido, status) => {
    const sessao = sessoes.find((s) => s.id === sessaoLeitura);
    await db.PedidoAcaoSocial.update(pedido.id, {
      leitura_status: status,
      sessao_leitura_id: status === "Lido" ? sessao?.id || null : null,
      sessao_leitura_data: status === "Lido" ? sessao?.data || null : null,
    });
    await carregar();
  };

  const excluir = async (pedido) => {
    if (!window.confirm(`Excluir o pedido "${pedido.titulo}"?`)) return;
    await db.PedidoAcaoSocial.delete(pedido.id);
    await carregar();
  };

  const imprimir = (pedido) =>
    imprimirParecer({
      parecer: {
        tipo: "Ação Social",
        titulo: pedido.titulo,
        referencia_descricao: `${pedido.tipo_auxilio}${pedido.solicitante ? ` — ${pedido.solicitante}` : ""}${
          pedido.prancha_referencia ? ` — Prancha nº ${pedido.prancha_referencia}` : ""
        }`,
        sessao_data: pedido.sessao_leitura_data,
        teor: [
          pedido.descricao ? `Pedido: ${pedido.descricao}` : null,
          pedido.parecer_teor,
          pedido.parecer_valor_sugerido != null
            ? `Valor sugerido: R$ ${Number(pedido.parecer_valor_sugerido).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.`
            : null,
        ]
          .filter(Boolean)
          .join("\n"),
        conclusao: pedido.parecer_conclusao || "Favorável",
        autor_nome: pedido.parecer_autor,
        data_parecer: pedido.parecer_data,
      },
      dadosLoja,
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const lista =
    filtro === "Todos"
      ? pedidos
      : filtro === "Pendente de leitura"
      ? pedidos.filter((p) => p.status === "Parecer Emitido" && p.leitura_status === "Pendente")
      : pedidos.filter((p) => p.status === filtro);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center flex-shrink-0">
            <HeartHandshake className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1B3A5F]">Secretaria de Ação Social</h1>
            <p className="text-slate-500 text-sm">Pranchas de auxílio externo, pareceres e controle de leitura em sessão</p>
          </div>
        </div>
        <Button className="gap-2 bg-[#1B3A5F] hover:bg-[#152e4d]" onClick={() => { setSelecionado(null); setDialogPedido(true); }}>
          <Plus className="w-4 h-4" /> Nova prancha
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <Label className="text-xs text-slate-500">Sessão de referência ao marcar como lido</Label>
          <Select value={sessaoLeitura} onValueChange={setSessaoLeitura}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione a sessão da leitura" />
            </SelectTrigger>
            <SelectContent>
              {sessoes.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {new Date(s.data + "T12:00:00").toLocaleDateString("pt-BR")} — {s.tipo} ({s.grau})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Tabs value={filtro} onValueChange={setFiltro}>
        <TabsList className="flex-wrap h-auto">
          {FILTROS.map((f) => (
            <TabsTrigger key={f} value={f}>{f}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {lista.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-slate-500 text-sm">Nenhuma prancha nesta situação.</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {lista.map((p) => (
            <PedidoRow
              key={p.id}
              pedido={p}
              onEditar={(ped) => { setSelecionado(ped); setDialogPedido(true); }}
              onParecer={(ped) => { setSelecionado(ped); setDialogParecer(true); }}
              onImprimir={imprimir}
              onExcluir={excluir}
              onLeitura={marcarLeitura}
            />
          ))}
        </div>
      )}

      <Dialog open={dialogPedido} onOpenChange={setDialogPedido}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selecionado ? "Editar prancha" : "Nova prancha de auxílio"}</DialogTitle>
          </DialogHeader>
          <PedidoForm
            pedido={selecionado}
            onSalvar={salvarPedido}
            onCancelar={() => { setDialogPedido(false); setSelecionado(null); }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={dialogParecer} onOpenChange={setDialogParecer}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Parecer da Ação Social</DialogTitle>
          </DialogHeader>
          {selecionado && (
            <ParecerAcaoSocialForm
              pedido={selecionado}
              onSalvar={salvarParecer}
              onCancelar={() => { setDialogParecer(false); setSelecionado(null); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}