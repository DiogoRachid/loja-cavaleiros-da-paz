import { abrirImpressao, cabecalhoRelatorio } from "@/lib/relatorio";
import { anoVerdadeiraLuz } from "@/components/secretario/calendarioJudaico";
import { lerDocumento, htmlSeguro, escapeHtml, ESTILOS_TEXTO_RICO } from "@/components/secretario/textoRico";

// Emissão impressa de expedientes (ofícios, pranchas, circulares) em papel da Loja
export function imprimirExpediente({ expediente, dadosLoja, secretarioNome, vmNome }) {
  const hoje = new Date().toLocaleDateString("pt-BR");
  const data = expediente.data
    ? new Date(expediente.data + "T12:00:00").toLocaleDateString("pt-BR")
    : hoje;
  const tituloDoc = escapeHtml(`${expediente.classe || "Expediente"}${expediente.numero ? ` nº ${expediente.numero}` : ""}`);
  const documento = lerDocumento(expediente.conteudo);
  const ano = anoVerdadeiraLuz(expediente.data, documento.aposPorDoSol);

  const conteudo = `
    ${cabecalhoRelatorio({ dadosLoja, titulo: tituloDoc, subtitulo: `Emitido em ${data} E∴V∴ · ${ano} V∴L∴` })}
    <div class="meta">
      <p><strong>Destinatário:</strong> ${escapeHtml(expediente.destinatario || "—")}</p>
      <p><strong>Assunto:</strong> ${escapeHtml(expediente.assunto || "—")}</p>
      <p><strong>Data:</strong> ${data} E∴V∴ e ${ano} V∴L∴</p>
    </div>
    <div class="corpo texto-rico">${htmlSeguro(documento.texto)}</div>
    <p style="text-align:center">Oriente de ${escapeHtml(dadosLoja?.oriente || "")}, ${data} E∴V∴ e ${ano} V∴L∴</p>
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
      .corpo { text-align: justify; font-size: 14px; margin: 24px 0; }
      ${ESTILOS_TEXTO_RICO}
      .assinaturas { display: flex; justify-content: space-between; margin-top: 70px; }
      .assinatura { text-align: center; width: 45%; }
      .linha { border-top: 1px solid #000; margin-bottom: 5px; }
      .ornamento { text-align: center; color: #C9A227; margin-top: 40px; }
    `,
  });
}