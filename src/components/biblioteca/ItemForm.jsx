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

export default function ItemForm({ item, onSave, onCancel }) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "Livro",
    autor: "",
    descricao: "",
    grau_minimo: "Aprendiz",
    quantidade_total: 1,
    quantidade_disponivel: 1,
    quantidade_emprestada: 0,
    localizacao: "",
    imagem_capa: "",
    ativo: true
  });

  useEffect(() => {
    if (item) {
      setFormData({
        nome: item.nome || "",
        tipo: item.tipo || "Livro",
        autor: item.autor || "",
        descricao: item.descricao || "",
        grau_minimo: item.grau_minimo || "Aprendiz",
        quantidade_total: item.quantidade_total || 1,
        quantidade_disponivel: item.quantidade_disponivel || 1,
        quantidade_emprestada: item.quantidade_emprestada || 0,
        localizacao: item.localizacao || "",
        imagem_capa: item.imagem_capa || "",
        ativo: item.ativo !== false
      });
    }
  }, [item]);

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label htmlFor="nome">Nome do Item *</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => handleChange("nome", e.target.value)}
            placeholder="Ex: A Arte Real"
            required
          />
        </div>

        <div>
          <Label htmlFor="tipo">Tipo *</Label>
          <Select value={formData.tipo} onValueChange={(v) => handleChange("tipo", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Livro">Livro</SelectItem>
              <SelectItem value="Revista">Revista</SelectItem>
              <SelectItem value="Periódico">Periódico</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="autor">Autor / Editora</Label>
          <Input
            id="autor"
            value={formData.autor}
            onChange={(e) => handleChange("autor", e.target.value)}
            placeholder="Ex: José da Silva"
          />
        </div>

        <div>
          <Label>Grau Mínimo</Label>
          <Select value={formData.grau_minimo} onValueChange={(v) => handleChange("grau_minimo", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aprendiz">Aprendiz</SelectItem>
              <SelectItem value="Companheiro">Companheiro</SelectItem>
              <SelectItem value="Mestre">Mestre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="quantidade_total">Quantidade Total</Label>
          <Input
            id="quantidade_total"
            type="number"
            min="1"
            value={formData.quantidade_total}
            onChange={(e) => {
              const total = parseInt(e.target.value) || 1;
              const emprestada = formData.quantidade_emprestada || 0;
              handleChange("quantidade_total", total);
              handleChange("quantidade_disponivel", Math.max(0, total - emprestada));
            }}
          />
        </div>

        <div>
          <Label htmlFor="localizacao">Localização</Label>
          <Input
            id="localizacao"
            value={formData.localizacao}
            onChange={(e) => handleChange("localizacao", e.target.value)}
            placeholder="Ex: Estante A, Prateleira 2"
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="descricao">Descrição / Observações</Label>
          <Textarea
            id="descricao"
            value={formData.descricao}
            onChange={(e) => handleChange("descricao", e.target.value)}
            placeholder="Informações adicionais sobre o item..."
            rows={3}
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="imagem_capa">URL da Imagem da Capa</Label>
          <Input
            id="imagem_capa"
            value={formData.imagem_capa}
            onChange={(e) => handleChange("imagem_capa", e.target.value)}
            placeholder="https://..."
          />
        </div>
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