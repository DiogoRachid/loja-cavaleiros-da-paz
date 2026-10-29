const DOMINIO_ARQUIVOS = window.location.origin;
const DOMINIOS_ARQUIVOS = [
  DOMINIO_ARQUIVOS,
  "https://loja-cavaleiros-da-paz.vercel.app",
  "https://loja-cavaleiros-da-paz.base44.app",
];
const ROTA_ARQUIVO = "/functions/arquivo";

export function mascararLinkArquivo(valor) {
  if (typeof valor !== "string" || !/^https?:\/\//i.test(valor)) return valor;
  let url;
  try { url = new URL(valor); } catch { return valor; }
  const storage = url.pathname.match(/^\/storage\/v1\/object\/(?:public|sign|authenticated)\/arquivos\/(.+)$/);
  let caminho;
  if (storage) {
    caminho = decodeURIComponent(storage[1]);
  } else if (DOMINIOS_ARQUIVOS.includes(url.origin) && url.pathname === ROTA_ARQUIVO) {
    caminho = url.searchParams.get("f");
  } else {
    return valor;
  }
  if (!caminho || caminho.includes("..") || caminho.startsWith("/")) throw new Error("Link do arquivo inválido.");
  // O navegador abre o proxy que entrega os bytes, nunca o Storage de origem.
  return `${DOMINIO_ARQUIVOS}${ROTA_ARQUIVO}?f=${encodeURIComponent(caminho)}`;
}

export default function mascararLinksArquivos(dados) {
  if (Array.isArray(dados)) return dados.map(mascararLinksArquivos);
  if (dados && typeof dados === "object") {
    return Object.fromEntries(Object.entries(dados).map(([campo, valor]) => [campo, mascararLinksArquivos(valor)]));
  }
  return typeof dados === "string" ? mascararLinkArquivo(dados) : dados;
}
