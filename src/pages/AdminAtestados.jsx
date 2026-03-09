import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Award, Search, Printer, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminAtestados() {
  const [irmaos, setIrmaos] = useState([]);
  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState(null);
  const [dadosLoja, setDadosLoja] = useState(null);
  const [quadro, setQuadro] = useState([]);

  useEffect(() => { loadDados(); }, []);

  const loadDados = async () => {
    const [ir, dl, q] = await Promise.all([
      base44.entities.Irmao.filter({ ativo: true }),
      base44.entities.DadosLoja.list(),
      base44.entities.QuadroOficiais.filter({ exercicio: new Date().getFullYear().toString() }),
    ]);
    setIrmaos(ir);
    setDadosLoja(dl[0] || null);
    setQuadro(q);
  };

  const filtrados = irmaos.filter(i =>
    !busca || i.nome_completo?.toLowerCase().includes(busca.toLowerCase()) || i.numero_glp?.includes(busca)
  );

  const getSecretario = () => quadro.find(q => q.cargo === "Secretário")?.titular_nome || "Secretário";
  const getVM = () => quadro.find(q => q.cargo === "Venerável Mestre")?.titular_nome || "Venerável Mestre";

  const imprimir = (ir) => {
    const hoje = new Date().toLocaleDateString("pt-BR");
    const LOGO_LOJA = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69aea997b473b479398fe231/0745f3cd0_logolojafundotransparente.png";
    const LOGO_GLP = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69aea997b473b479398fe231/a206157c9_LOGOGLP2023.png";
    const janela = window.open("", "_blank");
    janela.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Atestado de Regularidade</title>
        <style>
          body { font-family: 'Times New Roman', serif; max-width: 750px; margin: 40px auto; color: #000; line-height: 1.8; }
          .header-logos { display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #1B3A5F; padding-bottom:16px; margin-bottom:20px; }
          .header-center { text-align:center; flex:1; padding:0 20px; }
          .title { font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
          .subtitle { font-size: 13px; margin-top: 5px; color: #475569; }
          .doc-title { text-align:center; font-size:15px; font-weight:bold; color:#1B3A5F; text-transform:uppercase; letter-spacing:2px; margin:20px 0; }
          .body { text-align: justify; font-size: 14px; margin: 30px 0; }
          .assinaturas { display: flex; justify-content: space-between; margin-top: 80px; }
          .assinatura { text-align: center; width: 45%; }
          .assinatura .linha { border-top: 1px solid #000; margin-bottom: 5px; }
          .ornamento { text-align: center; font-size: 22px; color: #C9A227; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header-logos">
          <img src="${LOGO_LOJA}" style="height:80px;object-fit:contain" />
          <div class="header-center">
            <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px">${dadosLoja?.potencia || "Grande Loja Maçônica do Paraná"}</p>
            <div class="title" style="font-size:16px;color:#1B3A5F">${dadosLoja?.nome || "Loja Cavaleiros da Paz"} Nº ${dadosLoja?.numero || "25"}</div>
            <div class="subtitle">${dadosLoja?.oriente ? "Oriente de " + dadosLoja.oriente : ""}</div>
            <div class="subtitle">${dadosLoja?.endereco || ""}</div>
          </div>
          <img src="${LOGO_GLP}" style="height:80px;object-fit:contain" />
        </div>
        <div class="doc-title">ATESTADO DE REGULARIDADE</div>
        <div class="body">
          <p>O <strong>Secretário</strong> da Respeitável Loja <strong>${dadosLoja?.nome || ""} Nº ${dadosLoja?.numero || ""}</strong>, 
          no uso de suas atribuições regimentais, <strong>ATESTA</strong> que o Irmão</p>
          
          <p style="text-align:center; font-size:16px; font-weight:bold; margin:20px 0;">
            ${ir.nome_completo}
          </p>
          
          <p>inscrito na GLP sob o nº <strong>${ir.numero_glp || "—"}</strong>,
          grau <strong>${ir.grau}</strong>, cargo <strong>${ir.cargo !== "Nenhum" ? ir.cargo : "Irmão"}</strong>,
          encontra-se em situação <strong>REGULAR</strong> perante esta Respeitável Loja,
          com suas obrigações maçônicas devidamente cumpridas até a presente data.</p>
          
          <p>Por ser expressão da verdade, lavro o presente atestado para os fins que se fizerem necessários.</p>
          
          <p style="text-align:center; margin-top:30px;">
            Oriente de ${dadosLoja?.oriente || ""}, ${hoje}
          </p>
        </div>
        <div class="assinaturas">
          <div class="assinatura">
            <div class="linha"></div>
            <strong>${getSecretario()}</strong><br/>
            <small>Secretário</small>
          </div>
          <div class="assinatura">
            <div class="linha"></div>
            <strong>${getVM()}</strong><br/>
            <small>Venerável Mestre</small>
          </div>
        </div>
        <div class="ornamento" style="margin-top:40px;">G.·.A.·.D.·.U.·.</div>
      </body>
      </html>
    `);
    janela.document.close();
    janela.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
          <Award className="w-6 h-6 text-[#C9A227]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A5F]">Emissão de Atestados</h1>
          <p className="text-slate-500">Atestado de regularidade maçônica</p>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar irmão por nome ou Nº GLP..." className="pl-9" />
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {filtrados.map(ir => (
          <Card key={ir.id} className={`hover:shadow-md transition-shadow cursor-pointer ${selecionado?.id === ir.id ? "border-[#C9A227]" : ""}`}
            onClick={() => setSelecionado(selecionado?.id === ir.id ? null : ir)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1B3A5F]/10 flex items-center justify-center font-bold text-[#1B3A5F]">
                    {ir.nome_completo?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{ir.nome_completo}</p>
                    <p className="text-xs text-slate-500">Nº GLP: {ir.numero_glp} • {ir.grau}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={ir.situacao === "Regular" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {ir.situacao}
                  </Badge>
                  {ir.situacao === "Regular" && (
                    <Button size="sm" onClick={e => { e.stopPropagation(); imprimir(ir); }} className="bg-[#1B3A5F] text-white">
                      <Printer className="w-3 h-3 mr-1" /> Emitir
                    </Button>
                  )}
                </div>
              </div>
              {selecionado?.id === ir.id && (
                <div className="mt-3 pt-3 border-t text-sm text-slate-600 grid grid-cols-2 gap-2">
                  <span><b>Cargo:</b> {ir.cargo !== "Nenhum" ? ir.cargo : "Irmão"}</span>
                  <span><b>Nº GLP:</b> {ir.numero_glp || "—"}</span>
                  <span><b>Iniciação:</b> {ir.data_iniciacao || "—"}</span>
                  <span><b>Exaltação:</b> {ir.data_exaltacao || "—"}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filtrados.length === 0 && (
          <Card><CardContent className="p-8 text-center text-slate-400">Nenhum irmão encontrado.</CardContent></Card>
        )}
      </div>
    </div>
  );
}