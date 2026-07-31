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
import { Loader2, Upload, Check, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ItemForm({ item, onSave, onCancel }) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "Livro",
    autor: "",
    descricao: "",
    data_publicacao: "",
    grau_minimo: "Aprendiz",
    quantidade_total: 1,
    quantidade_disponivel: 1,
    quantidade_emprestada: 0,
    localizacao: "",
    imagem_capa: "",
    isbn: "",
    ativo: true
  });

  useEffect(() => {
    if (item) {
      setFormData({
        nome: item.nome || "",
        tipo: item.tipo || "Livro",
        autor: item.autor || "",
        descricao: item.descricao || "",
        data_publicacao: item.data_publicacao || "",
        grau_minimo: item.grau_minimo || "Aprendiz",
        quantidade_total: item.quantidade_total || 1,
        quantidade_disponivel: item.quantidade_disponivel || 1,
        quantidade_emprestada: item.quantidade_emprestada || 0,
        localizacao: item.localizacao || "",
        imagem_capa: item.imagem_capa || "",
        isbn: item.isbn || "",
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange("imagem_capa", file_url);
    } catch (error) {
      console.error("Erro no upload:", error);
    }
    setUploading(false);
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
          <Label htmlFor="data_publicacao">Data de Publicação</Label>
          <Input
            id="data_publicacao"
            type="date"
            value={formData.data_publicacao}
            onChange={(e) => handleChange("data_publicacao", e.target.value)}
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

        <div>
          <Label htmlFor="isbn">ISBN</Label>
          <Input
            id="isbn"
            value={formData.isbn}
            onChange={(e) => handleChange("isbn", e.target.value)}
            placeholder="Ex: 9786580921058"
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
          <Label>Imagem da Capa</Label>
          <div className="mt-2">
            {formData.imagem_capa ? (
              <div className="flex items-center gap-3">
                <img src={formData.imagem_capa} alt="" className="w-16 h-20 object-cover rounded" />
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-emerald-700">Imagem carregada</span>
                </div>
                <label className="cursor-pointer text-sm text-[#1B3A5F] hover:underline ml-auto">
                  Trocar
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-[#1B3A5F] hover:bg-slate-50 transition-colors">
                {uploading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-[#1B3A5F]" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-500">Clique para fazer upload da capa</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
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