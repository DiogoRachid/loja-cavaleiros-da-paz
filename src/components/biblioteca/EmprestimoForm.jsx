import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { format, addDays } from "date-fns";

export default function EmprestimoForm({ onSave, onCancel }) {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [itens, setItens] = useState([]);
  const [irmaos, setIrmaos] = useState([]);
  
  const [formData, setFormData] = useState({
    item_id: "",
    irmao_id: "",
    data_retirada: format(new Date(), "yyyy-MM-dd"),
    data_prevista_devolucao: format(addDays(new Date(), 30), "yyyy-MM-dd"),
    observacoes: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [itensData, irmaosData] = await Promise.all([
        base44.entities.Item.filter({ ativo: true }),
        base44.entities.Irmao.filter({ ativo: true })
      ]);
      setItens(itensData.filter(i => (i.quantidade_disponivel || 0) > 0));
      setIrmaos(irmaosData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const item = itens.find(i => i.id === formData.item_id);
      const irmao = irmaos.find(i => i.id === formData.irmao_id);

      // Criar empréstimo
      await base44.entities.Emprestimo.create({
        item_id: formData.item_id,
        item_nome: item.nome,
        irmao_id: formData.irmao_id,
        irmao_nome: irmao.nome_completo,
        irmao_email: irmao.email,
        data_retirada: formData.data_retirada,
        data_prevista_devolucao: formData.data_prevista_devolucao,
        status: "Ativo",
        tipo_operacao: "Manual",
        observacoes: formData.observacoes
      });

      // Atualizar quantidades do item
      await base44.entities.Item.update(item.id, {
        quantidade_disponivel: (item.quantidade_disponivel || 1) - 1,
        quantidade_emprestada: (item.quantidade_emprestada || 0) + 1
      });

      onSave();
    } catch (error) {
      console.error("Erro ao criar empréstimo:", error);
    }
    
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Item *</Label>
        <Select 
          value={formData.item_id} 
          onValueChange={(v) => setFormData(prev => ({ ...prev, item_id: v }))}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o item" />
          </SelectTrigger>
          <SelectContent>
            {itens.map(item => (
              <SelectItem key={item.id} value={item.id}>
                {item.nome} ({item.quantidade_disponivel} disponível)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Irmão *</Label>
        <Select 
          value={formData.irmao_id} 
          onValueChange={(v) => setFormData(prev => ({ ...prev, irmao_id: v }))}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o irmão" />
          </SelectTrigger>
          <SelectContent>
            {irmaos.map(irmao => (
              <SelectItem key={irmao.id} value={irmao.id}>
                {irmao.nome_completo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Data da Retirada</Label>
          <Input
            type="date"
            value={formData.data_retirada}
            onChange={(e) => setFormData(prev => ({ ...prev, data_retirada: e.target.value }))}
          />
        </div>

        <div>
          <Label>Previsão Devolução</Label>
          <Input
            type="date"
            value={formData.data_prevista_devolucao}
            onChange={(e) => setFormData(prev => ({ ...prev, data_prevista_devolucao: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label>Observações</Label>
        <Textarea
          value={formData.observacoes}
          onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
          placeholder="Observações sobre o empréstimo..."
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={saving || !formData.item_id || !formData.irmao_id} 
          className="bg-[#1B3A5F] hover:bg-[#15304d]"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Registrando...
            </>
          ) : (
            "Registrar Retirada"
          )}
        </Button>
      </div>
    </form>
  );
}