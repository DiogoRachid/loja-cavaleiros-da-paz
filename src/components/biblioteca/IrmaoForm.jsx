import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function IrmaoForm({ irmao, onSave, onCancel }) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: "",
    numero_glp: "",
    email: "",
    telefone: "",
    grau: "",
    data_iniciacao: "",
    observacoes: "",
    ativo: true
  });

  useEffect(() => {
    if (irmao) {
      setFormData({
        nome_completo: irmao.nome_completo || "",
        numero_glp: irmao.numero_glp || "",
        email: irmao.email || "",
        telefone: irmao.telefone || "",
        grau: irmao.grau || "",
        data_iniciacao: irmao.data_iniciacao || "",
        observacoes: irmao.observacoes || "",
        ativo: irmao.ativo !== false
      });
    }
  }, [irmao]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nome_completo">Nome Completo *</Label>
        <Input
          id="nome_completo"
          value={formData.nome_completo}
          onChange={(e) => handleChange("nome_completo", e.target.value)}
          placeholder="Nome completo do irmão"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="numero_glp">Número GLP</Label>
          <Input
            id="numero_glp"
            value={formData.numero_glp}
            onChange={(e) => handleChange("numero_glp", e.target.value)}
            placeholder="Ex: 12345"
          />
        </div>

        <div>
          <Label htmlFor="grau">Grau</Label>
          <Select value={formData.grau} onValueChange={(v) => handleChange("grau", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aprendiz">Aprendiz</SelectItem>
              <SelectItem value="Companheiro">Companheiro</SelectItem>
              <SelectItem value="Mestre">Mestre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="email@exemplo.com"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            value={formData.telefone}
            onChange={(e) => handleChange("telefone", e.target.value)}
            placeholder="(41) 99999-9999"
          />
        </div>

        <div>
          <Label htmlFor="data_iniciacao">Data de Iniciação</Label>
          <Input
            id="data_iniciacao"
            type="date"
            value={formData.data_iniciacao}
            onChange={(e) => handleChange("data_iniciacao", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => handleChange("observacoes", e.target.value)}
          placeholder="Observações adicionais..."
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving} className="bg-[#1B3A5F] hover:bg-[#15304d]">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar"
          )}
        </Button>
      </div>
    </form>
  );
}