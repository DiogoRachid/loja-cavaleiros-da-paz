import { abrirImpressao, cabecalhoRelatorio } from "@/lib/relatorio";

// Emissão impressa de expedientes (ofícios, pranchas, circulares) em papel da Loja
export function imprimirExpediente({ expediente, dadosLoja, secretarioNome, vmNome }) {
  const hoje = new Date().toLocaleDateString("pt-BR");
  const data = expediente.data
    ? new Date(expediente.data + "T12:00:00").toLocaleDateString("pt-BR")
    : hoje;
  const tituloDoc = `${expediente.classe || "Expediente"}${expediente.numero ? ` nº ${expediente.numero}` : ""}`;

  const conteudo = `
    ${cabecalhoRelatorio({ dadosLoja, titulo: tituloDoc, subtitulo: `Emitido em ${data}` })}
    <div class="meta">
      <p><strong>Destinatário:</strong> ${expediente.destinatario || "—"}</p>
      <p><strong>Assunto:</strong> ${expediente.assunto || "—"}</p>
      <p><strong>Data:</strong> ${data}</p>
    </div>
    <div class="corpo">${(expediente.conteudo || "").replace(/</g, "&lt;")}</div>
    <p style="text-align:center">Oriente de ${dadosLoja?.oriente || ""}, ${data}</p>
    <div class="assinaturas">
      <div class="assinatura"><div class="linha"></div><strong>${secretarioNome || "Secretário"}</strong><br/><small>Secretário</small></div>
      <div class="assinatura"><div class="linha"></div><strong>${vmNome || "Venerável Mestre"}</strong><br/><small>Venerável Mestre</small></div>
    </div>
    <div class="ornamento">G.·.A.·.D.·.U.·.</div>`;

  abrirImpressao({
    titulo: tituloDoc,
    conteudo,
    estilosExtra: `
      body { font-family: 'Times New Roman', serif; max-width: 780px; margin: 0 auto; line-height: 1.8; }
      .meta { font-size: 13px; margin-bottom: 20px; }
      .corpo { text-align: justify; font-size: 14px; white-space: pre-wrap; margin: 24px 0; }
      .assinaturas { display: flex; justify-content: space-between; margin-top: 70px; }
      .assinatura { text-align: center; width: 45%; }
      .linha { border-top: 1px solid #000; margin-bottom: 5px; }
      .ornamento { text-align: center; color: #C9A227; margin-top: 40px; }
    `,
  });
}