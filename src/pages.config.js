import Home from './pages/Home';
import BibDashboard from './pages/BibDashboard';
import BibAcervo from './pages/BibAcervo';
import BibIrmaos from './pages/BibIrmaos';
import BibEmprestimos from './pages/BibEmprestimos';
import BibQRCodes from './pages/BibQRCodes';
import IrmaoEmprestimos from './pages/IrmaoEmprestimos';
import IrmaoScan from './pages/IrmaoScan';
import ScanRetirada from './pages/ScanRetirada';
import ScanDevolucao from './pages/ScanDevolucao';
import BibLogin from './pages/BibLogin';
import IrmaoLogin from './pages/IrmaoLogin';
import BibBibliotecarios from './pages/BibBibliotecarios';
import BibAcervoDigital from './pages/BibAcervoDigital';
import IrmaoAcervoDigital from './pages/IrmaoAcervoDigital';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "BibDashboard": BibDashboard,
    "BibAcervo": BibAcervo,
    "BibIrmaos": BibIrmaos,
    "BibEmprestimos": BibEmprestimos,
    "BibQRCodes": BibQRCodes,
    "IrmaoEmprestimos": IrmaoEmprestimos,
    "IrmaoScan": IrmaoScan,
    "ScanRetirada": ScanRetirada,
    "ScanDevolucao": ScanDevolucao,
    "BibLogin": BibLogin,
    "IrmaoLogin": IrmaoLogin,
    "BibBibliotecarios": BibBibliotecarios,
    "BibAcervoDigital": BibAcervoDigital,
    "IrmaoAcervoDigital": IrmaoAcervoDigital,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};