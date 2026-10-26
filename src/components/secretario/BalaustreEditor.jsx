import { Card, CardContent } from "@/components/ui/card";
import EditorTextoRico from "@/components/secretario/EditorTextoRico";
import SecaoBalaustreControles from "@/components/secretario/SecaoBalaustreControles";
import QuebraPaginaBalaustre from "@/components/secretario/QuebraPaginaBalaustre";
import { Button } from "@/components/ui/button";
import { textoSimples } from "@/components/secretario/textoRico";

export default function BalaustreEditor({ secoes, onChange }) {
  const atualizar = (id, texto) => {
    onChange(secoes.map((s) => (s.id === id ? { ...s, texto } : s)));
  };

  const mover = (indice, deslocamento) => {
    const copia = [...secoes];
    [copia[indice], copia[indice + deslocamento]] = [copia[indice + deslocamento], copia[indice]];
    onChange(copia);
  };
  const remover = (secao) => {
    if (textoSimples(secao.texto) && !window.confirm(`Excluir a seção “${secao.titulo}” e seu texto?`)) return;
    onChange(secoes.filter((item) => item.id !== secao.id));
  };
  return (
    <div className="space-y-3">
      {secoes.map((s, idx) => (
        <Card key={s.id}>
          <CardContent className="p-4 space-y-2">
            <SecaoBalaustreControles secao={s} indice={idx} total={secoes.length} onTitulo={(titulo) => onChange(secoes.map((item) => item.id === s.id ? { ...item, titulo } : item))} onMover={(deslocamento) => mover(idx, deslocamento)} onRemover={() => remover(s)} onDuplicar={() => { const copia = [...secoes]; copia.splice(idx + 1, 0, { ...s, id: `secao-${crypto.randomUUID()}`, titulo: `${s.titulo} (cópia)` }); onChange(copia); }} />
            <EditorTextoRico
              value={s.texto || ""}
              mencoes
              placeholder="Escreva aqui... Digite @ para inserir o nome de um irmão cadastrado."
              onChange={(texto) => atualizar(s.id, texto)}
              label={`${idx + 1}. ${s.titulo}`}
            />
            <QuebraPaginaBalaustre ativa={s.novaPagina} onChange={(novaPagina) => onChange(secoes.map((item) => item.id === s.id ? { ...item, novaPagina } : item))} />
          </CardContent>
        </Card>
      ))}
      <Button type="button" variant="outline" onClick={() => onChange([...secoes, { id: `secao-${crypto.randomUUID()}`, titulo: "Nova seção", texto: "" }])}>Adicionar seção</Button>
    </div>
  );
}