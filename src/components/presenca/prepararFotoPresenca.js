export default async function prepararFotoPresenca(arquivo) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type) || arquivo.size > 20 * 1024 * 1024) throw new Error("Selecione uma foto JPG, PNG ou WebP de até 20 MB.");
  const bitmap = await window.createImageBitmap(arquivo);
  const escala = Math.min(1, 2800 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * escala));
  canvas.height = Math.max(1, Math.round(bitmap.height * escala));
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const imagem = canvas.toDataURL("image/jpeg", 0.94);
  if (imagem.length > 11000000) throw new Error("A foto ficou muito grande. Fotografe uma página por vez.");
  return imagem;
}