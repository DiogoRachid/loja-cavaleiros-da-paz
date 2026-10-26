import { anoVerdadeiraLuz } from "@/components/secretario/calendarioJudaico";
import { htmlSeguro, textoSimples, escapeHtml } from "@/components/secretario/textoRico";
import { estilosBalaustre } from "@/components/secretario/balaustreImpressaoEstilos";

import { logoLoja, logoPotencia } from "@/lib/relatorio";

// Abre uma janela de impressão com o balaústre formatado
export function gerarHtmlBalaustre({ sessao, secoes, dadosLoja, assinaturas = {}, aposPorDoSol = false }) {
  const imagem = (url) => /^https:\/\//i.test(url || "") ? escapeHtml(url) : "";
  const nomeLoja = dadosLoja ? `ARLS ${dadosLoja.nome} nº ${dadosLoja.numero}` : "Loja";
  const oriente = dadosLoja?.oriente ? `Oriente de ${dadosLoja.oriente}` : "";
  const dataFmt = sessao.data
    ? new Date(sessao.data + "T12:00:00").toLocaleDateString("pt-BR")
    : "";

  const corpo = secoes
    .filter((s) => textoSimples(s.texto))
    .map((s, i) => `<h3>${i + 1}. ${escapeHtml(s.titulo)}</h3><div class="texto-rico">${htmlSeguro(s.texto)}</div>`)
    .join("");

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/>
    <title>Balaústre — Sessão ${escapeHtml(sessao.numero || dataFmt)}</title>
    <style>${estilosBalaustre}</style></head><body>
    <header>
      <img class="logo" src="${imagem(logoLoja(dadosLoja))}" alt="Logo da Loja"/>
      <div class="titulo">
        <h1>${escapeHtml(nomeLoja)}</h1>
        <p>${escapeHtml(dadosLoja?.potencia || "Grande Loja do Paraná")}${oriente ? ` — ${escapeHtml(oriente)}` : ""}</p>
        <p>Ano da Verdadeira Luz ${anoVerdadeiraLuz(sessao.data, aposPorDoSol)}</p>
      </div>
      <img class="logo" src="${imagem(logoPotencia(dadosLoja))}" alt="Logo da Potência"/>
    </header>
    <h2>Balaústre da Sessão ${escapeHtml(sessao.tipo || "")} de ${escapeHtml(dataFmt)}${sessao.numero ? ` — nº ${escapeHtml(sessao.numero)}` : ""}</h2>
    ${corpo}
    <div class="assinaturas">
      <div><strong>${escapeHtml(assinaturas.vm || "")}</strong><span>Venerável Mestre</span></div>
      <div><strong>${escapeHtml(assinaturas.secretario || "")}</strong><span>Secretário</span></div>
      <div><strong>${escapeHtml(assinaturas.orador || "")}</strong><span>Orador</span></div>
    </div>
    </body></html>`;
}

export function imprimirBalaustre(documento) {
  const win = window.open("", "_blank");
  if (!win) return false;
  win.opener = null;
  win.addEventListener("load", () => win.print(), { once: true });
  win.document.write(gerarHtmlBalaustre(documento));
  win.document.close();
  return true;
}