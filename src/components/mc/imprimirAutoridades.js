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
  const subtitulo = `${autoridades.length} autoridade(s) em ${nomesPotencias.length} potência(s) — emitido em ${new Date().toLocaleDateString("pt-BR")}`;

  // Cabeçalho institucional: fica dentro do <thead>, então o navegador o repete
  // automaticamente no topo de cada página impressa.
  const cabecalhoLinhas = `
    <tr>
      <th colspan="5" class="marca-cel">
        <div class="marca">
          <img src="${logoLoja(dadosLoja)}" alt="" onerror="this.style.visibility='hidden'"/>
          <div class="marca-txt">
            <p class="marca-potencia">${dadosLoja?.potencia || "Grande Loja Maçônica do Estado do Paraná"}</p>
            <h1>${dadosLoja?.nome || "Loja Cavaleiros da Paz"} nº ${dadosLoja?.numero || "25"}</h1>
            <p>${dadosLoja?.oriente ? `Oriente de ${dadosLoja.oriente}` : ""}</p>
          </div>
          <img src="${logoPotencia(dadosLoja)}" alt="" onerror="this.style.visibility='hidden'"/>
        </div>
      </th>
    </tr>
    <tr>
      <th style="width:55px;text-align:center">Ordem</th>
      <th style="width:110px">Título Protocolar</th>
      <th>Nome</th>
      <th>Cargo na Potência</th>
      <th style="width:130px">Contato</th>
    </tr>`;

  const linhas = nomesPotencias
    .map((potencia) => {
      const lista = [...grupos[potencia]].sort(
        (a, b) => (a.ordem_protocolar || 999) - (b.ordem_protocolar || 999)
      );
      const itens = lista
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

      return `<tr class="grupo-linha"><td colspan="5">${potencia} <span class="grupo-qtd">(${lista.length})</span></td></tr>${itens}`;
    })
    .join("");

  // Página 1: capa com o título grande centralizado no meio da folha
  const capa = `
    <div class="capa">
      <div class="capa-topo">
        <img src="${logoLoja(dadosLoja)}" alt="" onerror="this.style.visibility='hidden'"/>
        <div class="marca-txt">
          <p class="marca-potencia">${dadosLoja?.potencia || "Grande Loja Maçônica do Estado do Paraná"}</p>
          <h1>${dadosLoja?.nome || "Loja Cavaleiros da Paz"} nº ${dadosLoja?.numero || "25"}</h1>
          <p>${dadosLoja?.oriente ? `Oriente de ${dadosLoja.oriente}` : ""}</p>
        </div>
        <img src="${logoPotencia(dadosLoja)}" alt="" onerror="this.style.visibility='hidden'"/>
      </div>
      <div class="capa-centro">
        <p class="capa-eyebrow">Relatório Oficial</p>
        <h2 class="capa-titulo">Autoridades<br>por Potência</h2>
        <div class="capa-ornamento"><span></span><i></i><span></span></div>
        <p class="capa-sub">${subtitulo}</p>
      </div>
      ${rodapeRelatorio(dadosLoja)}
    </div>`;

  const tabela = autoridades.length
    ? `<table class="rel rel-autoridades"><thead>${cabecalhoLinhas}</thead><tbody>${linhas}</tbody></table>`
    : "<p style='text-align:center;color:#64748b'>Nenhuma autoridade cadastrada.</p>";

  abrirImpressao({
    titulo: "Autoridades por Potência",
    conteudo: `${capa}${tabela}`,
    estilosExtra: `
      .marca { display: flex; align-items: center; gap: 20px; }
      .marca img, .capa-topo img { height: 62px; width: 62px; object-fit: contain; flex-shrink: 0; }
      .marca-txt { flex: 1; text-align: center; }
      .marca-txt h1 { margin: 2px 0; font-size: 16px; color: #1B3A5F; }
      .marca-txt p { margin: 0; font-size: 11px; color: #475569; }
      .marca-potencia { text-transform: uppercase; letter-spacing: 1px; color: #64748b !important; }
      .marca-cel { background: #fff !important; padding: 6px 0 10px !important; border-bottom: 3px solid #1B3A5F; }

      .capa { display: flex; flex-direction: column; min-height: calc(100vh - 48px); page-break-after: always; }
      .capa-topo { display: flex; align-items: center; gap: 20px; border-bottom: 3px solid #1B3A5F; padding-bottom: 12px; }
      .capa-centro { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
      .capa-eyebrow { margin: 0 0 14px; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: #C9A227; }
      .capa-titulo { margin: 0; font-size: 46px; line-height: 1.15; color: #1B3A5F; text-transform: uppercase; letter-spacing: 2px; }
      .capa-ornamento { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 22px 0; }
      .capa-ornamento span { display: block; width: 70px; height: 1px; background: #C9A227; }
      .capa-ornamento i { display: block; width: 8px; height: 8px; background: #C9A227; transform: rotate(45deg); }
      .capa-sub { margin: 0; font-size: 12px; color: #64748b; }

      .rel-autoridades { border: none; }
      .rel-autoridades thead { display: table-header-group; }
      .grupo-linha td { background: #1B3A5F; color: #fff; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; border-left: 4px solid #C9A227; }
      .grupo-qtd { color: #C9A227; font-weight: normal; }
      .rel-autoridades tbody tr { page-break-inside: avoid; }
      @media print { .capa { min-height: 250mm; } }
    `,
  });
}