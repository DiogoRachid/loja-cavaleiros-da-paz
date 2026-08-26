import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function BalaustreEditor({ secoes, onChange }) {
  const atualizar = (id, texto) => {
    onChange(secoes.map((s) => (s.id === id ? { ...s, texto } : s)));
  };

  return (
    <div className="space-y-3">
      {secoes.map((s, idx) => (
        <Card key={s.id}>
          <CardContent className="p-4 space-y-2">
            <p className="font-semibold text-sm text-[#1B3A5F]">
              {idx + 1}. {s.titulo}
            </p>
            <Textarea
              value={s.texto}
              onChange={(e) => atualizar(s.id, e.target.value)}
              rows={s.texto.split("\n").length > 3 ? 6 : 3}
              placeholder="Escreva aqui..."
              className="text-sm"
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}