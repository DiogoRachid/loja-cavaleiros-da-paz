import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { FileText, Users, Shield, ClipboardList, Printer, Save, ChevronLeft, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import OficiaisConfirmacao from "@/components/reuniao/OficiaisConfirmacao";
import AutoridadesList from "@/components/reuniao/AutoridadesList";
import RoteiroReuniao, { ITENS_PADRAO } from "@/components/reuniao/RoteiroReuniao";
import { svgCargo } from "@/components/reuniao/cargoSvg";
import { logoLoja, logoPotencia } from "@/lib/relatorio";

// Símbolos/ícones por cargo (texto) — mantido apenas como referência
const SIMBOLO_CARGO = {
  "Venerável Mestre": "☉",
  "Primeiro Vigilante": "△",
  "Segundo Vigilante": "▽",
  "Orador": "⚖",
  "Secretário": "✒",
  "Tesoureiro": "⚷",
  "Chanceler": "✦",
  "Mestre de Cerimônias": "⚜",
  "Mestre de Cerimônias Adjunto": "⚜",
  "Bibliotecário": "📖",
  "Primeiro Diácono": "✦",
  "Segundo Diácono": "✧",
  "Porta Bandeira": "⚑",
  "Porta Espada": "⚔",
  "Arquiteto": "⬡",
  "Hospitaleiro": "✚",
  "Músico": "♪",
  "Mestre de Harmonia": "♫",
  "Cobrador": "⊕",
  "Guarda Interno": "⊞",
  "Guarda Externo": "⊟",
  "Primeiro Experto": "◈",
  "Segundo Experto": "◇",
  "Mestre de Banquetes": "⚗",
};

const CARGOS_ORDEM_EXIBICAO = [
  "Venerável Mestre",
  "Primeiro Vigilante",
  "Segundo Vigilante",
  "Orador",
  "Secretário",
  "Guarda do Templo",
  "Mestre de Cerimônias",
  "Mestre de Cerimônias Adjunto",
  "Primeiro Diácono",
  "Segundo Diácono",
  "Cobridor",
  "Tesoureiro",
  "Hospitaleiro",
  "Chanceler",
  "Mestre de Harmonia",
  "Primeiro Experto",
  "Segundo Experto",
  "Porta Espada",
  "Porta Bandeira",
  "Porta Estandarte",
  "Mestre de Banquetes",
  "Arquiteto",
  "Bibliotecário",
  "Secretário de Ação Social",
];

export default function PrepararReuniao() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessaoId = urlParams.get("sessao");

  const [sessao, setSessao] = useState(null);
  const [quadroOficiais, setQuadroOficiais] = useState([]);
  const [irmaos, setIrmaos] = useState([]);
  const [autoridades, setAutoridades] = useState([]);
  const [oficiais, setOficiais] = useState([]);
  const [autoridadesLista, setAutoridadesLista] = useState([]);
  const [roteiro, setRoteiro] = useState(ITENS_PADRAO.map(i => ({ ...i })));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [activeTab, setActiveTab] = useState("oficiais");
  const [dadosLoja, setDadosLoja] = useState(null);

  useEffect(() => {
    loadDados();
  }, [sessaoId]);

  const loadDados = async () => {
    setLoading(true);
    const [irms, auts, loja] = await Promise.all([
      db.Irmao.filter({ ativo: true }),
      db.Autoridade.filter({ ativa: true }),
      db.DadosLoja.list(),
    ]);
    setIrmaos(irms);
    setAutoridades(auts);
    setDadosLoja(loja[0] || null);

    if (sessaoId) {
      const [sess, quadro] = await Promise.all([
        db.Sessao.filter({ id: sessaoId }),
        db.QuadroOficiais.filter({ exercicio: new Date().getFullYear().toString() }),
      ]);
      if (sess.length > 0) setSessao(sess[0]);

      // Ordenar quadro pela ordem de exibição definida
      const linhaOficiais = [...quadro]
        .sort((a, b) => {
          const ia = CARGOS_ORDEM_EXIBICAO.indexOf(a.cargo);
          const ib = CARGOS_ORDEM_EXIBICAO.indexOf(b.cargo);
          const pa = ia === -1 ? 999 : ia;
          const pb = ib === -1 ? 999 : ib;
          return pa - pb;
        })
        .map(q => ({
          cargo: q.cargo,
          titular_id: q.titular_id || "",
          titular_nome: q.titular_nome || "",
          confirmado: false,
          substituto_id: "",
          substituto_nome: "",
        }));
      // Tentar restaurar dados salvos
      if (sess.length > 0 && sess[0].preparacao_json) {
        try {
          const salvo = JSON.parse(sess[0].preparacao_json);
          if (salvo.quadroOficiais) {
            // Mesclar: preservar estrutura atual mas restaurar confirmados/substitutos
            const restaurado = linhaOficiais.map(o => {
              const salvoItem = salvo.quadroOficiais.find(s => s.cargo === o.cargo);
              return salvoItem ? { ...o, confirmado: salvoItem.confirmado, substituto_id: salvoItem.substituto_id || "", substituto_nome: salvoItem.substituto_nome || "" } : o;
            });
            setQuadroOficiais(restaurado);
          } else {
            setQuadroOficiais(linhaOficiais);
          }
          if (salvo.autoridadesLista) setAutoridadesLista(salvo.autoridadesLista);
          if (salvo.roteiro) setRoteiro(salvo.roteiro);
          setSavedAt(salvo.savedAt || null);
        } catch (e) {
          setQuadroOficiais(linhaOficiais);
        }
      } else {
        setQuadroOficiais(linhaOficiais);
      }
      setOficiais(quadro);
    }
    setLoading(false);
  };

  const salvarDados = async () => {
    if (!sessaoId) return;
    setSaving(true);
    const agora = new Date().toISOString();
    const dados = {
      quadroOficiais: quadroOficiais.map(o => ({ cargo: o.cargo, confirmado: o.confirmado, substituto_id: o.substituto_id, substituto_nome: o.substituto_nome })),
      autoridadesLista,
      roteiro,
      savedAt: agora,
    };
    await db.Sessao.update(sessaoId, { preparacao_json: JSON.stringify(dados) });
    setSavedAt(agora);
    setSaving(false);
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return "";
    const [y, m, d] = dataStr.split("-");
    return `${d}/${m}/${y}`;
  };

  const gerarPDF = () => {
    const dataFormatada = formatarData(sessao?.data);
    const nomeLoja = dadosLoja?.nome || "Loja Maçônica";
    const numLoja = dadosLoja?.numero || "";
    const potencia = dadosLoja?.potencia || "";
    const oriente = dadosLoja?.oriente || "";

    const imgLoja = logoLoja(dadosLoja);
    const imgGLP = logoPotencia(dadosLoja);

    // Cabeçalho padrão com as logos da Loja e da Potência (GLP)
    const cabecalho = (tituloDoc, subLinha = "") => `
  <div class="header">
    <img class="logo" src="${imgLoja}" alt="" onerror="this.style.visibility='hidden'"/>
    <div class="header-info">
      ${potencia ? `<div class="loja-potencia">${potencia}</div>` : ""}
      <div class="loja-nome">${nomeLoja}${numLoja ? ` nº${numLoja}` : ""}</div>
      ${oriente ? `<div class="loja-sub">Oriente de ${oriente}</div>` : ""}
      <div class="titulo-doc">${tituloDoc}</div>
      ${subLinha ? `<div class="loja-sub">${subLinha}</div>` : ""}
    </div>
    <img class="logo" src="${imgGLP}" alt="" onerror="this.style.visibility='hidden'"/>
  </div>`;

    // Separar autoridades presentes
    const autPresentes = autoridadesLista.filter(a => a.presente);

    // Ordenar roteiro por número
    const roteiroOrdenado = [...roteiro].sort((a, b) => a.numero - b.numero);

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Roteiro da Reunião — ${dataFormatada}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Times New Roman', serif; font-size: 11pt; color: #000; background: #fff; transform: scale(0.8); transform-origin: top left; width: 125%; }
  @page { size: A4; margin: 1.5cm 1.5cm 1.5cm 1.5cm; }

  .page { page-break-after: always; padding-bottom: 1.5cm; position: relative; }
  .page:last-child { page-break-after: avoid; }

  .header { display: flex; align-items: center; gap: 14px; text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
  .header .logo { height: 70px; width: 70px; object-fit: contain; flex-shrink: 0; }
  .header .header-info { flex: 1; }
  .header .loja-potencia { font-size: 9pt; text-transform: uppercase; letter-spacing: 1px; color: #444; }
  .header .loja-nome { font-size: 14pt; font-weight: bold; text-transform: uppercase; }
  .header .loja-sub { font-size: 10pt; color: #333; }
  .header .titulo-doc { font-size: 13pt; font-weight: bold; margin-top: 8px; }

  .section { margin-bottom: 16px; }
  .section-title { font-size: 11pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-bottom: 8px; }

  table { width: 100%; border-collapse: collapse; font-size: 10pt; }
  th { background: #1B3A5F; color: white; padding: 5px 8px; text-align: left; font-size: 10pt; }
  td { padding: 4px 8px; border-bottom: 1px solid #eee; vertical-align: middle; }
  tr:nth-child(even) td { background: #f9f9f9; }

  .simbolo { width: 22px; height: 16px; display: inline-flex; align-items: center; justify-content: center; }
  .simbolo svg { display: block; }
  .confirmado { color: green; font-weight: bold; }
  .ausente { color: #c00; }

  .roteiro-list { list-style: none; margin: 0; padding: 0; }
  .roteiro-item { margin-bottom: 2px; padding-bottom: 2px; display: flex; align-items: flex-start; gap: 8px; }
  .roteiro-num { font-weight: bold; min-width: 28px; }
  .roteiro-texto { flex: 1; margin: 0; padding: 0; min-height: 0; }
  .roteiro-subtexto { margin-top: 1px; margin-bottom: 0; padding-left: 20px; font-style: italic; color: #333; font-size: 10pt; }
  .roteiro-subtexto li { margin-bottom: 4px; list-style-type: lower-alpha; }

  .page-footer { border-top: 1px solid #ccc; padding-top: 4px; margin-top: 20px; font-size: 8pt; text-align: center; color: #666; }

  .aut-item { margin-bottom: 6px; padding: 5px 8px; border-bottom: 1px solid #ddd; }
  .aut-cargo { font-weight: bold; font-size: 10pt; }
  .aut-nome { font-size: 10pt; color: #333; margin-top: 1px; }
  .aut-potencia { font-size: 9pt; color: #666; font-style: italic; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { page-break-after: always; }
    .page:last-child { page-break-after: avoid; }
  }
</style>
</head>
<body>

<!-- PÁGINA 1: Cabeçalho + Tabela de Oficiais -->
<div class="page">
  ${cabecalho(`Roteiro da Reunião — ${dataFormatada}`, `${sessao?.tipo || ""} ${sessao?.hora ? `às ${sessao.hora}` : ""} ${sessao?.local ? `| ${sessao.local}` : ""}`)}

  <div class="section">
    <div class="section-title">Quadro de Oficiais Presentes</div>
    <table>
      <thead><tr><th style="width:30px"></th><th>Cargo</th><th>Irmão</th><th>Situação</th></tr></thead>
      <tbody>
        ${quadroOficiais.map(o => {
          const nome = o.substituto_nome || (o.confirmado ? o.titular_nome : '<span class="ausente">— Vago —</span>');
          const situacao = o.confirmado
            ? (o.substituto_nome ? '<span class="confirmado">✔ Presente (substituto)</span>' : '<span class="confirmado">✔ Presente</span>')
            : (o.substituto_nome ? '<span style="color:#855">✦ Substituto</span>' : '<span class="ausente">✘ Ausente</span>');
          return `<tr>
            <td><span class="simbolo">${svgCargo(o.cargo, 16)}</span></td>
            <td><strong>${o.cargo}</strong></td>
            <td>${nome || "—"}</td>
            <td>${situacao}</td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>
  </div>

  <div class="page-footer">${nomeLoja}${numLoja ? ` nº${numLoja}` : ""} — Roteiro da Reunião de ${dataFormatada} — Mestre de Cerimônias — Pág. 1</div>
</div>

<!-- PÁGINA 2: Ordem de Entrada + Autoridades -->
<div class="page">
  ${cabecalho(`Ordem de Entrada — ${dataFormatada}`)}

  <div class="section">
    <div class="section-title">Protocolo de Entrada no Templo</div>
    <table style="font-size:9pt; border-collapse:collapse; width:100%; margin-bottom:10px;">
      <tbody>
        <tr>
          <td style="border:1px solid #999;padding:4px 6px;font-weight:bold">1º - Aprendizes</td>
          <td style="border:1px solid #999;padding:4px 6px;font-weight:bold">2º - Companheiros</td>
          <td style="border:1px solid #999;padding:4px 6px;font-weight:bold">3º - Mestres</td>
        </tr>
        <tr>
          <td style="border:1px solid #999;padding:4px 6px">4º - Oficiais</td>
          <td style="border:1px solid #999;padding:4px 6px">5º - Dignidades (Or.: e Sec.:)</td>
          <td style="border:1px solid #999;padding:4px 6px">6º - Mestres Instalados</td>
        </tr>
        <tr>
          <td style="border:1px solid #999;padding:4px 6px">7º - 1º e 2º VVig.:</td>
          <td style="border:1px solid #999;padding:4px 6px">8º - Venerável Mestre</td>
          <td style="border:1px solid #999;padding:4px 6px">9º - Autoridades</td>
        </tr>
        <tr>
          <td style="border:1px solid #999;padding:4px 6px">QQf.: da GLP</td>
          <td style="border:1px solid #999;padding:4px 6px">Ministros do S.:T.:M.:</td>
          <td style="border:1px solid #999;padding:4px 6px">Grandes QQf.:</td>
        </tr>
        <tr>
          <td style="border:1px solid #999;padding:4px 6px">Eminente(s) Delegado(s)</td>
          <td style="border:1px solid #999;padding:4px 6px">Eminente Deputado</td>
          <td style="border:1px solid #999;padding:4px 6px">Ser.: Gr&#227;o Mestre</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Autoridades (nesta ordem de chamada)</div>
    <p style="margin-bottom:6px; font-style:italic; font-size:10pt;">&ldquo;Vener&#225;vel Mestre: o Templo encontra-se devidamente ornamentado, e pronto para darmos in&#237;cio aos nossos trabalhos.&rdquo;</p>
    <p style="margin-bottom:6px; font-size:10pt;">Ap&#243;s a fala do VM: <em><strong>&ldquo;Irm&#227;os Guarda do Templo e Mestre de Harmonia, ocupai vossos lugares.&rdquo;</strong></em></p>
    <p style="margin-bottom:6px; font-style:italic; font-size:10pt;">&ldquo;Encontra-se no &#193;trio (falar as autoridades)&rdquo;.</p>
    <p style="margin-bottom:10px; font-size:10pt;">Ap&#243;s a autoriza&#231;&#227;o do VM: &ldquo;(falar as Autoridades)...A ARLS Cavaleiros da Paz n&#186;25 tem a honra de receber-vos e o meu VM pede-vos que me acompanheis.&rdquo;</p>
    ${autPresentes.length > 0
      ? autPresentes.map((a, i) => {
          const cargo = [a.titulo, a.cargo_potencia].filter(Boolean).join(" — ");
          return `<div class="aut-item">
            <div class="aut-cargo">${i + 1}. ${cargo}</div>
            ${a.potencia ? `<div class="aut-potencia">${a.potencia}</div>` : ""}
            ${a.nome ? `<div class="aut-nome">${a.nome}</div>` : ""}
          </div>`;
        }).join("")
      : "<p style='color:#999; font-style:italic; font-size:10pt;'>Nenhuma autoridade confirmada.</p>"
    }
  </div>

  <div class="page-footer">${nomeLoja}${numLoja ? ` nº${numLoja}` : ""} — Roteiro da Reunião de ${dataFormatada} — Mestre de Cerimônias — Pág. 2</div>
</div>

<!-- PÁGINA 3: Roteiro da Reunião -->
<div class="page">
  ${cabecalho(`Roteiro da Reunião — ${dataFormatada}`)}

  <div class="section">
    <div class="section-title">Roteiro da Reunião</div>
    <ol class="roteiro-list">
      ${roteiroOrdenado.map(item => {
        const textoFormatado = (item.texto || "").replace(/\n/g, "<br>");
        const subtextoFormatado = (item.subtexto || "").replace(/\n/g, "<br>");
        if (!item.texto && !item.subtexto) return "";
        return `<li class="roteiro-item"><span class="roteiro-num">${item.numero}.</span><div class="roteiro-texto">${textoFormatado}${item.subtexto ? `<div class="roteiro-subtexto">${subtextoFormatado}</div>` : ""}</div></li>`;
      }).join("")}
    </ol>
  </div>

  <div class="page-footer">${nomeLoja}${numLoja ? ` nº${numLoja}` : ""} — Roteiro da Reunião de ${dataFormatada} — Mestre de Cerimônias — Pág. 3</div>
</div>

</body>
</html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.onload = () => win.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#1B3A5F] rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: "oficiais", label: "Oficiais", icon: Users },
    { id: "autoridades", label: "Autoridades", icon: Shield },
    { id: "roteiro", label: "Roteiro", icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("AdminAgendaRitual")}>
            <Button variant="ghost" size="icon" className="text-[#1B3A5F]"><ChevronLeft className="w-5 h-5" /></Button>
          </Link>
          <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
            <FileText className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A5F]">Preparar Reunião</h1>
            {sessao && (
              <p className="text-slate-500 text-sm">
                {sessao.tipo} — {formatarData(sessao.data)} às {sessao.hora}
                {sessao.local && ` | ${sessao.local}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {savedAt && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Salvo
            </span>
          )}
          <Button onClick={salvarDados} disabled={saving || !sessaoId} variant="outline" className="border-[#1B3A5F] text-[#1B3A5F]">
            <Save className="w-4 h-4 mr-2" />{saving ? "Salvando..." : "Salvar"}
          </Button>
          <Button onClick={gerarPDF} className="bg-[#C9A227] text-[#1B3A5F] font-semibold hover:bg-[#8B7019]">
            <Printer className="w-4 h-4 mr-2" /> Gerar PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? "bg-white text-[#1B3A5F] shadow" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Oficiais */}
      {activeTab === "oficiais" && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Confirme os oficiais presentes. Para os ausentes, selecione um substituto.</p>
          <OficiaisConfirmacao quadro={quadroOficiais} irmaos={irmaos} onChange={setQuadroOficiais} />
        </div>
      )}

      {/* Autoridades */}
      {activeTab === "autoridades" && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Adicione as autoridades esperadas. Confirme as presentes antes de gerar o PDF.</p>
          <AutoridadesList autoridades={autoridades} lista={autoridadesLista} onChange={setAutoridadesLista} />
        </div>
      )}

      {/* Roteiro */}
      {activeTab === "roteiro" && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Organize o roteiro da reunião. Os itens podem ser reordenados e editados.</p>
          <RoteiroReuniao itens={roteiro} onChange={setRoteiro} />
        </div>
      )}
    </div>
  );
}