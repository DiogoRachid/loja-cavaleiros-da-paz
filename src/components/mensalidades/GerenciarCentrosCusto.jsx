import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X, Save, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function GerenciarCentrosCusto({ centros, onAtualizar }) {
  const [showForm, setShowForm] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [saving, setSaving] = useState(false);

  const criar = async () => {
    if (!novoNome.trim()) return;
    setSaving(true);
    await base44.entities.CentroCusto.create({
      nome: novoNome.trim(),
      ativo: true,
      ordem: centros.length + 1,
    });
    setNovoNome("");
    setShowForm(false);
    setSaving(false);
    onAtualizar();
  };

  const toggleAtivo = async (c) => {
    await base44.entities.CentroCusto.update(c.id, { ativo: !c.ativo });
    onAtualizar();
  };

  const excluir = async (id) => {
    await base44.entities.CentroCusto.delete(id);
    onAtualizar();
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-[#1B3A5F] text-base flex items-center gap-2">
          <Settings className="w-4 h-4" /> Centros de Custo
        </CardTitle>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)} className="border-[#1B3A5F] text-[#1B3A5F]">
          <Plus className="w-3 h-3 mr-1" /> Novo
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <div className="flex gap-2">
            <Input
              value={novoNome}
              onChange={e => setNovoNome(e.target.value)}
              placeholder="Ex: Bebidas, Marmitas..."
              onKeyDown={e => e.key === "Enter" && criar()}
              autoFocus
            />
            <Button onClick={criar} disabled={saving} size="sm" className="bg-[#1B3A5F] text-white">
              <Save className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X className="w-3 h-3" /></Button>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {centros.map(c => (
            <div key={c.id} className="flex items-center gap-1 bg-slate-100 rounded-full px-3 py-1">
              <button onClick={() => toggleAtivo(c)}>
                <Badge className={c.ativo ? "bg-[#1B3A5F] text-white text-xs" : "bg-slate-300 text-slate-500 text-xs"}>
                  {c.nome}
                </Badge>
              </button>
              <button onClick={() => excluir(c.id)} className="text-red-400 hover:text-red-600 ml-1">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {centros.length === 0 && <p className="text-slate-400 text-sm">Nenhum centro de custo cadastrado.</p>}
        </div>
      </CardContent>
    </Card>
  );
}