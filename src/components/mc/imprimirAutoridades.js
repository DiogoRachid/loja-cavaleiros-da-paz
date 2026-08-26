import { abrirImpressao, cabecalhoRelatorio, rodapeRelatorio } from "@/lib/relatorio";

// Relatório de autoridades agrupadas por Potência / Obediência
export function imprimirAutoridadesPorPotencia({ autoridades, dadosLoja }) {
  const grupos = {};
  autoridades.forEach((a) => {
    const chave = a.potencia?.trim() || "Sem potência informada";
    if (!grupos[chave]) grupos[chave] = [];
    grupos[chave].push(a);
  });

  const nomesPotencias = Object.keys(grupos).sort((a, b) => a.localeCompare(b, "pt-BR"));

  const corpo = nomesPotencias
    .map((potencia) => {
      const lista = [...grupos[potencia]].sort(
        (a, b) => (a.ordem_protocolar || 999) - (b.ordem_protocolar || 999)
      );
      const linhas = lista
        .map(
          (a) => `<tr>
            <td style="text-align:center">${a.ordem_protocolar || "—"}</td>
            <td>${a.titulo || "—"}</td>
            <td>${a.nome || "—"}</td>
            <td>${a.cargo_potencia || "—"}</td>
            <td>${[a.telefone, a.email].filter(Boolean).join("<br>") || "—"}</td>
          </tr>`
        )
        .join("");

      return `
      <div class="grupo">
        <h3 class="grupo-titulo">${potencia} <span class="grupo-qtd">(${lista.length})</span></h3>
        <table class="rel">
          <thead>
            <tr>
              <th style="width:50px;text-align:center">Ordem</th>
              <th>Título Protocolar</th>
              <th>Nome</th>
              <th>Cargo na Potência</th>
              <th>Contato</th>
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>`;
    })
    .join("");

  const subtitulo = `${autoridades.length} autoridade(s) em ${nomesPotencias.length} potência(s) — emitido em ${new Date().toLocaleDateString("pt-BR")}`;

  // Página 1: capa com o título grande centralizado no meio da folha
  const capa = `
    <div class="capa">
      ${cabecalhoRelatorio({ dadosLoja })}
      <div class="capa-centro">
        <p class="capa-eyebrow">Relatório Oficial</p>
        <h1 class="capa-titulo">Autoridades<br>por Potência</h1>
        <div class="capa-ornamento"><span></span><i></i><span></span></div>
        <p class="capa-sub">${subtitulo}</p>
      </div>
      ${rodapeRelatorio(dadosLoja)}
    </div>`;

  abrirImpressao({
    titulo: "Autoridades por Potência",
    conteudo: `${capa}<div class="conteudo">${cabecalhoRelatorio({ dadosLoja, titulo: "Autoridades por Potência", subtitulo })}${corpo || "<p style='text-align:center;color:#64748b'>Nenhuma autoridade cadastrada.</p>"}${rodapeRelatorio(dadosLoja)}</div>`,
    estilosExtra: `
      .capa { display: flex; flex-direction: column; min-height: calc(100vh - 48px); page-break-after: always; }
      .capa-centro { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
      .capa-eyebrow { margin: 0 0 14px; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: #C9A227; }
      .capa-titulo { margin: 0; font-size: 46px; line-height: 1.15; color: #1B3A5F; text-transform: uppercase; letter-spacing: 2px; }
      .capa-ornamento { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 22px 0; }
      .capa-ornamento span { display: block; width: 70px; height: 1px; background: #C9A227; }
      .capa-ornamento i { display: block; width: 8px; height: 8px; background: #C9A227; transform: rotate(45deg); }
      .capa-sub { margin: 0; font-size: 12px; color: #64748b; }
      @media print { .capa { min-height: 247mm; } }
      .grupo { margin-bottom: 22px; page-break-inside: avoid; }
      .grupo-titulo { margin: 0 0 8px; font-size: 13px; color: #1B3A5F; text-transform: uppercase; letter-spacing: 0.5px; border-left: 4px solid #C9A227; padding-left: 8px; }
      .grupo-qtd { color: #94a3b8; font-weight: normal; }
    `,
  });
}