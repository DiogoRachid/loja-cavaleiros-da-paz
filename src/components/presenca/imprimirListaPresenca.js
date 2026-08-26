// Imprime a lista de presença da sessão com QR Code para leitura pelos irmãos
export function imprimirListaPresenca({ sessao, irmaos, dadosLoja, codigo }) {
  const nomeLoja = dadosLoja ? `ARLS ${dadosLoja.nome} nº ${dadosLoja.numero}` : "Loja";
  const dataFmt = sessao.data ? new Date(sessao.data + "T12:00:00").toLocaleDateString("pt-BR") : "";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(codigo)}`;

  const linhas = irmaos
    .map(
      (i, idx) =>
        `<tr><td class="num">${idx + 1}</td><td>${i.nome_completo}</td><td>${i.grau || ""}</td><td class="assina"></td></tr>`
    )
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
    <title>Lista de Presença — ${dataFmt}</title>
    <style>
      body { font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; max-width: 760px; margin: 30px auto; }
      header { display: flex; align-items: center; gap: 20px; border-bottom: 2px solid #1B3A5F; padding-bottom: 12px; }
      header .titulo { flex: 1; text-align: center; }
      header h1 { font-size: 16px; color: #1B3A5F; margin: 0; }
      header p { margin: 3px 0 0; font-size: 12px; color: #555; }
      .qr { text-align: center; }
      .qr img { width: 110px; height: 110px; }
      .qr span { display: block; font-size: 9px; color: #666; }
      h2 { text-align: center; font-size: 14px; margin: 18px 0 10px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #999; padding: 6px 8px; font-size: 12px; }
      th { background: #f1f5f9; text-align: left; }
      td.num { width: 34px; text-align: center; }
      td.assina { width: 240px; }
      .conf { margin-top: 50px; text-align: center; }
      .conf div { display: inline-block; width: 300px; border-top: 1px solid #333; font-size: 11px; padding-top: 5px; }
      @media print { body { margin: 12mm; } }
    </style></head><body>
    <header>
      <div class="titulo">
        <h1>${nomeLoja}</h1>
        <p>${dadosLoja?.potencia || "Grande Loja do Paraná"}${dadosLoja?.oriente ? ` — Oriente de ${dadosLoja.oriente}` : ""}</p>
      </div>
      <div class="qr">
        <img src="${qrUrl}" alt="QR de presença"/>
        <span>Escaneie para registrar presença</span>
      </div>
    </header>
    <h2>Lista de Presença — Sessão ${sessao.tipo || ""} no Grau de ${sessao.grau || ""} — ${dataFmt}${sessao.hora ? ` às ${sessao.hora}` : ""}</h2>
    <table>
      <thead><tr><th>#</th><th>Irmão</th><th>Grau</th><th>Assinatura</th></tr></thead>
      <tbody>${linhas}</tbody>
    </table>
    <div class="conf"><div>Ir∴ Chanceler — conferência das presenças</div></div>
    <script>window.onload = () => window.print();</script>
    </body></html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
}