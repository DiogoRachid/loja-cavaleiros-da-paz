import { Card, CardContent } from "@/components/ui/card";
import EditorTextoRico from "@/components/secretario/EditorTextoRico";

export default function BalaustreEditor({ secoes, onChange }) {
  const atualizar = (id, texto) => {
    onChange(secoes.map((s) => (s.id === id ? { ...s, texto } : s)));
  };

  return (
    <div className="space-y-3">
      {secoes.map((s, idx) => (
        <Card key={s.id}>
          <CardContent className="p-4 space-y-2">
            <p className="font-semibold text-sm text-lodge-navy">
              {idx + 1}. {s.titulo}
            </p>
            <EditorTextoRico
              value={s.texto || ""}
              mencoes
              placeholder="Escreva aqui... Digite @ para inserir o nome de um irmão cadastrado."
              onChange={(texto) => atualizar(s.id, texto)}
              label={`${idx + 1}. ${s.titulo}`}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}