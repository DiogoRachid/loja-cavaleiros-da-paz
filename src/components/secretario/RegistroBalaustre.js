import { htmlSeguro, textoSimples } from "@/components/secretario/textoRico";

export default function RegistroBalaustre(secoes, { id, titulo, anterior, novo }) {
  const atual = secoes.find((item) => item.id === id);
  const normalizar = (texto) => textoSimples(texto).replace(/\s+/g, "");
  const htmlNovo = htmlSeguro(novo);
  let texto = htmlNovo;
  if (atual && textoSimples(atual.texto)) {
    const htmlAtual = htmlSeguro(atual.texto);
    const htmlAnterior = htmlSeguro(atual.registro_automatico ?? anterior);
    if (textoSimples(htmlAnterior) && htmlAtual.includes(htmlAnterior)) texto = htmlAtual.replace(htmlAnterior, htmlNovo);
    else if (normalizar(htmlAtual) !== normalizar(htmlAnterior) && !window.confirm(`A seção “${atual.titulo}” contém texto editado. Substituir esse texto pelo registro atualizado? Cancele para manter o texto e a seleção anteriores.`)) return null;
  }
  const atualizado = { ...(atual || { id, titulo }), texto, registro_automatico: htmlNovo };
  return atual ? secoes.map((item) => item.id === id ? atualizado : item) : [...secoes, atualizado];
}