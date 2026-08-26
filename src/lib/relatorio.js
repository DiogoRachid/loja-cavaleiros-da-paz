// Cabeçalho, rodapé e abertura de janela de impressão padronizados para
// todos os relatórios e documentos oficiais da Loja (imprimir ou salvar em PDF).

export const LOGO_LOJA_PADRAO =
  "https://media.base44.com/images/public/69aea997b473b479398fe231/9a3f4b5ac_LogoCavaleirosAlta.png";
export const LOGO_GLP_PADRAO =
  "https://media.base44.com/images/public/69aea997b473b479398fe231/5931c1ef4_logoglp.png";

export const logoLoja = (dadosLoja) => dadosLoja?.logo_url || LOGO_LOJA_PADRAO;
export const logoPotencia = (dadosLoja) => dadosLoja?.logo_potencia_url || LOGO_GLP_PADRAO;

export const estilosRelatorio = `
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1a202c; margin: 0; padding: 24px; }
  .rel-header { display: flex; align-items: center; gap: 20px; border-bottom: 3px solid #1B3A5F; padding-bottom: 14px; margin-bottom: 18px; }
  .rel-header img { height: 80px; width: 80px; object-fit: contain; flex-shrink: 0; }
  .rel-header .rel-loja { flex: 1; text-align: center; }
  .rel-header .rel-potencia { margin: 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
  .rel-header h1 { margin: 4px 0; font-size: 18px; color: #1B3A5F; }
  .rel-header p { margin: 0; font-size: 12px; color: #475569; }
  .rel-titulo { text-align: center; margin-bottom: 20px; }
  .rel-titulo h2 { margin: 0; font-size: 16px; color: #1B3A5F; text-transform: uppercase; letter-spacing: 1px; }
  .rel-titulo p { margin: 4px 0 0; font-size: 11px; color: #64748b; }
  table.rel { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; }
  table.rel th { background: #1B3A5F; color: #fff; padding: 8px 10px; text-align: left; font-size: 11px; }
  table.rel td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
  table.rel tbody tr:nth-child(even) { background: #f8fafc; }
  .rel-footer { margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 12px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
  @media print { body { padding: 10mm; } @page { size: A4; margin: 10mm; } }
`;

export function cabecalhoRelatorio({ dadosLoja, titulo, subtitulo = "", extraDireita = "" }) {
  const hoje = new Date().toLocaleDateString("pt-BR");
  return `
  <div class="rel-header">
    <img src="${logoLoja(dadosLoja)}" alt="" onerror="this.style.visibility='hidden'"/>
    <div class="rel-loja">
      <p class="rel-potencia">${dadosLoja?.potencia || "Grande Loja Maçônica do Estado do Paraná"}</p>
      <h1>${dadosLoja?.nome || "Loja Cavaleiros da Paz"} nº ${dadosLoja?.numero || "25"}</h1>
      <p>${dadosLoja?.oriente ? `Oriente de ${dadosLoja.oriente}` : ""}</p>
      <p>${dadosLoja?.endereco || ""}</p>
    </div>
    <img src="${logoPotencia(dadosLoja)}" alt="" onerror="this.style.visibility='hidden'"/>
  </div>
  ${extraDireita}
  ${titulo ? `<div class="rel-titulo"><h2>${titulo}</h2><p>${subtitulo || `Emitido em ${hoje}`}</p></div>` : ""}`;
}

export function rodapeRelatorio(dadosLoja) {
  const hoje = new Date().toLocaleDateString("pt-BR");
  return `<div class="rel-footer">
    <span>${dadosLoja?.nome || "Loja Cavaleiros da Paz"} nº ${dadosLoja?.numero || "25"} — ${dadosLoja?.potencia || "GLP"}</span>
    <span>Documento gerado em ${hoje}</span>
  </div>`;
}

// Abre nova janela com o documento pronto e dispara o diálogo de impressão
// (onde o usuário também pode escolher "Salvar como PDF").
export function abrirImpressao({ titulo, conteudo, estilosExtra = "" }) {
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/>
    <title>${titulo}</title>
    <style>${estilosRelatorio}${estilosExtra}</style>
    </head><body>${conteudo}
    <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 400); }</script>
    </body></html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
}

// Atalho: relatório completo (cabeçalho + corpo + rodapé) em uma chamada
export function imprimirRelatorio({ dadosLoja, titulo, subtitulo, corpo, estilosExtra }) {
  abrirImpressao({
    titulo,
    estilosExtra,
    conteudo: `${cabecalhoRelatorio({ dadosLoja, titulo, subtitulo })}${corpo}${rodapeRelatorio(dadosLoja)}`,
  });
}