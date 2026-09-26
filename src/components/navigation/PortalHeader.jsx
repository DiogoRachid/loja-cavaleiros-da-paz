import { Link } from "react-router-dom";
import { Menu, X, Home, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import CargoIcon from "@/components/CargoIcon";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function PortalHeader({ logo, cargo, portalLabel, user, isIrmao, sidebarOpen, onToggleMenu, onLogout }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-border bg-card text-lodge-navy">
      <div className="flex h-full items-center justify-between gap-3 px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={onToggleMenu} aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={sidebarOpen} aria-controls="portal-navigation">
            {sidebarOpen ? <X /> : <Menu />}
          </Button>
          <img src={logo} alt="Cavaleiros da Paz nº25" className="hidden h-11 w-11 shrink-0 object-contain sm:block" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold sm:text-base">Cavaleiros da Paz nº25</p>
            <p className="truncate text-xs text-muted-foreground">{portalLabel}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          {user && <div className="hidden items-center gap-3 border-r border-border pr-4 md:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background"><CargoIcon cargo={cargo} className="h-8 w-8" /></div>
            <div className="max-w-48 text-right"><p className="truncate text-sm font-medium">{user.full_name}</p><p className="text-xs text-muted-foreground">{user.cim ? `CIM: ${user.cim}` : portalLabel}</p></div>
          </div>}
          <ThemeToggle />
          {isIrmao && <Button asChild variant="ghost" size="icon"><Link to="/IrmaoConfiguracoes" aria-label="Configurações" title="Configurações"><Settings /></Link></Button>}
          <Button asChild variant="ghost" size="icon"><Link to="/" aria-label="Página inicial" title="Página inicial"><Home /></Link></Button>
          <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Sair" title="Sair"><LogOut /></Button>
        </div>
      </div>
    </header>
  );
}