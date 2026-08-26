import { useState, useEffect } from "react";
import { db } from "@/api/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Scroll, Save } from "lucide-react";

const VAZIO = { tipo: "Pessoa", nome: "", parentesco: "", documento: "", contato: "", percentual: "", observacoes: "" };

export default function TestamentoIrmao({ irmao }) {
  const [desejo, setDesejo] = useState(irmao.testamento_desejo || "");
  const [dataTestamento, setDataTestamento] = useState(irmao.testamento_data || "");
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregar();
  }, [irmao.id]);

  const carregar = async () => {
    const dados = await db.BeneficiarioMutua.filter({ irmao_id: irmao.id }, "-created_date", 100);
    setBeneficiarios(dados || []);
  };

  const salvarDesejo = async () => {
    setSalvando(true);
    await db.Irmao.update(irmao.id, {
      testamento_desejo: desejo,
      testamento_data: dataTestamento || null,
    });
    setSalvando(false);
  };

  const adicionar = async () => {
    if (!form.nome) return;
    await db.BeneficiarioMutua.create({
      irmao_id: irmao.id,
      ...form,
      percentual: form.percentual === "" ? null : parseFloat(String(form.percentual).replace(",", ".")),
    });
    setForm(VAZIO);
    await carregar();
  };

  const excluir = async (id) => {
    await db.BeneficiarioMutua.delete(id);
    await carregar();
  };

  const totalPct = beneficiarios.reduce((a, b) => a + (b.percentual || 0), 0);

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Scroll className="w-4 h-4 text-[#C9A227]" />
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
            Testamento Maçônico — Destinação da Mútua
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-3">
          <div className="space-y-1 md:col-span-3">
            <Label>Desejo do irmão quanto à destinação da mútua</Label>
            <Textarea rows={4} value={desejo} onChange={(e) => setDesejo(e.target.value)} placeholder="Declaração de vontade do irmão sobre a destinação do valor da mútua após seu falecimento..." />
          </div>
          <div className="space-y-1">
            <Label>Data da declaração</Label>
            <Input type="date" value={dataTestamento} onChange={(e) => setDataTestamento(e.target.value)} />
            <Button onClick={salvarDesejo} disabled={salvando} className="w-full mt-2 bg-[#1B3A5F] text-white">
              <Save className="w-4 h-4 mr-2" />{salvando ? "Salvando..." : "Salvar declaração"}
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-6 gap-3 items-end pt-2 border-t">
          <div className="space-y-1">
            <Label>Tipo</Label>
            <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Pessoa", "Entidade", "Outro"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Nome</Label>
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Pessoa ou entidade" />
          </div>
          <div className="space-y-1">
            <Label>Parentesco / vínculo</Label>
            <Input value={form.parentesco} onChange={(e) => setForm({ ...form, parentesco: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>CPF / CNPJ</Label>
            <Input value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Percentual (%)</Label>
            <Input value={form.percentual} onChange={(e) => setForm({ ...form, percentual: e.target.value })} placeholder="0" />
          </div>
        </div>
        <div className="flex gap-3 items-end">
          <div className="space-y-1 flex-1">
            <Label>Contato / endereço</Label>
            <Input value={form.contato} onChange={(e) => setForm({ ...form, contato: e.target.value })} />
          </div>
          <div className="space-y-1 flex-1">
            <Label>Observações</Label>
            <Input value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
          </div>
          <Button onClick={adicionar} disabled={!form.nome} className="bg-[#1B3A5F] text-white">
            <Plus className="w-4 h-4 mr-2" /> Incluir beneficiário
          </Button>
        </div>

        {beneficiarios.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum beneficiário indicado.</p>
        ) : (
          <div className="space-y-2">
            {beneficiarios.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {b.nome} <span className="text-xs text-slate-500">({b.tipo})</span>
                    {b.percentual != null ? ` — ${b.percentual}%` : ""}
                  </p>
                  <p className="text-xs text-slate-500">
                    {[b.parentesco, b.documento, b.contato, b.observacoes].filter(Boolean).join(" • ") || "—"}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => excluir(b.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <p className={`text-xs ${totalPct === 100 ? "text-emerald-600" : "text-amber-600"}`}>
              Total distribuído: {totalPct}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}