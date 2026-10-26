import { useEffect, useState } from "react";
import SugestoesIrmaos from "@/components/secretario/SugestoesIrmaos";

export default function MencoesEditor({ editorRef, alvoRef }) {
  const [mencao, setMencao] = useState(null);
  useEffect(() => {
    const editor = editorRef.current?.getEditor();
    if (!editor) return;
    let montado = true;
    const atualizar = () => {
      if (!montado) return;
      const cursor = editor.getSelection();
      if (!cursor || cursor.length) { setMencao(null); return; }
      const inicio = Math.max(0, cursor.index - 100);
      const texto = editor.getText(inicio, cursor.index - inicio);
      const achado = texto.match(/(?:^|[\s(])@([\p{L}\p{N} .'-]{0,80})$/u);
      setMencao(achado ? { busca: achado[1], inicio: cursor.index - achado[1].length - 1, fim: cursor.index } : null);
    };
    const digitou = () => queueMicrotask(atualizar);
    editor.on("text-change", digitou);
    editor.on("selection-change", atualizar);
    return () => { montado = false; editor.off("text-change", digitou); editor.off("selection-change", atualizar); };
  }, [editorRef]);
  const selecionar = (irmao) => {
    const editor = editorRef.current.getEditor();
    const texto = `Ir∴ ${irmao.nome_completo} `;
    editor.history.cutoff();
    editor.updateContents({ ops: [{ retain: mencao.inicio }, { delete: mencao.fim - mencao.inicio }, { insert: texto }] }, "user");
    editor.setSelection(mencao.inicio + texto.length, 0, "silent");
    editor.history.cutoff();
    setMencao(null);
  };
  return mencao ? <SugestoesIrmaos busca={mencao.busca} alvoRef={alvoRef} onSelect={selecionar} onClose={() => setMencao(null)} /> : null;
}