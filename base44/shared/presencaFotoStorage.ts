import { acessar, falha } from "./presencaFotoRepositorio.ts";
const BUCKET = "listas-presenca";
export function decodificarImagem(imagem) {
  if (typeof imagem !== "string" || imagem.length > 11000000 || !/^data:image\/(jpeg|png|webp);base64,/.test(imagem)) throw falha(400, "Envie uma foto JPG, PNG ou WebP com até 8 MB.");
  let bytes;
  try { bytes = Uint8Array.from(atob(imagem.split(",")[1]), (letra) => letra.charCodeAt(0)); }
  catch { throw falha(400, "Imagem inválida."); }
  const tipo = imagem.slice(5, imagem.indexOf(";"));
  const correto = tipo === "image/jpeg" ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 : tipo === "image/png" ? [137,80,78,71,13,10,26,10].every((v, i) => bytes[i] === v) : new TextDecoder().decode(bytes.slice(0,4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8,12)) === "WEBP";
  if (!correto || bytes.length < 20 || bytes.length > 8 * 1024 * 1024) throw falha(400, "O arquivo não é uma foto válida ou excede 8 MB.");
  return { bytes, tipo };
}
async function garantirPrivado() {
  let resposta = await acessar(`/storage/v1/bucket/${BUCKET}`);
  if (resposta.status === 404 || resposta.status === 400) {
    const criar = await acessar("/storage/v1/bucket", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: BUCKET, name: BUCKET, public: false, file_size_limit: 8388608, allowed_mime_types: ["image/jpeg", "image/png", "image/webp"] }) });
    if (!criar.ok && criar.status !== 409) throw falha(502, "Não foi possível preparar o armazenamento privado.");
    resposta = await acessar(`/storage/v1/bucket/${BUCKET}`);
  }
  if (!resposta.ok || (await resposta.json()).public !== false) throw falha(502, "As fotos exigem um espaço de armazenamento privado.");
}
export async function guardarImagem(caminho, bytes, tipo) {
  await garantirPrivado();
  const resposta = await acessar(`/storage/v1/object/${BUCKET}/${caminho}`, { method: "POST", headers: { "Content-Type": tipo, "x-upsert": "false" }, body: bytes });
  if (!resposta.ok) throw falha(502, "Não foi possível guardar a foto com segurança.");
}
export async function lerImagem(caminho) {
  const resposta = await acessar(`/storage/v1/object/authenticated/${BUCKET}/${caminho}`);
  if (!resposta.ok) throw falha(404, "Foto não encontrada.");
  const bytes = new Uint8Array(await resposta.arrayBuffer());
  let binario = "";
  for (let i = 0; i < bytes.length; i += 8192) binario += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return `data:${resposta.headers.get("content-type") || "image/jpeg"};base64,${btoa(binario)}`;
}
export async function apagarImagem(caminho) {
  await acessar(`/storage/v1/object/${BUCKET}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prefixes: [caminho] }) });
}