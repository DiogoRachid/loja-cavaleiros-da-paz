import { Link } from "react-router-dom";

const GROUPS = ["Visão geral", "Sessões e trabalhos", "Irmãos e assistência", "Financeiro", "Harmonia", "Biblioteca", "Gestão da Loja"];
function groupFor(page) {
  if (/^(AdminVM|AdminMC|AdminSecretario|AdminChanceler|AdminVigilantes|AdminOrador|AdminPortais|IrmaoPortal|BibDashboard|AdminMestreHarmonia|AdminTesoureiro)$/.test(page)) return "Visão geral";
  if (/Harmonia|Mp3|Player|Musicas/.test(page)) return "Harmonia";
  if (/Mensalidades|Financeiro/.test(page)) return "Financeiro";
  if (/^Bib|Acervo|Emprestimos|Sugestoes|IrmaoScan/.test(page)) return "Biblioteca";
  if (/Sessoes|AgendaRitual|Trabalhos|Balaustre|Expedientes|Visitantes|Pareceres|Presenc|Frequencias|Autoridades|QuadroOficiais|OrdemEntrada/.test(page)) return "Sessões e trabalhos";
  if (/Membros|CadastroIrmaos|Hospitaleiro|Contatos|AcaoSocial|Atestados/.test(page)) return "Irmãos e assistência";
  return "Gestão da Loja";
}

export default function PortalNavigation({ links, currentPageName, onNavigate }) {
  const groups = GROUPS.map(name => ({ name, items: links.filter(link => groupFor(link.page) === name) })).filter(group => group.items.length);
  return (
    <nav aria-label="Navegação do portal" className="h-full space-y-6 overflow-y-auto overscroll-contain px-3 py-5 pb-10">
      {groups.map(group => <section key={group.name}>
        <h2 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{group.name}</h2>
        <div className="space-y-1">
          {group.items.map(link => {
            const Icon = link.icon;
            const active = currentPageName === link.page;
            return <Link key={link.page} to={`/${link.page}`} onClick={onNavigate} aria-current={active ? "page" : undefined}
              className={`flex min-h-10 items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lodge-gold ${active ? "border-lodge-gold bg-lodge-navy font-semibold text-primary-foreground" : "border-transparent text-muted-foreground hover:bg-muted hover:text-lodge-navy"}`}>
              <Icon className={`h-4 w-4 shrink-0 ${active ? "text-lodge-gold" : ""}`} />
              <span>{link.name}</span>
            </Link>;
          })}
        </div>
      </section>)}
    </nav>
  );
}