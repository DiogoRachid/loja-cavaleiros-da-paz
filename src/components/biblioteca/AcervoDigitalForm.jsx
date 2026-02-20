import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
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
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, FileText, Check } from "lucide-react";

export default function AcervoDigitalForm({ documento, onSave, onCancel }) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    autor: "",
    tipo: "Livro",
    descricao: "",
    data_publicacao: "",
    grau_minimo: "Aprendiz",
    arquivo_url: "",
    capa_url: "",
    ativo: true,
    disponivel: true
  });

  useEffect(() => {
    if (documento) {
      setFormData({
        titulo: documento.titulo || "",
        autor: documento.autor || "",
        tipo: documento.tipo || "Livro",
        descricao: documento.descricao || "",
        data_publicacao: documento.data_publicacao || "",
        grau_minimo: documento.grau_minimo || "Aprendiz",
        arquivo_url: documento.arquivo_url || "",
        capa_url: documento.capa_url || "",
        ativo: documento.ativo !== false,
        disponivel: documento.disponivel !== false
      });
    }
  }, [documento]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange(field, file_url);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="titulo">Título *</Label>
        <Input
          id="titulo"
          value={formData.titulo}
          onChange={(e) => handleChange("titulo", e.target.value)}
          placeholder="Título do documento"
          required
        />
      </div>

      <div>
        <Label htmlFor="autor">Autor</Label>
        <Input
          id="autor"
          value={formData.autor}
          onChange={(e) => handleChange("autor", e.target.value)}
          placeholder="Nome do autor"
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo *</Label>
          <Select value={formData.tipo} onValueChange={(v) => handleChange("tipo", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Livro">Livro</SelectItem>
              <SelectItem value="Trabalho">Trabalho</SelectItem>
              <SelectItem value="Artigo">Artigo</SelectItem>
              <SelectItem value="Instrução">Instrução</SelectItem>
              <SelectItem value="Ritual">Ritual</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Grau Mínimo *</Label>
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
      </div>

      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => handleChange("descricao", e.target.value)}
          placeholder="Resumo ou descrição do documento..."
          rows={3}
        />
      </div>

      {/* Upload PDF */}
      <div>
        <Label>Arquivo PDF *</Label>
        <div className="mt-2">
          {formData.arquivo_url ? (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <Check className="w-5 h-5 text-emerald-600" />
              <span className="text-sm text-emerald-700 flex-1">PDF carregado</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => window.open(formData.arquivo_url, '_blank')}
              >
                Ver
              </Button>
              <label className="cursor-pointer">
                <span className="text-sm text-[#1B3A5F] hover:underline">Trocar</span>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "arquivo_url")}
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
                  <span className="text-sm text-slate-500">Clique para fazer upload do PDF</span>
                </>
              )}
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => handleFileUpload(e, "arquivo_url")}
                disabled={uploading}
              />
            </label>
          )}
        </div>
      </div>

      {/* Upload Capa (opcional) */}
      <div>
        <Label>Imagem de Capa (opcional)</Label>
        <div className="mt-2">
          {formData.capa_url ? (
            <div className="flex items-center gap-3">
              <img src={formData.capa_url} alt="" className="w-16 h-20 object-cover rounded" />
              <label className="cursor-pointer text-sm text-[#1B3A5F] hover:underline">
                Trocar imagem
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "capa_url")}
                />
              </label>
            </div>
          ) : (
            <label className="flex items-center gap-2 p-3 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-[#1B3A5F] hover:bg-slate-50">
              <FileText className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-500">Adicionar capa</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, "capa_url")}
              />
            </label>
          )}
        </div>
      </div>

      {/* Switches de Status */}
      <div className="space-y-3 p-3 bg-slate-50 rounded-lg">
        <div className="flex items-center justify-between">
          <Label className="text-slate-700">Documento Ativo</Label>
          <Switch
            checked={formData.ativo}
            onCheckedChange={(v) => handleChange("ativo", v)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-slate-700">Disponível para Irmãos</Label>
          <Switch
            checked={formData.disponivel}
            onCheckedChange={(v) => handleChange("disponivel", v)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={saving || !formData.titulo || !formData.arquivo_url}
          className="bg-[#1B3A5F] hover:bg-[#15304d]"
        >
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