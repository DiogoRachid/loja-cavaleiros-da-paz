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
import AdminChanceler from './pages/AdminChanceler';
import AdminLogin from './pages/AdminLogin';
import AdminMC from './pages/AdminMC';
import AdminSecretario from './pages/AdminSecretario';
import AdminTesoureiro from './pages/AdminTesoureiro';
import AdminVM from './pages/AdminVM';
import BibAcervo from './pages/BibAcervo';
import BibAcervoDigital from './pages/BibAcervoDigital';
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
import IrmaoEmprestimos from './pages/IrmaoEmprestimos';
import IrmaoLogin from './pages/IrmaoLogin';
import IrmaoScan from './pages/IrmaoScan';
import ScanDevolucao from './pages/ScanDevolucao';
import ScanRetirada from './pages/ScanRetirada';
import AdminQuadroOficiais from './pages/AdminQuadroOficiais';
import AdminSessoes from './pages/AdminSessoes';
import AdminComissoes from './pages/AdminComissoes';
import AdminMembros from './pages/AdminMembros';
import AdminRelatorios from './pages/AdminRelatorios';
import AdminAutoridades from './pages/AdminAutoridades';
import AdminOrdemEntrada from './pages/AdminOrdemEntrada';
import AdminAgendaRitual from './pages/AdminAgendaRitual';
import AdminMensalidades from './pages/AdminMensalidades';
import AdminRelatorioFinanceiro from './pages/AdminRelatorioFinanceiro';
import AdminCadastroIrmaos from './pages/AdminCadastroIrmaos';
import AdminPresencas from './pages/AdminPresencas';
import AdminAtestados from './pages/AdminAtestados';
import AdminFrequencias from './pages/AdminFrequencias';
import AdminComunicados from './pages/AdminComunicados';
import IrmaoPortal from './pages/IrmaoPortal';
import AdminDadosLoja from './pages/AdminDadosLoja';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminChanceler": AdminChanceler,
    "AdminLogin": AdminLogin,
    "AdminMC": AdminMC,
    "AdminSecretario": AdminSecretario,
    "AdminTesoureiro": AdminTesoureiro,
    "AdminVM": AdminVM,
    "BibAcervo": BibAcervo,
    "BibAcervoDigital": BibAcervoDigital,
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
    "IrmaoEmprestimos": IrmaoEmprestimos,
    "IrmaoLogin": IrmaoLogin,
    "IrmaoScan": IrmaoScan,
    "ScanDevolucao": ScanDevolucao,
    "ScanRetirada": ScanRetirada,
    "AdminQuadroOficiais": AdminQuadroOficiais,
    "AdminSessoes": AdminSessoes,
    "AdminComissoes": AdminComissoes,
    "AdminMembros": AdminMembros,
    "AdminRelatorios": AdminRelatorios,
    "AdminAutoridades": AdminAutoridades,
    "AdminOrdemEntrada": AdminOrdemEntrada,
    "AdminAgendaRitual": AdminAgendaRitual,
    "AdminMensalidades": AdminMensalidades,
    "AdminRelatorioFinanceiro": AdminRelatorioFinanceiro,
    "AdminCadastroIrmaos": AdminCadastroIrmaos,
    "AdminPresencas": AdminPresencas,
    "AdminAtestados": AdminAtestados,
    "AdminFrequencias": AdminFrequencias,
    "AdminComunicados": AdminComunicados,
    "IrmaoPortal": IrmaoPortal,
    "AdminDadosLoja": AdminDadosLoja,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};