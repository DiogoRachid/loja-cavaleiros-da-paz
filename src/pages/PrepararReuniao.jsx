import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, Users, Shield, ClipboardList, Printer, Save, ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import OficiaisConfirmacao from "@/components/reuniao/OficiaisConfirmacao";
import AutoridadesList from "@/components/reuniao/AutoridadesList";
import RoteiroReuniao, { ITENS_PADRAO } from "@/components/reuniao/RoteiroReuniao";

// Símbolos/ícones por cargo (texto)
const SIMBOLO_CARGO = {
  "Venerável Mestre": "☉",
  "Primeiro Vigilante": "△",
  "Segundo Vigilante": "▽",
  "Orador": "⚖",
  "Secretário": "✒",
  "Tesoureiro": "⚷",
  "Chanceler": "✦",
  "Mestre de Cerimônias": "⚜",
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

const CARGOS_ORDEM_ENTRADA = [
  "Guarda Externo","Guarda Interno","Segundo Diácono","Primeiro Diácono",
  "Mestre de Cerimônias","Porta Espada","Porta Bandeira","Músico","Hospitaleiro",
  "Chanceler","Tesoureiro","Secretário","Arquiteto","Orador",
  "Segundo Vigilante","Primeiro Vigilante","Venerável Mestre",
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
  const [activeTab, setActiveTab] = useState("oficiais");
  const [dadosLoja, setDadosLoja] = useState(null);

  useEffect(() => {
    loadDados();
  }, [sessaoId]);

  const loadDados = async () => {
    setLoading(true);
    const [irms, auts, loja] = await Promise.all([
      base44.entities.Irmao.filter({ ativo: true }),
      base44.entities.Autoridade.filter({ ativa: true }),
      base44.entities.DadosLoja.list(),
    ]);
    setIrmaos(irms);
    setAutoridades(auts);
    setDadosLoja(loja[0] || null);

    if (sessaoId) {
      const [sess, quadro] = await Promise.all([
        base44.entities.Sessao.filter({ id: sessaoId }),
        base44.entities.QuadroOficiais.filter({ exercicio: new Date().getFullYear().toString() }),
      ]);
      if (sess.length > 0) setSessao(sess[0]);

      // Montar lista com os cargos exatamente como cadastrados no quadro
      const linhaOficiais = quadro.map(q => ({
        cargo: q.cargo,
        titular_id: q.titular_id || "",
        titular_nome: q.titular_nome || "",
        confirmado: false,
        substituto_id: "",
        substituto_nome: "",
      }));
      setQuadroOficiais(linhaOficiais);
      setOficiais(quadro);
    }
    setLoading(false);
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
  body { font-family: 'Times New Roman', serif; font-size: 11pt; color: #000; background: #fff; }
  @page { size: A4; margin: 2cm 2cm 2.5cm 2cm; }
  
  .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
  .header .loja-nome { font-size: 14pt; font-weight: bold; text-transform: uppercase; }
  .header .loja-sub { font-size: 10pt; color: #333; }
  .header .titulo-doc { font-size: 13pt; font-weight: bold; margin-top: 8px; }
  
  .section { margin-bottom: 18px; }
  .section-title { font-size: 11pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-bottom: 8px; }
  
  table { width: 100%; border-collapse: collapse; font-size: 10pt; }
  th { background: #1B3A5F; color: white; padding: 5px 8px; text-align: left; font-size: 10pt; }
  td { padding: 4px 8px; border-bottom: 1px solid #eee; vertical-align: middle; }
  tr:nth-child(even) td { background: #f9f9f9; }
  
  .simbolo { font-size: 14pt; width: 20px; display: inline-block; text-align: center; }
  .confirmado { color: green; font-weight: bold; }
  .ausente { color: #c00; }
  
  .roteiro-list { list-style: none; }
  .roteiro-item { margin-bottom: 6px; display: flex; align-items: flex-start; gap: 8px; }
  .roteiro-num { font-weight: bold; min-width: 28px; }
  .roteiro-texto { flex: 1; }
  .roteiro-subtexto { margin-top: 3px; padding-left: 20px; font-style: italic; color: #333; font-size: 10pt; }
  .roteiro-subtexto li { margin-bottom: 4px; list-style-type: lower-alpha; }

  .footer { position: fixed; bottom: 0; left: 0; right: 0; font-size: 8pt; text-align: center; color: #666; border-top: 1px solid #ccc; padding: 4px 2cm; }
  
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>

<div class="header">
  <div class="loja-nome">${nomeLoja}${numLoja ? ` nº${numLoja}` : ""}</div>
  ${potencia ? `<div class="loja-sub">${potencia}${oriente ? ` — Oriente de ${oriente}` : ""}</div>` : ""}
  <div class="titulo-doc">Roteiro da Reunião — ${dataFormatada}</div>
  <div class="loja-sub">${sessao?.tipo || ""} ${sessao?.hora ? `às ${sessao.hora}` : ""} ${sessao?.local ? `| ${sessao.local}` : ""}</div>
</div>

<div class="section">
  <div class="section-title">Ordem de Entrada dos Oficiais</div>
  <table>
    <thead><tr><th style="width:30px"></th><th>Cargo</th><th>Irmão</th><th>Situação</th></tr></thead>
    <tbody>
      ${quadroOficiais.map(o => {
        const nome = o.confirmado ? o.titular_nome : (o.substituto_nome || '<span class="ausente">— Vago —</span>');
        const situacao = o.confirmado
          ? '<span class="confirmado">✔ Presente</span>'
          : (o.substituto_nome ? '<span style="color:#855">✦ Substituto</span>' : '<span class="ausente">✘ Ausente</span>');
        return `<tr>
          <td class="simbolo">${SIMBOLO_CARGO[o.cargo] || "◆"}</td>
          <td><strong>${o.cargo}</strong></td>
          <td>${nome || "—"}</td>
          <td>${situacao}</td>
        </tr>`;
      }).join("")}
    </tbody>
  </table>
</div>

${autPresentes.length > 0 ? `
<div class="section">
  <div class="section-title">Autoridades Presentes</div>
  <table>
    <thead><tr><th>Título</th><th>Nome</th></tr></thead>
    <tbody>
      ${autPresentes.map(a => `<tr><td>${a.titulo}</td><td>${a.nome}</td></tr>`).join("")}
    </tbody>
  </table>
</div>
` : ""}

<div class="section">
  <div class="section-title">Roteiro da Reunião</div>
  <ol class="roteiro-list">
    ${roteiroOrdenado.map(item => `
    <li class="roteiro-item">
      <span class="roteiro-num">${item.numero}.</span>
      <div class="roteiro-texto">
        ${item.texto}
        ${item.subtexto ? `<div class="roteiro-subtexto"><ul><li>${item.subtexto}</li></ul></div>` : ""}
      </div>
    </li>`).join("")}
  </ol>
</div>

<div class="footer">
  ${nomeLoja}${numLoja ? ` nº${numLoja}` : ""} — Roteiro da Reunião de ${dataFormatada} — Mestre de Cerimônias
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
        <Button onClick={gerarPDF} className="bg-[#C9A227] text-[#1B3A5F] font-semibold hover:bg-[#8B7019]">
          <Printer className="w-4 h-4 mr-2" /> Gerar PDF / Imprimir
        </Button>
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