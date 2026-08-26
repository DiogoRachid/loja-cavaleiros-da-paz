// Imprime o parecer do Orador em papel oficial da Loja
export function imprimirParecer({ parecer, dadosLoja }) {
  const nomeLoja = dadosLoja ? `ARLS ${dadosLoja.nome} nº ${dadosLoja.numero}` : "Loja";
  const data = parecer.data_parecer
    ? new Date(parecer.data_parecer + "T12:00:00").toLocaleDateString("pt-BR")
    : new Date().toLocaleDateString("pt-BR");
  const teor = (parecer.teor || "")
    .split("\n")
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`)
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
    <title>Parecer do Orador — ${parecer.titulo}</title>
    <style>
      body { font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; max-width: 720px; margin: 40px auto; line-height: 1.7; }
      header { text-align: center; border-bottom: 2px solid #1B3A5F; padding-bottom: 12px; }
      header img { height: 70px; }
      header h1 { font-size: 16px; color: #1B3A5F; margin: 8px 0 0; }
      header p { margin: 3px 0 0; font-size: 12px; color: #555; }
      h2 { text-align: center; font-size: 15px; margin: 28px 0 4px; }
      .sub { text-align: center; font-size: 12px; color: #555; margin-bottom: 24px; }
      p { text-align: justify; font-size: 13px; }
      .conclusao { margin-top: 24px; font-size: 13px; font-weight: bold; }
      .assinatura { margin-top: 70px; text-align: center; }
      .assinatura div { display: inline-block; width: 320px; border-top: 1px solid #333; font-size: 12px; padding-top: 5px; }
      @media print { body { margin: 15mm; } }
    </style></head><body>
    <header>
      ${dadosLoja?.logo_url ? `<img src="${dadosLoja.logo_url}" alt=""/>` : ""}
      <h1>${nomeLoja}</h1>
      <p>${dadosLoja?.potencia || "Grande Loja do Paraná"}${dadosLoja?.oriente ? ` — Oriente de ${dadosLoja.oriente}` : ""}</p>
    </header>
    <h2>Parecer do Orador</h2>
    <div class="sub">
      ${parecer.tipo}${parecer.referencia_descricao ? ` — ${parecer.referencia_descricao}` : ""}
      ${parecer.sessao_data ? `<br/>Sessão de ${new Date(parecer.sessao_data + "T12:00:00").toLocaleDateString("pt-BR")}` : ""}
    </div>
    <p><strong>Assunto:</strong> ${parecer.titulo}</p>
    ${teor}
    <p class="conclusao">Conclusão: ${parecer.conclusao}.</p>
    <p style="text-align:right; margin-top:24px;">${dadosLoja?.oriente || ""}, ${data}.</p>
    <div class="assinatura"><div>${parecer.autor_nome || ""}<br/>Ir∴ Orador</div></div>
    <script>window.onload = () => window.print();</script>
    </body></html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
}