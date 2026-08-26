import { abrirImpressao, cabecalhoRelatorio } from "@/lib/relatorio";

// Imprime o parecer do Orador em papel oficial da Loja (imprimir ou salvar em PDF)
export function imprimirParecer({ parecer, dadosLoja }) {
  const data = parecer.data_parecer
    ? new Date(parecer.data_parecer + "T12:00:00").toLocaleDateString("pt-BR")
    : new Date().toLocaleDateString("pt-BR");
  const teor = (parecer.teor || "")
    .split("\n")
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`)
    .join("");

  const subtitulo = [
    `${parecer.tipo}${parecer.referencia_descricao ? ` — ${parecer.referencia_descricao}` : ""}`,
    parecer.sessao_data
      ? `Sessão de ${new Date(parecer.sessao_data + "T12:00:00").toLocaleDateString("pt-BR")}`
      : "",
  ]
    .filter(Boolean)
    .join("<br/>");

  const conteudo = `
    ${cabecalhoRelatorio({ dadosLoja, titulo: "Parecer do Orador", subtitulo })}
    <p><strong>Assunto:</strong> ${parecer.titulo}</p>
    ${teor}
    <p class="conclusao">Conclusão: ${parecer.conclusao}.</p>
    <p style="text-align:right; margin-top:24px;">${dadosLoja?.oriente || ""}, ${data}.</p>
    <div class="assinatura"><div>${parecer.autor_nome || ""}<br/>Ir∴ Orador</div></div>`;

  abrirImpressao({
    titulo: `Parecer do Orador — ${parecer.titulo}`,
    conteudo,
    estilosExtra: `
      body { font-family: Georgia, 'Times New Roman', serif; max-width: 760px; margin: 0 auto; line-height: 1.7; }
      p { text-align: justify; font-size: 13px; }
      .conclusao { margin-top: 24px; font-size: 13px; font-weight: bold; }
      .assinatura { margin-top: 70px; text-align: center; }
      .assinatura div { display: inline-block; width: 320px; border-top: 1px solid #333; font-size: 12px; padding-top: 5px; }
    `,
  });
}