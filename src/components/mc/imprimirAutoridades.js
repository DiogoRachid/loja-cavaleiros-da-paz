import { abrirImpressao, rodapeRelatorio, logoLoja, logoPotencia } from "@/lib/relatorio";

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

  // Marca d'água institucional repetida em todas as páginas impressas
  const marcaFixa = `
    <div class="marca-fixa">
      <img src="${logoLoja(dadosLoja)}" alt="" onerror="this.style.visibility='hidden'"/>
      <div class="marca-txt">
        <p class="marca-potencia">${dadosLoja?.potencia || "Grande Loja Maçônica do Estado do Paraná"}</p>
        <h1>${dadosLoja?.nome || "Loja Cavaleiros da Paz"} nº ${dadosLoja?.numero || "25"}</h1>
        <p>${dadosLoja?.oriente ? `Oriente de ${dadosLoja.oriente}` : ""}</p>
      </div>
      <img src="${logoPotencia(dadosLoja)}" alt="" onerror="this.style.visibility='hidden'"/>
    </div>`;

  // Página 1: capa com o título grande centralizado no meio da folha
  const capa = `
    <div class="capa">
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
    conteudo: `${marcaFixa}${capa}<div class="conteudo">${corpo || "<p style='text-align:center;color:#64748b'>Nenhuma autoridade cadastrada.</p>"}${rodapeRelatorio(dadosLoja)}</div>`,
    estilosExtra: `
      body { padding-top: 0; }
      .marca-fixa { position: fixed; top: 0; left: 0; right: 0; display: flex; align-items: center; gap: 20px; padding: 0 24px 10px; background: #fff; border-bottom: 3px solid #1B3A5F; }
      .marca-fixa img { height: 62px; width: 62px; object-fit: contain; flex-shrink: 0; }
      .marca-txt { flex: 1; text-align: center; }
      .marca-txt h1 { margin: 2px 0; font-size: 16px; color: #1B3A5F; }
      .marca-txt p { margin: 0; font-size: 11px; color: #475569; }
      .marca-potencia { text-transform: uppercase; letter-spacing: 1px; color: #64748b !important; }
      .capa, .conteudo { padding-top: 90px; }
      .capa { display: flex; flex-direction: column; min-height: calc(100vh - 48px); page-break-after: always; }
      .capa-centro { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
      .capa-eyebrow { margin: 0 0 14px; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: #C9A227; }
      .capa-titulo { margin: 0; font-size: 46px; line-height: 1.15; color: #1B3A5F; text-transform: uppercase; letter-spacing: 2px; }
      .capa-ornamento { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 22px 0; }
      .capa-ornamento span { display: block; width: 70px; height: 1px; background: #C9A227; }
      .capa-ornamento i { display: block; width: 8px; height: 8px; background: #C9A227; transform: rotate(45deg); }
      .capa-sub { margin: 0; font-size: 12px; color: #64748b; }
      @media print {
        @page { size: A4; margin: 30mm 10mm 12mm; }
        body { padding: 0; }
        .marca-fixa { top: -26mm; padding-left: 0; padding-right: 0; }
        .capa, .conteudo { padding-top: 0; }
        .capa { min-height: 235mm; }
      }
      .grupo { margin-bottom: 22px; page-break-inside: avoid; }
      .grupo-titulo { margin: 0 0 8px; font-size: 13px; color: #1B3A5F; text-transform: uppercase; letter-spacing: 0.5px; border-left: 4px solid #C9A227; padding-left: 8px; }
      .grupo-qtd { color: #94a3b8; font-weight: normal; }
    `,
  });
}