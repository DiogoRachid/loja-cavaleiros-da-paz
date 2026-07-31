import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, BookOpen, User, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function DevolucaoForm({ emprestimo, onSave, onCancel }) {
  const [saving, setSaving] = useState(false);
  const [dataDevolucao, setDataDevolucao] = useState(format(new Date(), "yyyy-MM-dd"));
  const [observacoes, setObservacoes] = useState(emprestimo?.observacoes || "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Atualizar empréstimo
      await db.Emprestimo.update(emprestimo.id, {
        data_devolucao: dataDevolucao,
        status: "Devolvido",
        observacoes: observacoes
      });

      // Atualizar quantidades do item
      const item = await db.Item.filter({ id: emprestimo.item_id });
      if (item.length > 0) {
        await db.Item.update(item[0].id, {
          quantidade_disponivel: (item[0].quantidade_disponivel || 0) + 1,
          quantidade_emprestada: Math.max(0, (item[0].quantidade_emprestada || 1) - 1)
        });
      }

      onSave();
    } catch (error) {
      console.error("Erro ao registrar devolução:", error);
    }
    
    setSaving(false);
  };

  if (!emprestimo) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Info do Empréstimo */}
      <div className="p-4 bg-slate-50 rounded-xl space-y-3">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-slate-500" />
          <div>
            <p className="text-xs text-slate-500">Item</p>
            <p className="font-medium">{emprestimo.item_nome}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-slate-500" />
          <div>
            <p className="text-xs text-slate-500">Irmão</p>
            <p className="font-medium">{emprestimo.irmao_nome}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-slate-500" />
          <div>
            <p className="text-xs text-slate-500">Retirado em</p>
            <p className="font-medium">
              {emprestimo.data_retirada && format(parseISO(emprestimo.data_retirada), "dd/MM/yyyy")}
            </p>
          </div>
        </div>
      </div>

      <div>
        <Label>Data da Devolução</Label>
        <Input
          type="date"
          value={dataDevolucao}
          onChange={(e) => setDataDevolucao(e.target.value)}
        />
      </div>

      <div>
        <Label>Observações</Label>
        <Textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Observações sobre a devolução..."
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={saving} 
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Registrando...
            </>
          ) : (
            "Confirmar Devolução"
          )}
        </Button>
      </div>
    </form>
  );
}