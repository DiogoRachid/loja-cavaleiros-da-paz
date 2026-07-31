/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AcervoPublico from './pages/AcervoPublico';
import AdminAgendaRitual from './pages/AdminAgendaRitual';
import AdminAtestados from './pages/AdminAtestados';
import AdminAutoridades from './pages/AdminAutoridades';
import AdminCadastroIrmaos from './pages/AdminCadastroIrmaos';
import AdminChanceler from './pages/AdminChanceler';
import AdminComissoes from './pages/AdminComissoes';
import AdminComunicados from './pages/AdminComunicados';
import AdminDadosLoja from './pages/AdminDadosLoja';
import AdminFrequencias from './pages/AdminFrequencias';
import AdminLogin from './pages/AdminLogin';
import AdminMC from './pages/AdminMC';
import AdminMembros from './pages/AdminMembros';
import AdminMensalidades from './pages/AdminMensalidades';
import AdminOrdemEntrada from './pages/AdminOrdemEntrada';
import AdminPresencas from './pages/AdminPresencas';
import AdminQuadroOficiais from './pages/AdminQuadroOficiais';
import AdminRelatorioFinanceiro from './pages/AdminRelatorioFinanceiro';
import AdminRelatorios from './pages/AdminRelatorios';
import AdminSecretario from './pages/AdminSecretario';
import AdminSessoes from './pages/AdminSessoes';
import AdminTesoureiro from './pages/AdminTesoureiro';
import AdminVM from './pages/AdminVM';
import BibAcervo from './pages/BibAcervo';
import BibAcervoDigital from './pages/BibAcervoDigital';
import BibAprovacoes from './pages/BibAprovacoes';
import BibBibliotecarios from './pages/BibBibliotecarios';
import BibDashboard from './pages/BibDashboard';
import BibEmprestimos from './pages/BibEmprestimos';
import BibIrmaos from './pages/BibIrmaos';
import BibLogAcessos from './pages/BibLogAcessos';
import BibLogDownloads from './pages/BibLogDownloads';
import BibLogin from './pages/BibLogin';
import BibQRCodes from './pages/BibQRCodes';
import BibRelatorios from './pages/BibRelatorios';
import Home from './pages/Home';
import IrmaoAcervo from './pages/IrmaoAcervo';
import IrmaoAcervoDigital from './pages/IrmaoAcervoDigital';
import IrmaoConfiguracoes from './pages/IrmaoConfiguracoes';
import IrmaoEmprestimos from './pages/IrmaoEmprestimos';
import IrmaoLogin from './pages/IrmaoLogin';
import IrmaoPortal from './pages/IrmaoPortal';
import IrmaoScan from './pages/IrmaoScan';
import IrmaoSugestoes from './pages/IrmaoSugestoes';
import ScanDevolucao from './pages/ScanDevolucao';
import ScanRetirada from './pages/ScanRetirada';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AcervoPublico": AcervoPublico,
    "AdminAgendaRitual": AdminAgendaRitual,
    "AdminAtestados": AdminAtestados,
    "AdminAutoridades": AdminAutoridades,
    "AdminCadastroIrmaos": AdminCadastroIrmaos,
    "AdminChanceler": AdminChanceler,
    "AdminComissoes": AdminComissoes,
    "AdminComunicados": AdminComunicados,
    "AdminDadosLoja": AdminDadosLoja,
    "AdminFrequencias": AdminFrequencias,
    "AdminLogin": AdminLogin,
    "AdminMC": AdminMC,
    "AdminMembros": AdminMembros,
    "AdminMensalidades": AdminMensalidades,
    "AdminOrdemEntrada": AdminOrdemEntrada,
    "AdminPresencas": AdminPresencas,
    "AdminQuadroOficiais": AdminQuadroOficiais,
    "AdminRelatorioFinanceiro": AdminRelatorioFinanceiro,
    "AdminRelatorios": AdminRelatorios,
    "AdminSecretario": AdminSecretario,
    "AdminSessoes": AdminSessoes,
    "AdminTesoureiro": AdminTesoureiro,
    "AdminVM": AdminVM,
    "BibAcervo": BibAcervo,
    "BibAcervoDigital": BibAcervoDigital,
    "BibAprovacoes": BibAprovacoes,
    "BibBibliotecarios": BibBibliotecarios,
    "BibDashboard": BibDashboard,
    "BibEmprestimos": BibEmprestimos,
    "BibIrmaos": BibIrmaos,
    "BibLogAcessos": BibLogAcessos,
    "BibLogDownloads": BibLogDownloads,
    "BibLogin": BibLogin,
    "BibQRCodes": BibQRCodes,
    "BibRelatorios": BibRelatorios,
    "Home": Home,
    "IrmaoAcervo": IrmaoAcervo,
    "IrmaoAcervoDigital": IrmaoAcervoDigital,
    "IrmaoConfiguracoes": IrmaoConfiguracoes,
    "IrmaoEmprestimos": IrmaoEmprestimos,
    "IrmaoLogin": IrmaoLogin,
    "IrmaoPortal": IrmaoPortal,
    "IrmaoScan": IrmaoScan,
    "IrmaoSugestoes": IrmaoSugestoes,
    "ScanDevolucao": ScanDevolucao,
    "ScanRetirada": ScanRetirada,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};