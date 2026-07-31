import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import {
  TABELAS, origem, destino, contar, buscarPagina, gravar,
  garantirBucket, copiarArquivo, nomeSeguro, atualizarCampo,
} from "../../shared/migracao2.ts";

const CAMPOS_ARQUIVO = [
  { tabela: "minha_mp3", campo: "file_url" },
  { tabela: "acervo_digital", campo: "arquivo_url" },
  { tabela: "acervo_digital", campo: "capa_url" },
  { tabela: "irmao", campo: "foto_url" },
  { tabela: "dados_loja", campo: "logo_url" },
];

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const acao = body.acao || "verificar";
    const org = origem();
    const dst = destino();

    // ---------- VERIFICAR: compara contagens dos dois bancos ----------
    if (acao === "verificar") {
      const linhas = [];
      let totalOrigem = 0, totalDestino = 0, pendentes = 0;
      for (const t of TABELAS) {
        const o = await contar(org, t);
        const d = await contar(dst, t);
        totalOrigem += o; totalDestino += d;
        if (o !== d) pendentes++;
        linhas.push({ tabela: t, origem: o, destino: d, ok: o === d });
      }
      const arquivos = [];
      for (const { tabela, campo } of CAMPOS_ARQUIVO) {
        const res = await fetch(dst.url + "/rest/v1/" + tabela + "?select=id," + campo, {
          headers: { apikey: dst.key, Authorization: "Bearer " + dst.key },
        });
        const rows = res.ok ? await res.json() : [];
        const pend = rows.filter((r: any) => r[campo] && !String(r[campo]).startsWith(dst.url)).length;
        arquivos.push({ tabela, campo, migrados: rows.filter((r: any) => r[campo]).length - pend, pendentes: pend });
      }
      return Response.json({ tabelas: linhas, totalOrigem, totalDestino, tabelasPendentes: pendentes, arquivos });
    }

    // ---------- DADOS: copia registros preservando os IDs ----------
    if (acao === "dados") {
      const lote = body.lote || 500;
      const somente = body.tabela ? [body.tabela] : TABELAS;
      const resultado = [];
      for (const t of somente) {
        let offset = 0, copiados = 0;
        while (true) {
          const linhas = await buscarPagina(org, t, offset, lote);
          if (linhas.length === 0) break;
          copiados += await gravar(dst, t, linhas);
          offset += linhas.length;
          if (linhas.length < lote) break;
        }
        resultado.push({ tabela: t, copiados });
      }
      return Response.json({ ok: true, resultado });
    }

    // ---------- ARQUIVOS: copia para o Storage novo e reaponta as URLs ----------
    if (acao === "arquivos") {
      const limite = body.limite || 10;
      await garantirBucket(dst);
      const feitos = [], erros = [];
      let bytes = 0, restantes = 0, tentativas = 0;

      for (const { tabela, campo } of CAMPOS_ARQUIVO) {
        const res = await fetch(dst.url + "/rest/v1/" + tabela + "?select=id," + campo, {
          headers: { apikey: dst.key, Authorization: "Bearer " + dst.key },
        });
        if (!res.ok) continue;
        const rows = await res.json();
        const pend = rows.filter((r: any) => r[campo] && !String(r[campo]).startsWith(dst.url));
        restantes += pend.length;

        for (const r of pend) {
          if (tentativas >= limite) break;
          tentativas++;
          try {
            const caminho = nomeSeguro(r[campo], r.id);
            const info = await copiarArquivo(dst, r[campo], caminho);
            await atualizarCampo(dst, tabela, r.id, campo, info.publicUrl);
            bytes += info.bytes;
            feitos.push({ tabela, id: r.id });
            restantes--;
          } catch (e) {
            erros.push({ tabela, id: r.id, erro: e.message });
            restantes--;
          }
        }
      }

      return Response.json({
        ok: true,
        copiados: feitos.length,
        mb: +(bytes / 1048576).toFixed(1),
        restantes,
        erros,
        concluido: restantes === 0,
      });
    }

    return Response.json({ error: "Ação inválida. Use: verificar | dados | arquivos" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}