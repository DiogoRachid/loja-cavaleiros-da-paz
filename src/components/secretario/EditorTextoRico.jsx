import { useEffect, useMemo, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "@/components/secretario/editor-secretaria.css";
import { htmlSeguro } from "@/components/secretario/textoRico";

const modules = { toolbar: [
  [{ header: [1, 2, 3, false] }, { size: ["small", false, "large", "huge"] }],
  ["bold", "italic", "underline", "strike"], [{ color: [] }, { background: [] }],
  [{ align: [] }], [{ list: "ordered" }, { list: "bullet" }], [{ indent: "-1" }, { indent: "+1" }], ["blockquote", "clean"],
] };
const formats = ["header", "size", "bold", "italic", "underline", "strike", "color", "background", "align", "list", "bullet", "indent", "blockquote"];
const labels = { header: "Estilo do parágrafo", size: "Tamanho do texto", bold: "Negrito", italic: "Itálico", underline: "Sublinhado", strike: "Tachado", color: "Cor do texto", background: "Cor de destaque", align: "Alinhamento", list: "Lista", indent: "Recuo", blockquote: "Citação", clean: "Limpar formatação" };

export default function EditorTextoRico({ value, onChange, label = "Conteúdo", placeholder = "Escreva aqui..." }) {
  const root = useRef(null);
  const html = useMemo(() => htmlSeguro(value), [value]);
  useEffect(() => {
    const editor = root.current.querySelector(".ql-editor");
    editor?.setAttribute("aria-label", label);
    editor?.setAttribute("role", "textbox");
    editor?.setAttribute("aria-multiline", "true");
    Object.entries(labels).forEach(([name, title]) => {
      root.current.querySelectorAll(`.ql-toolbar .ql-${name}`).forEach((control) => {
        const accessible = name === "list" ? (control.value === "ordered" ? "Lista numerada" : "Lista com marcadores") : name === "indent" ? (control.value === "+1" ? "Aumentar recuo" : "Diminuir recuo") : title;
        control.setAttribute("title", accessible);
        control.setAttribute("aria-label", accessible);
      });
    });
  }, [label]);
  return <div ref={root} className="secretaria-editor min-w-0">
    <ReactQuill theme="snow" value={html} onChange={onChange} modules={modules} formats={formats} placeholder={placeholder} />
  </div>;
}