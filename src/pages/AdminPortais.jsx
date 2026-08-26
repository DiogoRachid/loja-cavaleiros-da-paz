import PortaisCargos from "@/components/vm/PortaisCargos";
import { LayoutGrid } from "lucide-react";

export default function AdminPortais() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center flex-shrink-0">
          <LayoutGrid className="w-6 h-6 text-[#C9A227]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A5F]">Portais dos Cargos</h1>
          <p className="text-slate-500">Acesso do Venerável Mestre a todos os painéis administrativos da Loja</p>
        </div>
      </div>
      <PortaisCargos />
    </div>
  );
}