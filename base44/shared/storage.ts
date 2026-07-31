// Helpers de Storage do Supabase (via API REST) usados na migração de arquivos.

export const BUCKET = "arquivos";
// Limite de tamanho por arquivo no bucket (500 MB)
export const LIMITE_BYTES = 524288000;

function config() {
  const url = Deno.env.get("SUPABASE2_URL");
  const key = Deno.env.get("SUPABASE2_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("SUPABASE2_URL / SUPABASE2_SERVICE_ROLE_KEY não configurados");
  return { url: url.replace(/\/$/, ""), key };
}

export async function garantirBucket() {
  const { url, key } = config();
  const res = await fetch(url + "/storage/v1/bucket", {
    method: "POST",
    headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json" },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });
  if (res.ok) return { criado: true };
  const texto = await res.text();
  if (res.status === 409 || texto.includes("already exists") || texto.includes("Duplicate")) {
    return { criado: false };
  }
  throw new Error("Erro ao criar bucket: " + texto);
}

// Baixa um arquivo de uma URL pública e envia para o Storage do Supabase.
// Retorna { publicUrl, bytes }.
export async function migrarArquivo(origemUrl: string, caminho: string) {
  const { url, key } = config();

  const download = await fetch(origemUrl);
  if (!download.ok) throw new Error("Falha ao baixar (" + download.status + "): " + origemUrl);
  const contentType = download.headers.get("content-type") || "application/octet-stream";
  const tamanho = Number(download.headers.get("content-length") || 0);

  // Arquivos grandes são repassados em streaming para não estourar a memória
  if (tamanho > 40 * 1024 * 1024) {
    const uploadStream = await fetch(url + "/storage/v1/object/" + BUCKET + "/" + caminho, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: "Bearer " + key,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body: download.body,
    });
    if (!uploadStream.ok) throw new Error("Falha no upload: " + (await uploadStream.text()));
    return {
      publicUrl: url + "/storage/v1/object/public/" + BUCKET + "/" + caminho,
      bytes: tamanho,
    };
  }

  const bytes = new Uint8Array(await download.arrayBuffer());

  const upload = await fetch(url + "/storage/v1/object/" + BUCKET + "/" + caminho, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: "Bearer " + key,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: bytes,
  });
  if (!upload.ok) throw new Error("Falha no upload: " + (await upload.text()));

  return {
    publicUrl: url + "/storage/v1/object/public/" + BUCKET + "/" + caminho,
    bytes: bytes.length,
  };
}

// Nome de arquivo seguro para o Storage.
export function nomeSeguro(origemUrl: string, id: string) {
  const base = origemUrl.split("?")[0].split("/").pop() || "arquivo";
  const limpo = base.replace(/[^a-zA-Z0-9._-]/g, "_");
  return id + "_" + limpo;
}