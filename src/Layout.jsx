import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { 
  BookOpen, Users, History, QrCode, LogOut, 
  Menu, X, Home, Library, BookMarked
} from "lucide-react";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [irmao, setIrmao] = useState(null);
  const location = useLocation();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Buscar dados do irmão
      const irmaos = await base44.entities.Irmao.filter({ email: currentUser.email });
      if (irmaos.length > 0) {
        setIrmao(irmaos[0]);
      }
    } catch (e) {
      console.log("Usuário não autenticado");
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  // Páginas sem layout (portal de seleção)
  if (currentPageName === "Home" || currentPageName === "ScanRetirada" || currentPageName === "ScanDevolucao" || currentPageName === "BibLogin") {
    return <>{children}</>;
  }

  const isAdmin = user?.role === "admin";
  const isBibliotecario = currentPageName?.startsWith("Bib");
  const isIrmaoPortal = currentPageName?.startsWith("Irmao");

  const bibliotecarioLinks = [
    { name: "Dashboard", page: "BibDashboard", icon: Home },
    { name: "Acervo", page: "BibAcervo", icon: Library },
    { name: "Irmãos", page: "BibIrmaos", icon: Users },
    { name: "Empréstimos", page: "BibEmprestimos", icon: BookMarked },
    { name: "QR Codes", page: "BibQRCodes", icon: QrCode },
  ];

  const irmaoLinks = [
    { name: "Meus Empréstimos", page: "IrmaoEmprestimos", icon: BookOpen },
    { name: "Escanear QR", page: "IrmaoScan", icon: QrCode },
  ];

  const links = isBibliotecario ? bibliotecarioLinks : irmaoLinks;

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        :root {
          --primary-gold: #C9A227;
          --primary-blue: #1B3A5F;
          --light-gold: #F5E6B3;
        }
      `}</style>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1B3A5F] shadow-lg">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-white p-2"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C9A227] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#1B3A5F]" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-white font-semibold text-lg">Biblioteca Cavaleiros da Paz nº25</h1>
                <p className="text-[#C9A227] text-xs">
                  {isBibliotecario ? "Portal Bibliotecário" : "Portal do Irmão"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-white text-sm font-medium">{irmao?.nome_completo || user.full_name}</p>
                  <p className="text-slate-300 text-xs">{irmao?.numero_glp || user.email}</p>
                </div>
              </div>
            )}
            <Link to={createPageUrl("Home")}>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Home className="w-5 h-5" />
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="text-white hover:bg-white/10"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 bottom-0 w-64 bg-white shadow-xl z-40
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}>
        <nav className="p-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = currentPageName === link.page;
            return (
              <Link
                key={link.page}
                to={createPageUrl(link.page)}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? "bg-[#1B3A5F] text-white shadow-lg" 
                    : "text-slate-600 hover:bg-slate-100"}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-[#C9A227]" : ""}`} />
                <span className="font-medium">{link.name}</span>
              </Link>
            );
          })}
        </nav>
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