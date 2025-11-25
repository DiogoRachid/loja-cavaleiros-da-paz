import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { 
  Loader2, Printer, FileText, BookOpen, Users, LogIn, Download 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BibRelatorios() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    acessos: [],
    downloads: [],
    emprestimos: [],
    irmaos: [],
    items: [],
    docs: []
  });

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
      // Carregar dados com limite de 500 para evitar timeouts
      const [acessos, downloads, emprestimos] = await Promise.all([
        base44.entities.LogAcesso.list("-data_acesso", 500),
        base44.entities.LogDownload.list("-data_download", 500),
        base44.entities.Emprestimo.list("-data_retirada", 500)
      ]);

      setData({ 
        acessos: acessos || [], 
        downloads: downloads || [], 
        emprestimos: emprestimos || [],
        irmaos: [],
        items: [],
        docs: []
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B3A5F]" />
      </div>
    );
  }

  const countBy = (list, keyFn) => {
    if (!list) return [];
    const counts = list.reduce((acc, item) => {
      const key = keyFn(item) || "Desconhecido";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  };

  // Processamento dos dados
  const topAcessos = countBy(data.acessos, log => log.irmao_nome);
  const topDownloaders = countBy(data.downloads, log => log.irmao_nome);
  const topBorrowers = countBy(data.emprestimos, emp => emp.irmao_nome);
  const topDownloadsDocs = countBy(data.downloads, log => log.documento_titulo);
  const topBorrowedItems = countBy(data.emprestimos, emp => emp.item_nome);

  return (
    <div className="space-y-8 print:space-y-6 print:p-0">
      <style>{`
        @media print {
          @page { margin: 2cm; }
          body { -webkit-print-color-adjust: exact; }
          nav, header, aside, .no-print { display: none !important; }
          main { margin: 0 !important; padding: 0 !important; }
          .card { break-inside: avoid; border: 1px solid #ddd; box-shadow: none; }
        }
      `}</style>

      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Relatórios do Sistema</h1>
          <p className="text-slate-500">Estatísticas de uso e engajamento</p>
        </div>
        <Button onClick={handlePrint} className="bg-[#1B3A5F] hover:bg-[#15304d]">
          <Printer className="w-4 h-4 mr-2" />
          Imprimir Relatório
        </Button>
      </div>

      <div className="hidden print:block mb-8 text-center border-b pb-4">
        <h1 className="text-2xl font-bold text-[#1B3A5F]">Relatório de Atividades</h1>
        <p className="text-slate-500">Biblioteca Cavaleiros da Paz nº25</p>
        <p className="text-sm text-slate-400 mt-1">Gerado em {new Date().toLocaleDateString()}</p>
      </div>

      {/* Seção 1: Engajamento dos Irmãos */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <Users className="w-5 h-5 text-[#C9A227]" />
          <h2 className="text-xl font-semibold text-slate-800">Engajamento dos Irmãos</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <LogIn className="w-4 h-4 text-blue-500" />
                Mais Acessos ao Portal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {topAcessos.map(([nome, qtd], idx) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-700 truncate mr-2">{idx + 1}. {nome}</span>
                    <Badge variant="secondary">{qtd}</Badge>
                  </li>
                ))}
                {topAcessos.length === 0 && <li className="text-sm text-slate-400">Sem dados</li>}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-500" />
                Mais Downloads Realizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {topDownloaders.map(([nome, qtd], idx) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-700 truncate mr-2">{idx + 1}. {nome}</span>
                    <Badge variant="secondary">{qtd}</Badge>
                  </li>
                ))}
                {topDownloaders.length === 0 && <li className="text-sm text-slate-400">Sem dados</li>}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                Mais Empréstimos Realizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {topBorrowers.map(([nome, qtd], idx) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-700 truncate mr-2">{idx + 1}. {nome}</span>
                    <Badge variant="secondary">{qtd}</Badge>
                  </li>
                ))}
                {topBorrowers.length === 0 && <li className="text-sm text-slate-400">Sem dados</li>}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Seção 2: Popularidade do Acervo */}
      <section className="space-y-4 pt-4 print:break-before-auto">
        <div className="flex items-center gap-2 border-b pb-2">
          <FileText className="w-5 h-5 text-[#C9A227]" />
          <h2 className="text-xl font-semibold text-slate-800">Popularidade do Acervo</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                Trabalhos Digitais Mais Baixados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {topDownloadsDocs.map(([titulo, qtd], idx) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-700 truncate mr-2">{idx + 1}. {titulo}</span>
                    <Badge variant="secondary">{qtd}</Badge>
                  </li>
                ))}
                {topDownloadsDocs.length === 0 && <li className="text-sm text-slate-400">Sem dados</li>}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                Livros Mais Retirados (Físico)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {topBorrowedItems.map(([nome, qtd], idx) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-700 truncate mr-2">{idx + 1}. {nome}</span>
                    <Badge variant="secondary">{qtd}</Badge>
                  </li>
                ))}
                {topBorrowedItems.length === 0 && <li className="text-sm text-slate-400">Sem dados</li>}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}