import { imprimirRelatorio } from "@/lib/relatorio";

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

  imprimirRelatorio({
    dadosLoja,
    titulo: "Autoridades por Potência",
    subtitulo: `${autoridades.length} autoridade(s) em ${nomesPotencias.length} potência(s) — emitido em ${new Date().toLocaleDateString("pt-BR")}`,
    corpo: corpo || "<p style='text-align:center;color:#64748b'>Nenhuma autoridade cadastrada.</p>",
    estilosExtra: `
      .grupo { margin-bottom: 22px; page-break-inside: avoid; }
      .grupo-titulo { margin: 0 0 8px; font-size: 13px; color: #1B3A5F; text-transform: uppercase; letter-spacing: 0.5px; border-left: 4px solid #C9A227; padding-left: 8px; }
      .grupo-qtd { color: #94a3b8; font-weight: normal; }
    `,
  });
}