import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { createPageUrl } from "@/utils";
import { 
  Loader2, Printer, Search, Calendar as CalendarIcon, 
  BookOpen, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BibRelatorios() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    acessos: [],
    downloads: [],
    emprestimos: [],
  });
  
  // Filtros de Data
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));

  useEffect(() => {
    const bibAuth = sessionStorage.getItem("bib_auth");
    if (bibAuth !== "true") {
      window.location.href = createPageUrl("BibLogin");
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Carregar um volume maior de dados para permitir filtragem local
      const [acessos, downloads, emprestimos] = await Promise.all([
        db.LogAcesso.list("-data_acesso", 1000),
        db.LogDownload.list("-data_download", 1000),
        db.Emprestimo.list("-data_retirada", 1000)
      ]);

      setData({ 
        acessos: acessos || [], 
        downloads: downloads || [], 
        emprestimos: emprestimos || []
      });
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtragem de Dados
  const filterByDate = (items, dateField) => {
    if (!startDate || !endDate) return items;
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    // Ajustar end para o final do dia
    end.setHours(23, 59, 59, 999);

    if (!isValid(start) || !isValid(end)) return items;

    return items.filter(item => {
      if (!item[dateField]) return false;
      const date = parseISO(item[dateField]);
      return isWithinInterval(date, { start, end });
    });
  };

  const filteredAcessos = filterByDate(data.acessos, "data_acesso");
  const filteredDownloads = filterByDate(data.downloads, "data_download");
  const filteredEmprestimos = filterByDate(data.emprestimos, "data_retirada");

  // Processamento para Ranking
  const getRanking = (list, keyFn, labelFn) => {
    const counts = list.reduce((acc, item) => {
      const key = keyFn(item);
      if (!key) return acc;
      if (!acc[key]) acc[key] = { label: labelFn(item), count: 0 };
      acc[key].count += 1;
      return acc;
    }, {});

    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10
  };

  const topAcessos = getRanking(filteredAcessos, i => i.irmao_id, i => i.irmao_nome);
  const topDownloadsIrmao = getRanking(filteredDownloads, i => i.irmao_id, i => i.irmao_nome);
  const topDownloadsDoc = getRanking(filteredDownloads, i => i.documento_id, i => i.documento_titulo);
  const topEmprestimosIrmao = getRanking(filteredEmprestimos, i => i.irmao_id, i => i.irmao_nome);
  const topEmprestimosItem = getRanking(filteredEmprestimos, i => i.item_id, i => i.item_nome);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B3A5F]" />
      </div>
    );
  }

  const ReportTable = ({ title, data, columns }) => (
    <div className="mb-8 break-inside-avoid">
      <h3 className="text-lg font-semibold text-[#1B3A5F] mb-2 px-1 border-l-4 border-[#C9A227] pl-2">
        {title}
      </h3>
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1B3A5F] text-white">
              <th className="py-2 px-4 text-left font-semibold">#</th>
              {columns.map((col, idx) => (
                <th key={idx} className="py-2 px-4 text-left font-semibold">{col}</th>
              ))}
              <th className="py-2 px-4 text-right font-semibold">Qtd.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length > 0 ? (
              data.map((item, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="py-2 px-4 text-slate-500 w-12">{idx + 1}</td>
                  <td className="py-2 px-4 text-slate-800 font-medium">{item.label}</td>
                  <td className="py-2 px-4 text-right text-slate-600">{item.count}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 2} className="py-4 text-center text-slate-400 italic">
                  Nenhum registro no período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Estilos de Impressão */}
      <style>{`
        @media print {
          @page { margin: 1.5cm; size: A4; }
          body { -webkit-print-color-adjust: exact; background: white; }
          nav, header, aside, .no-print { display: none !important; }
          main { margin: 0 !important; padding: 0 !important; }
          .page-break { page-break-before: always; }
          .break-inside-avoid { break-inside: avoid; }
        }
      `}</style>

      {/* Controles (Não imprime) */}
      <div className="no-print space-y-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Relatórios Gerenciais</h1>
            <p className="text-slate-500">Geração de relatórios estatísticos do sistema</p>
          </div>
          <Button onClick={handlePrint} className="bg-[#1B3A5F] hover:bg-[#15304d]">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir / Salvar PDF
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" /> Período do Relatório
                </label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <span className="text-slate-400">até</span>
                  <Input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="pb-1 text-sm text-slate-500">
                Total de Registros Carregados: {data.acessos.length + data.downloads.length + data.emprestimos.length}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Layout do Relatório (Modelo Solicitado) */}
      <div className="bg-white p-8 max-w-[210mm] mx-auto shadow-lg print:shadow-none print:p-0">
        
        {/* Cabeçalho do Relatório */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-20 h-20 flex items-center justify-center">
               {/* Placeholder Logo Esq */}
               <BookOpen className="w-16 h-16 text-[#1B3A5F]" />
            </div>
            <div className="text-center flex-1 px-4">
              <h1 className="text-2xl font-bold text-[#6A4C93] uppercase leading-tight">
                Biblioteca Cavaleiros da Paz nº25
              </h1>
              <h2 className="text-lg text-[#C9A227] uppercase font-semibold mt-1">
                Grande Loja do Paraná
              </h2>
              <h3 className="text-xl font-bold text-slate-800 mt-2">
                Relatório de Atividades e Estatísticas
              </h3>
            </div>
            <div className="w-20 h-20 flex items-center justify-center">
               {/* Placeholder Logo Dir - usando ícone genérico */}
               <div className="grid grid-cols-2 gap-1 w-12 h-12 opacity-80">
                 <div className="bg-[#6A4C93] rounded-sm"></div>
                 <div className="bg-[#C9A227] rounded-sm"></div>
                 <div className="bg-[#1982C4] rounded-sm"></div>
                 <div className="bg-[#8AC926] rounded-sm"></div>
               </div>
            </div>
          </div>
          
          {/* Linha Divisória Colorida */}
          <div className="h-2 w-full bg-gradient-to-r from-[#6A4C93] via-[#1982C4] to-[#8AC926] rounded-full mb-6"></div>

          {/* Caixa de Resumo */}
          <div className="bg-slate-100 rounded-lg p-4 flex flex-wrap justify-between items-center text-sm border border-slate-200">
            <div>
              <span className="font-bold text-slate-700">Data de Geração:</span>{" "}
              {format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </div>
            <div>
              <span className="font-bold text-slate-700">Período:</span>{" "}
              {startDate ? format(parseISO(startDate), "dd/MM/yyyy") : "Início"} até{" "}
              {endDate ? format(parseISO(endDate), "dd/MM/yyyy") : "Fim"}
            </div>
            <div>
              <span className="font-bold text-slate-700">Total de Eventos no Período:</span>{" "}
              {filteredAcessos.length + filteredDownloads.length + filteredEmprestimos.length}
            </div>
          </div>
        </header>

        {/* Conteúdo do Relatório */}
        <div className="space-y-2">
          
          {/* 1. Acessos */}
          <ReportTable 
            title="Ranking de Acessos ao Portal (Login)"
            data={topAcessos}
            columns={["Nome do Irmão"]}
          />

          {/* 2. Downloads por Irmão */}
          <ReportTable 
            title="Ranking de Downloads Realizados por Irmão"
            data={topDownloadsIrmao}
            columns={["Nome do Irmão"]}
          />

          {/* 3. Popularidade Acervo Digital */}
          <ReportTable 
            title="Popularidade do Acervo Digital (Mais Baixados)"
            data={topDownloadsDoc}
            columns={["Título do Documento"]}
          />

          <div className="print:page-break"></div>

          {/* 4. Empréstimos por Irmão */}
          <ReportTable 
            title="Ranking de Empréstimos Realizados por Irmão"
            data={topEmprestimosIrmao}
            columns={["Nome do Irmão"]}
          />

          {/* 5. Popularidade Acervo Físico */}
          <ReportTable 
            title="Popularidade do Acervo Físico (Mais Retirados)"
            data={topEmprestimosItem}
            columns={["Nome do Item"]}
          />

        </div>

        {/* Rodapé */}
        <footer className="mt-12 pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
          <p>Sistema de Gestão - Biblioteca Cavaleiros da Paz nº25</p>
          <p>Relatório gerado eletronicamente em {format(new Date(), "dd/MM/yyyy HH:mm")}</p>
        </footer>

      </div>
    </div>
  );
}