import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { 
  BookOpen, Users, History, QrCode, LogOut, 
  Menu, X, Home, Library, BookMarked, BarChart,
  Crown, Calendar, DollarSign, FileText, Award,
  Gavel, ClipboardList, Shield, Star, Heart, Music, ListMusic, Upload, Settings, Timer,
  ClipboardCheck, Mail, LayoutGrid, HeartHandshake
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import PortalHeader from "@/components/navigation/PortalHeader";
import PortalNavigation from "@/components/navigation/PortalNavigation";

const LOGO_URL = "https://media.base44.com/images/public/69aea997b473b479398fe231/9a3f4b5ac_LogoCavaleirosAlta.png";

// Links por cargo no portal administrativo
const ADMIN_LINKS_BY_CARGO = {
  "Venerável Mestre": [
    { name: "Painel Geral", page: "AdminVM", icon: Crown },
    { name: "Portais dos Cargos", page: "AdminPortais", icon: LayoutGrid },
    { name: "Pareceres do Orador", page: "AdminPareceres", icon: Gavel },
    { name: "Ação Social", page: "AdminAcaoSocial", icon: HeartHandshake },
    { name: "Expedientes e Pranchas", page: "AdminExpedientes", icon: Mail },
    { name: "Visitantes e Ordem do Dia", page: "AdminVisitantes", icon: Users },
    { name: "Balaústre (Ata)", page: "AdminBalaustre", icon: FileText },
    { name: "Quadro de Oficiais", page: "AdminQuadroOficiais", icon: Award },
    { name: "Sessões", page: "AdminSessoes", icon: Gavel },
    { name: "Trabalhos e Instruções", page: "AdminTrabalhos", icon: ClipboardCheck },
    { name: "Comissões", page: "AdminComissoes", icon: Users },
    { name: "Membros", page: "AdminMembros", icon: Users },
    { name: "Cadastro de Irmãos", page: "AdminCadastroIrmaos", icon: Users },
    { name: "Autoridades", page: "AdminAutoridades", icon: Shield },
    { name: "Agenda Ritual", page: "AdminAgendaRitual", icon: Calendar },
    { name: "Mensalidades", page: "AdminMensalidades", icon: DollarSign },
    { name: "Rel. Financeiro", page: "AdminRelatorioFinanceiro", icon: BarChart },
    { name: "QR de Presença", page: "AdminListaPresencaQR", icon: QrCode },
    { name: "Presenças", page: "AdminPresencas", icon: ClipboardList },
    { name: "Frequências", page: "AdminFrequencias", icon: BarChart },
    { name: "Hospitaleiro", page: "AdminHospitaleiro", icon: Heart },
    { name: "Hist. Contatos", page: "AdminHistoricoContatos", icon: History },
    { name: "Atestados", page: "AdminAtestados", icon: Award },
    { name: "Comunicados", page: "AdminComunicados", icon: ClipboardList },
    { name: "Dados da Loja", page: "AdminDadosLoja", icon: Star },
    { name: "Relatórios", page: "AdminRelatorios", icon: BarChart },
  ],
  "Primeiro Vigilante": [
    { name: "Painel do Vigilante", page: "AdminVigilantes", icon: Users },
    { name: "Trabalhos e Instruções", page: "AdminTrabalhos", icon: ClipboardCheck },
    { name: "Agenda Ritual", page: "AdminAgendaRitual", icon: Calendar },
    { name: "Presenças", page: "AdminPresencas", icon: ClipboardList },
    { name: "Frequências", page: "AdminFrequencias", icon: BarChart },
  ],
  "Segundo Vigilante": [
    { name: "Painel do Vigilante", page: "AdminVigilantes", icon: Users },
    { name: "Trabalhos e Instruções", page: "AdminTrabalhos", icon: ClipboardCheck },
    { name: "Agenda Ritual", page: "AdminAgendaRitual", icon: Calendar },
    { name: "Presenças", page: "AdminPresencas", icon: ClipboardList },
    { name: "Frequências", page: "AdminFrequencias", icon: BarChart },
  ],
  "Mestre de Cerimônias": [
    { name: "Painel MC", page: "AdminMC", icon: Star },
    { name: "Quadro de Oficiais", page: "AdminQuadroOficiais", icon: Award },
    { name: "Autoridades", page: "AdminAutoridades", icon: Shield },
    { name: "Agenda Ritual", page: "AdminAgendaRitual", icon: Calendar },
  ],
  "Hospitaleiro": [
    { name: "Painel Hospitaleiro", page: "AdminHospitaleiro", icon: Heart },
    { name: "Histórico Contatos", page: "AdminHistoricoContatos", icon: History },
    { name: "Presenças", page: "AdminPresencas", icon: ClipboardList },
    { name: "Frequências", page: "AdminFrequencias", icon: BarChart },
  ],
  "Tesoureiro": [
    { name: "Painel Financeiro", page: "AdminTesoureiro", icon: DollarSign },
    { name: "Mensalidades", page: "AdminMensalidades", icon: FileText },
    { name: "Relatório Financeiro", page: "AdminRelatorioFinanceiro", icon: BarChart },
  ],
  "Secretário": [
    { name: "Painel Secretaria", page: "AdminSecretario", icon: FileText },
    { name: "Balaústre (Ata)", page: "AdminBalaustre", icon: FileText },
    { name: "QR de Presença", page: "AdminListaPresencaQR", icon: QrCode },
    { name: "Expedientes e Pranchas", page: "AdminExpedientes", icon: Mail },
    { name: "Ação Social", page: "AdminAcaoSocial", icon: HeartHandshake },
    { name: "Visitantes e Ordem do Dia", page: "AdminVisitantes", icon: Users },
    { name: "Cadastro de Irmãos", page: "AdminCadastroIrmaos", icon: Users },
    { name: "Presenças", page: "AdminPresencas", icon: ClipboardList },
    { name: "Certidão de Regularidade", page: "AdminAtestados", icon: Award },
  ],
  "Secretário de Ação Social": [
    { name: "Ação Social", page: "AdminAcaoSocial", icon: HeartHandshake },
    { name: "Expedientes e Pranchas", page: "AdminExpedientes", icon: Mail },
    { name: "Agenda Ritual", page: "AdminAgendaRitual", icon: Calendar },
  ],
  "Chanceler": [
    { name: "Painel Chancelaria", page: "AdminChanceler", icon: FileText },
    { name: "QR de Presença", page: "AdminListaPresencaQR", icon: QrCode },
    { name: "Presenças", page: "AdminPresencas", icon: ClipboardList },
    { name: "Visitantes e Autoridades", page: "AdminVisitantes", icon: Users },
    { name: "Frequências", page: "AdminFrequencias", icon: BarChart },
    { name: "Comunicados", page: "AdminComunicados", icon: ClipboardList },
  ],
  "Orador": [
    { name: "Painel do Orador", page: "AdminOrador", icon: Gavel },
    { name: "Pareceres", page: "AdminPareceres", icon: Gavel },
    { name: "Trabalhos e Instruções", page: "AdminTrabalhos", icon: ClipboardCheck },
    { name: "Visitantes e Autoridades", page: "AdminVisitantes", icon: Users },
    { name: "Expedientes e Pranchas", page: "AdminExpedientes", icon: Mail },
    { name: "Balaústre (Ata)", page: "AdminBalaustre", icon: FileText },
    { name: "Agenda Ritual", page: "AdminAgendaRitual", icon: Calendar },
  ],
  "Mestre de Harmonia": [
    { name: "Painel Harmonia", page: "AdminMestreHarmonia", icon: Music },
    { name: "Agenda Ritual", page: "AdminAgendaRitual", icon: Calendar },
    { name: "Pastas de Músicas", page: "AdminMeusMp3s", icon: ListMusic },
    { name: "Tempos das Etapas", page: "AdminEstatisticasHarmonia", icon: Timer },
    { name: "Músicas Mais Tocadas", page: "AdminMusicasMaisTocadas", icon: BarChart },
    { name: "Configuração de Player", page: "AdminConfigPlayer", icon: Settings },
    { name: "Configurações", page: "AdminConfigEtapasHarmonia", icon: Settings },
  ],
  "Bibliotecário": [
    { name: "Dashboard", page: "BibDashboard", icon: Home },
    { name: "Acervo", page: "BibAcervo", icon: Library },
    { name: "Acervo Digital", page: "BibAcervoDigital", icon: BookOpen },
    { name: "Irmãos", page: "BibIrmaos", icon: Users },
    { name: "Empréstimos", page: "BibEmprestimos", icon: BookMarked },
    { name: "Log de Acessos", page: "BibLogAcessos", icon: History },
    { name: "Log de Downloads", page: "BibLogDownloads", icon: History },
    { name: "QR Codes", page: "BibQRCodes", icon: QrCode },
    { name: "Aprovações", page: "BibAprovacoes", icon: ClipboardCheck },
    { name: "Relatórios", page: "BibRelatorios", icon: BarChart },
  ],
};

const IRMAO_LINKS = [
  { name: "Meu Portal", page: "IrmaoPortal", icon: Home },
  { name: "Meus Empréstimos", page: "IrmaoEmprestimos", icon: BookMarked },
  { name: "Acervo Físico", page: "IrmaoAcervo", icon: Library },
  { name: "Acervo Digital", page: "IrmaoAcervoDigital", icon: BookOpen },
  { name: "Escanear QR", page: "IrmaoScan", icon: QrCode },
  { name: "Minhas Sugestões", page: "IrmaoSugestoes", icon: BookOpen },
];

const PAGES_SEM_LAYOUT = ["Home", "Portais", "ScanRetirada", "ScanDevolucao", "BibLogin", "IrmaoLogin", "AdminLogin", "AcervoPublico"];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cargo, setCargo] = useState(null);

  useEffect(() => {
    loadUser();
  }, [currentPageName]);

  const loadUser = () => {
    // Portal Administrativo
    const adminData = sessionStorage.getItem("admin_data");
    if (adminData) {
      const admin = JSON.parse(adminData);
      setUser({ full_name: admin.nome_completo, cim: admin.cim });
      // Portal escolhido no login (pode ser substituição), com fallback ao cargo do cadastro
      setCargo(sessionStorage.getItem("admin_cargo") || admin.cargo);
      return;
    }
    // Portal Bibliotecário
    const bibData = sessionStorage.getItem("bib_data");
    if (bibData) {
      const bib = JSON.parse(bibData);
      setUser({ full_name: bib.nome });
      setCargo("Bibliotecário");
      return;
    }
    // Portal Irmão
    const irmaoData = sessionStorage.getItem("irmao_data");
    if (irmaoData) {
      const ir = JSON.parse(irmaoData);
      setUser({ full_name: ir.nome_completo, cim: ir.cim });
      setCargo("Irmão");
      return;
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    sessionStorage.removeItem("admin_data");
    sessionStorage.removeItem("admin_cargo");
    sessionStorage.removeItem("bib_auth");
    sessionStorage.removeItem("bib_data");
    sessionStorage.removeItem("bib_auth_time");
    sessionStorage.removeItem("irmao_auth");
    sessionStorage.removeItem("irmao_data");
    window.location.href = createPageUrl("Home");
  };

  if (PAGES_SEM_LAYOUT.includes(currentPageName)) {
    return <>{children}</>;
  }

  const isBibliotecario = cargo === "Bibliotecário";
  const isAdmin = currentPageName?.startsWith("Admin") || currentPageName?.startsWith("Bib");
  const isIrmao = currentPageName?.startsWith("Irmao");

  let links = IRMAO_LINKS;
  let portalLabel = "Portal do Irmão";

  if (isAdmin || isBibliotecario) {
    links = ADMIN_LINKS_BY_CARGO[cargo] || [];
    portalLabel = cargo || "Portal Administrativo";
  }

  return (
    <div className="min-h-screen bg-lodge-canvas">
      <style>{`
        :root {
          --primary-gold: #C9A227;
          --primary-blue: #1B3A5F;
          --light-gold: #F5E6B3;
        }
      `}</style>

      <PortalHeader logo={LOGO_URL} cargo={cargo} portalLabel={portalLabel} user={user} isIrmao={isIrmao} sidebarOpen={sidebarOpen} onToggleMenu={() => setSidebarOpen(!sidebarOpen)} onLogout={handleLogout} />

      {/* Sidebar */}
      <aside id="portal-navigation" className={`
        fixed top-16 left-0 bottom-0 w-64 bg-card border-r border-border z-40
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}>
        <PortalNavigation links={links} currentPageName={currentPageName} onNavigate={() => setSidebarOpen(false)} />
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}