// Emissão impressa de expedientes (ofícios, pranchas, circulares) em papel da Loja
export function imprimirExpediente({ expediente, dadosLoja, secretarioNome, vmNome }) {
  const hoje = new Date().toLocaleDateString("pt-BR");
  const data = expediente.data
    ? new Date(expediente.data + "T12:00:00").toLocaleDateString("pt-BR")
    : hoje;
  const nomeLoja = `${dadosLoja?.nome || "Loja"} nº ${dadosLoja?.numero || ""}`;

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
  <title>${expediente.classe || "Expediente"} ${expediente.numero || ""}</title>
  <style>
    body { font-family: 'Times New Roman', serif; max-width: 750px; margin: 40px auto; color:#000; line-height:1.8; }
    .header { text-align:center; border-bottom:2px solid #1B3A5F; padding-bottom:12px; margin-bottom:24px; }
    .loja { font-size:16px; font-weight:bold; color:#1B3A5F; text-transform:uppercase; }
    .sub { font-size:12px; color:#475569; }
    .doc-title { text-align:center; font-weight:bold; text-transform:uppercase; letter-spacing:2px; color:#1B3A5F; margin:20px 0; }
    .meta { font-size:13px; margin-bottom:20px; }
    .corpo { text-align:justify; font-size:14px; white-space:pre-wrap; margin:24px 0; }
    .assinaturas { display:flex; justify-content:space-between; margin-top:70px; }
    .assinatura { text-align:center; width:45%; }
    .linha { border-top:1px solid #000; margin-bottom:5px; }
    .ornamento { text-align:center; color:#C9A227; margin-top:40px; }
  </style></head><body>
    <div class="header">
      <div class="sub">${dadosLoja?.potencia || ""}</div>
      <div class="loja">${nomeLoja}</div>
      <div class="sub">${dadosLoja?.oriente ? "Oriente de " + dadosLoja.oriente : ""}</div>
      <div class="sub">${dadosLoja?.endereco || ""}</div>
    </div>
    <div class="doc-title">${expediente.classe || "Expediente"}${expediente.numero ? ` nº ${expediente.numero}` : ""}</div>
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
    <div class="ornamento">G.·.A.·.D.·.U.·.</div>
  </body></html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.onload = () => win.print();
}