import { useState, useEffect } from "react";
import { db } from "@/api/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Award } from "lucide-react";

const VAZIO = { cargo: "", exercicio: "", data_inicio: "", data_fim: "", observacoes: "" };

const fmt = (d) => (d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "—");

export default function MovimentacaoMaconica({ irmao, cargosSugeridos = [] }) {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregar();
  }, [irmao.id]);

  const carregar = async () => {
    const dados = await db.CargoExercido.filter({ irmao_id: irmao.id }, "-data_inicio", 200);
    setLista(dados || []);
  };

  const adicionar = async () => {
    if (!form.cargo) return;
    setSalvando(true);
    await db.CargoExercido.create({
      irmao_id: irmao.id,
      irmao_nome: irmao.nome_completo,
      cargo: form.cargo,
      exercicio: form.exercicio || null,
      data_inicio: form.data_inicio || null,
      data_fim: form.data_fim || null,
      observacoes: form.observacoes || null,
    });
    setForm(VAZIO);
    await carregar();
    setSalvando(false);
  };

  const excluir = async (id) => {
    await db.CargoExercido.delete(id);
    await carregar();
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#C9A227]" />
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
            Movimentação Maçônica — Cargos Exercidos
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-3 items-end">
          <div className="space-y-1 md:col-span-2">
            <Label>Cargo</Label>
            <Input
              list="cargos-movimentacao"
              value={form.cargo}
              onChange={(e) => setForm({ ...form, cargo: e.target.value })}
              placeholder="Cargo exercido"
            />
            <datalist id="cargos-movimentacao">
              {cargosSugeridos.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div className="space-y-1">
            <Label>Exercício</Label>
            <Input value={form.exercicio} onChange={(e) => setForm({ ...form, exercicio: e.target.value })} placeholder="2025/2026" />
          </div>
          <div className="space-y-1">
            <Label>Início</Label>
            <Input type="date" value={form.data_inicio} onChange={(e) => setForm({ ...form, data_inicio: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Término</Label>
            <Input type="date" value={form.data_fim} onChange={(e) => setForm({ ...form, data_fim: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3 items-end">
          <div className="space-y-1 flex-1">
            <Label>Observações</Label>
            <Input value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
          </div>
          <Button onClick={adicionar} disabled={salvando || !form.cargo} className="bg-[#1B3A5F] text-white">
            <Plus className="w-4 h-4 mr-2" /> Adicionar
          </Button>
        </div>

        {lista.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum cargo registrado para este irmão.</p>
        ) : (
          <div className="space-y-2">
            {lista.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {c.cargo}{c.exercicio ? ` — Exercício ${c.exercicio}` : ""}
                  </p>
                  <p className="text-xs text-slate-500">
                    {fmt(c.data_inicio)} a {fmt(c.data_fim)}{c.observacoes ? ` • ${c.observacoes}` : ""}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => excluir(c.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}