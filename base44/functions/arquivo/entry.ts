import { secrets } from "base44:runtime";
import { BUCKET } from "../../shared/storage.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Range",
  "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges",
};

const REPASSAR = ["content-type", "content-length", "content-range", "accept-ranges", "etag", "last-modified"];

// Entrega um arquivo do Storage do Supabase externo por um link do próprio app (endereço mascarado).
export default async function(req: Request): Promise<Response> {
  try {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

    const f = new URL(req.url).searchParams.get("f") || "";
    if (!f || f.includes("..") || f.startsWith("/")) {
      return Response.json({ error: "Arquivo inválido" }, { status: 400, headers: CORS });
    }

    const base = (secrets.get("SUPABASE2_URL") || "").replace(/\/$/, "");
    const caminho = f.split("/").map((p) => encodeURIComponent(p)).join("/");
    const headers: Record<string, string> = {};
    const range = req.headers.get("range");
    if (range) headers.Range = range;

    const resp = await fetch(`${base}/storage/v1/object/public/${BUCKET}/${caminho}`, {
      headers,
      signal: AbortSignal.timeout(280000),
    });
    if (!resp.ok && resp.status !== 206) {
      return Response.json({ error: "Arquivo não encontrado" }, { status: 404, headers: CORS });
    }

    const saida = new Headers(CORS);
    for (const h of REPASSAR) {
      const v = resp.headers.get(h);
      if (v) saida.set(h, v);
    }
    const nome = (f.split("/").pop() || "arquivo").replace(/^\d+_[a-z0-9]{6}_/, "").replace(/"/g, "");
    saida.set("Content-Disposition", `inline; filename="${nome}"`);
    saida.set("Cache-Control", "public, max-age=86400");

    return new Response(resp.body, { status: resp.status, headers: saida });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: CORS });
  }
}