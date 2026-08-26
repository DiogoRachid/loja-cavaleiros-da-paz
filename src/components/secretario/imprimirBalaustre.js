// Abre uma janela de impressão com o balaústre formatado
export function imprimirBalaustre({ sessao, secoes, dadosLoja }) {
  const nomeLoja = dadosLoja ? `ARLS ${dadosLoja.nome} nº ${dadosLoja.numero}` : "Loja";
  const oriente = dadosLoja?.oriente ? `Oriente de ${dadosLoja.oriente}` : "";
  const dataFmt = sessao.data
    ? new Date(sessao.data + "T12:00:00").toLocaleDateString("pt-BR")
    : "";

  const corpo = secoes
    .filter((s) => s.texto && s.texto.trim())
    .map(
      (s, i) =>
        `<h3>${i + 1}. ${s.titulo}</h3><p>${s.texto.replace(/\n/g, "<br/>")}</p>`
    )
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
    <title>Balaústre — Sessão ${sessao.numero || dataFmt}</title>
    <style>
      body { font-family: Georgia, serif; color: #1a1a1a; max-width: 720px; margin: 40px auto; line-height: 1.7; }
      header { text-align: center; border-bottom: 2px solid #1B3A5F; padding-bottom: 16px; margin-bottom: 24px; }
      header h1 { font-size: 18px; color: #1B3A5F; margin: 0; }
      header p { margin: 4px 0 0; font-size: 13px; color: #555; }
      h2 { text-align: center; font-size: 16px; margin: 24px 0; }
      h3 { font-size: 13px; color: #1B3A5F; text-transform: uppercase; letter-spacing: 0.5px; margin: 20px 0 4px; }
      p { font-size: 13px; text-align: justify; margin: 0; }
      .assinaturas { display: flex; justify-content: space-between; margin-top: 80px; }
      .assinaturas div { width: 45%; border-top: 1px solid #333; text-align: center; font-size: 12px; padding-top: 6px; }
    </style></head><body>
    <header><h1>${nomeLoja}</h1><p>${oriente}</p></header>
    <h2>Balaústre da Sessão ${sessao.tipo || ""} de ${dataFmt}${sessao.numero ? ` — nº ${sessao.numero}` : ""}</h2>
    ${corpo}
    <div class="assinaturas">
      <div>Venerável Mestre</div>
      <div>Secretário</div>
    </div>
    <script>window.onload = () => window.print();</script>
    </body></html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
}