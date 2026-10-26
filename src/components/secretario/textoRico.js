const MARCADOR = /^<!--loja-editor:v1;periodo=(antes|apos)-->\s*/;
const TAGS = new Set(["P", "DIV", "SPAN", "BR", "STRONG", "B", "EM", "I", "U", "S", "STRIKE", "H1", "H2", "H3", "OL", "UL", "LI", "BLOCKQUOTE", "A"]);
const BLOQUEADAS = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "SVG", "MATH", "TEMPLATE", "FORM", "INPUT", "IMG", "VIDEO", "AUDIO"]);
const CLASSE = /^ql-(?:align-(?:center|right|justify)|indent-[1-8]|size-(?:small|large|huge))$/;
const COR = /^(?:#[\da-f]{3,8}|rgba?\([\d.,%\s]+\)|hsla?\([\d.,%\s]+\)|[a-z]+)$/i;

export const escapeHtml = (texto = "") => String(texto).replace(/[&<>"']/g, (caractere) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[caractere]));

export function lerDocumento(conteudo = "") {
  const texto = String(conteudo || "");
  const meta = texto.match(MARCADOR);
  return { texto: texto.replace(MARCADOR, ""), aposPorDoSol: meta?.[1] === "apos" };
}

// Reconstrói apenas os elementos de formatação permitidos. Nenhum evento,
// imagem, script, estilo arbitrário ou URL executável chega à impressão/editor.
export function htmlSeguro(conteudo = "") {
  const { texto } = lerDocumento(conteudo);
  const temHtml = /<\/?(?:p|div|span|br|strong|b|em|i|u|s|strike|h[1-3]|ol|ul|li|blockquote|a|script|iframe|img|svg)(?:\s|\/?>)/i.test(texto);
  const entrada = temHtml ? texto : `<p>${escapeHtml(texto).replace(/\r?\n/g, "<br>")}</p>`;
  const origem = new DOMParser().parseFromString(entrada, "text/html");
  const destino = document.implementation.createHTMLDocument("");
  const copiar = (no, pai) => {
    if (no.nodeType === 3) { pai.append(destino.createTextNode(no.textContent)); return; }
    if (no.nodeType !== 1 || BLOQUEADAS.has(no.tagName)) return;
    if (!TAGS.has(no.tagName)) { Array.from(no.childNodes).forEach((filho) => copiar(filho, pai)); return; }
    const limpo = destino.createElement(no.tagName.toLowerCase());
    const classes = Array.from(no.classList).filter((classe) => CLASSE.test(classe));
    if (classes.length) limpo.className = classes.join(" ");
    for (const propriedade of ["color", "background-color"]) {
      const cor = no.style.getPropertyValue(propriedade).trim();
      if (COR.test(cor)) limpo.style.setProperty(propriedade, cor);
    }
    if (["center", "right", "justify"].includes(no.style.textAlign)) limpo.classList.add(`ql-align-${no.style.textAlign}`);
    if (no.tagName === "A" && /^(?:https?:\/\/|mailto:|tel:)/i.test(no.getAttribute("href") || "")) {
      limpo.setAttribute("href", no.getAttribute("href"));
      limpo.setAttribute("rel", "noopener noreferrer");
    }
    Array.from(no.childNodes).forEach((filho) => copiar(filho, limpo));
    pai.append(limpo);
  };
  Array.from(origem.body.childNodes).forEach((no) => copiar(no, destino.body));
  return destino.body.innerHTML;
}

export function textoSimples(conteudo) {
  return new DOMParser().parseFromString(htmlSeguro(conteudo), "text/html").body.textContent.trim();
}

export function salvarDocumento(conteudo, aposPorDoSol) {
  return `<!--loja-editor:v1;periodo=${aposPorDoSol ? "apos" : "antes"}-->${htmlSeguro(conteudo)}`;
}

export const ESTILOS_TEXTO_RICO = `
  .texto-rico { overflow-wrap: anywhere; white-space: normal; }
  .texto-rico p { margin: 0 0 .5em; }
  .texto-rico ol, .texto-rico ul { padding-left: 1.8em; }
  .texto-rico ol { list-style: decimal; } .texto-rico ul { list-style: disc; }
  .texto-rico .ql-align-center { text-align: center; }
  .texto-rico .ql-align-right { text-align: right; }
  .texto-rico .ql-align-justify { text-align: justify; }
  .texto-rico .ql-size-small { font-size: .75em; }
  .texto-rico .ql-size-large { font-size: 1.5em; }
  .texto-rico .ql-size-huge { font-size: 2.5em; }
  .texto-rico blockquote { border-left: 3px solid currentColor; padding-left: 1em; margin-left: 0; }
  .texto-rico h1 { font-size: 2em; } .texto-rico h2 { font-size: 1.5em; } .texto-rico h3 { font-size: 1.17em; }
  .texto-rico h1, .texto-rico h2, .texto-rico h3 { text-transform: none; letter-spacing: normal; text-align: inherit; color: inherit; margin: .6em 0; }
  ${Array.from({ length: 8 }, (_, i) => `.texto-rico .ql-indent-${i + 1} { padding-left: ${(i + 1) * 3}em; }`).join("\n")}
  @media print { .texto-rico { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
`;