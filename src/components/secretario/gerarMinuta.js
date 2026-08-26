// Monta as seções do balaústre a partir do andamento real da reunião
const fmtHora = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d)) return null;
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

const fmtData = (dataStr) => {
  if (!dataStr) return "";
  const d = new Date(dataStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
};

const fmtDuracao = (seg) => {
  if (!seg && seg !== 0) return "";
  const m = Math.round(seg / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}`;
};

export function gerarSecoes({ sessao, presencas, tempos, ordemEntrada, dadosLoja, vmNome }) {
  const presentes = presencas.filter((p) => p.presente);
  const ausentes = presencas.filter((p) => !p.presente && !p.dispensado);
  const justificados = ausentes.filter((p) => p.justificativa);
  const autoridades = ordemEntrada.filter(
    (o) => o.tipo_participante === "Autoridade" && (o.presente || o.confirmado)
  );

  const temposOrd = [...tempos].sort((a, b) => new Date(a.hora_inicio) - new Date(b.hora_inicio));
  const horaAbertura = (temposOrd[0] && fmtHora(temposOrd[0].hora_inicio)) || sessao.hora || "";
  const horaEncerramento = temposOrd.length ? fmtHora(temposOrd[temposOrd.length - 1].hora_fim) : "";

  const nomeLoja = dadosLoja ? `${dadosLoja.nome} nº ${dadosLoja.numero}` : "Loja";
  const oriente = dadosLoja?.oriente ? `, Oriente de ${dadosLoja.oriente}` : "";

  const abertura =
    `Aos ${fmtData(sessao.data)}, ${horaAbertura ? `às ${horaAbertura}, ` : ""}` +
    `reuniu-se a ARLS ${nomeLoja}${oriente}, em Sessão ${sessao.tipo || ""} no Grau de ${sessao.grau || "Aprendiz"}, ` +
    `sob a presidência do Venerável Mestre${vmNome ? ` Ir∴ ${vmNome}` : ""}, que declarou abertos os trabalhos na forma ritualística.`;

  const presencasTexto = [
    `Estiveram presentes ${presentes.length} irmãos do quadro.`,
    ausentes.length
      ? `Ausentes: ${ausentes.length} irmão(s)${justificados.length ? `, sendo ${justificados.length} com ausência justificada` : ""}.`
      : null,
    autoridades.length
      ? `Visitantes e autoridades presentes: ${autoridades
          .map((a) => `${a.autoridade_titulo ? a.autoridade_titulo + " " : ""}${a.autoridade_nome}`)
          .join("; ")}.`
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  const andamento = temposOrd.length
    ? temposOrd
        .map(
          (t) =>
            `${t.etapa_nome} — início às ${fmtHora(t.hora_inicio)}, duração de ${fmtDuracao(t.duracao_segundos)}.`
        )
        .join("\n")
    : "As etapas da sessão transcorreram conforme o rito.";

  return [
    { id: "abertura", titulo: "Abertura dos Trabalhos", texto: abertura },
    { id: "presencas", titulo: "Presenças e Visitantes", texto: presencasTexto },
    { id: "expediente", titulo: "Leitura do Expediente", texto: "Foi procedida a leitura do balaústre da sessão anterior, que foi aprovado sem ressalvas, bem como das correspondências recebidas e expedidas." },
    { id: "ordem_do_dia", titulo: "Ordem do Dia", texto: sessao.pauta || "" },
    { id: "andamento", titulo: "Andamento da Sessão", texto: andamento },
    { id: "palavra", titulo: "Palavra a Bem da Ordem", texto: "" },
    { id: "tronco", titulo: "Tronco de Beneficência", texto: "" },
    {
      id: "encerramento",
      titulo: "Encerramento",
      texto: `Nada mais havendo a tratar, o Venerável Mestre encerrou os trabalhos na forma ritualística${horaEncerramento ? `, às ${horaEncerramento}` : ""}. E para constar, eu, Secretário, lavrei o presente balaústre, que vai assinado por quem de direito.`,
    },
  ];
}