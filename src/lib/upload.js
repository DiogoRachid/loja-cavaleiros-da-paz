import { base44 } from "@/api/base44Client";

// Envia um arquivo direto para o Storage do Supabase 2 e devolve { file_url }.
export async function uploadFile({ file }) {
  const res = await base44.functions.invoke("uploadAssinado", { nome: file.name || "arquivo" });
  const { upload_url, file_url, error } = res.data || {};
  if (error || !upload_url) throw new Error(error || "Falha ao preparar upload");

  const envio = await fetch(upload_url, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream", "x-upsert": "true" },
    body: file,
  });
  if (!envio.ok) throw new Error("Falha no upload: " + (await envio.text()));

  return { file_url };
}

export default uploadFile;