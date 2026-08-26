import { abrirImpressao, cabecalhoRelatorio, rodapeRelatorio } from "@/lib/relatorio";

// Imprime a lista de presença da sessão com QR Code para leitura pelos irmãos
export function imprimirListaPresenca({ sessao, irmaos, dadosLoja, codigo }) {
  const dataFmt = sessao.data ? new Date(sessao.data + "T12:00:00").toLocaleDateString("pt-BR") : "";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(codigo)}`;

  const linhas = irmaos
    .map(
      (i, idx) =>
        `<tr><td class="num">${idx + 1}</td><td>${i.nome_completo}</td><td>${i.grau || ""}</td><td class="assina"></td></tr>`
    )
    .join("");

  const qr = `<div class="qr"><img src="${qrUrl}" alt="QR de presença"/><span>Escaneie para registrar presença</span></div>`;

  const conteudo = `
    ${cabecalhoRelatorio({
      dadosLoja,
      titulo: `Lista de Presença — Sessão ${sessao.tipo || ""} no Grau de ${sessao.grau || ""}`,
      subtitulo: `${dataFmt}${sessao.hora ? ` às ${sessao.hora}` : ""}`,
      extraDireita: qr,
    })}
    <table class="rel">
      <thead><tr><th>#</th><th>Irmão</th><th>Grau</th><th>Assinatura</th></tr></thead>
      <tbody>${linhas}</tbody>
    </table>
    <div class="conf"><div>Ir∴ Chanceler — conferência das presenças</div></div>
    ${rodapeRelatorio(dadosLoja)}`;

  abrirImpressao({
    titulo: `Lista de Presença — ${dataFmt}`,
    conteudo,
    estilosExtra: `
      body { max-width: 800px; margin: 0 auto; }
      .qr { text-align: center; margin: 0 0 12px; }
      .qr img { width: 110px; height: 110px; }
      .qr span { display: block; font-size: 9px; color: #666; }
      table.rel td.num { width: 34px; text-align: center; }
      table.rel td.assina { width: 240px; }
      .conf { margin-top: 50px; text-align: center; }
      .conf div { display: inline-block; width: 300px; border-top: 1px solid #333; font-size: 11px; padding-top: 5px; }
    `,
  });
}