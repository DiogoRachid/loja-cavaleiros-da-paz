import { Link } from "react-router-dom";
import { ChevronLeft, Printer, Save, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CargoIcon from "@/components/CargoIcon";

export default function ReuniaoHeader({ sessao, dataFormatada, savedAt, saving, canSave, onSave, onPrint }) {
  return (
    <div className="space-y-4">
      <Link to="/AdminAgendaRitual" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-lodge-navy"><ChevronLeft className="h-4 w-4" /> Agenda Ritual</Link>
      <div className="flex flex-wrap items-center justify-between gap-5 border-b border-border pb-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-card"><CargoIcon cargo="Mestre de Cerimônias" className="h-10 w-10" /></div>
          <div><h1 className="text-2xl font-semibold tracking-tight text-lodge-navy sm:text-3xl">Preparar Reunião</h1>
            {sessao && <p className="mt-1 text-sm text-muted-foreground">{sessao.tipo} — {dataFormatada}{sessao.hora ? ` às ${sessao.hora}` : ""}{sessao.local ? ` | ${sessao.local}` : ""}</p>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {savedAt && <span role="status" className="mr-2 inline-flex items-center gap-1.5 text-sm text-lodge-success"><CheckCircle className="h-4 w-4" /> Salvo</span>}
          <Button variant="outline" onClick={onPrint} className="h-10 text-lodge-navy"><Printer /> Gerar PDF</Button>
          <Button onClick={onSave} disabled={saving || !canSave} className="h-10 bg-lodge-navy text-primary-foreground hover:bg-lodge-navy/90">{saving ? <Loader2 className="animate-spin" /> : <Save />}{saving ? "Salvando..." : "Salvar"}</Button>
        </div>
      </div>
    </div>
  );
}