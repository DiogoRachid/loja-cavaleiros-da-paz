import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { DollarSign, Table, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import GerenciarCentrosCusto from "@/components/mensalidades/GerenciarCentrosCusto";
import PlanilhaLancamento from "@/components/mensalidades/PlanilhaLancamento";
import ListaMensalidades from "@/components/mensalidades/ListaMensalidades";

export default function AdminMensalidades() {
  const [mensalidades, setMensalidades] = useState([]);
  const [irmaos, setIrmaos] = useState([]);
  const [centros, setCentros] = useState([]);
  const [aba, setAba] = useState("planilha"); // "planilha" | "lista"

  useEffect(() => { loadDados(); }, []);

  const loadDados = async () => {
    const [m, ir, cc] = await Promise.all([
      base44.entities.Mensalidade.list("-created_date", 200),
      base44.entities.Irmao.filter({ ativo: true }),
      base44.entities.CentroCusto.list("ordem", 50),
    ]);
    setMensalidades(m);
    setIrmaos(ir);
    setCentros(cc);
  };

  const loadMensalidades = async () => {
    const m = await base44.entities.Mensalidade.list("-created_date", 200);
    setMensalidades(m);
  };

  const loadCentros = async () => {
    const cc = await base44.entities.CentroCusto.list("ordem", 50);
    setCentros(cc);
  };

  const centrosAtivos = centros.filter(c => c.ativo);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A5F]">Mensalidades</h1>
            <p className="text-slate-500">{mensalidades.length} lançamentos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={aba === "planilha" ? "default" : "outline"}
            onClick={() => setAba("planilha")}
            className={aba === "planilha" ? "bg-[#1B3A5F] text-white" : "border-[#1B3A5F] text-[#1B3A5F]"}
          >
            <Table className="w-4 h-4 mr-2" /> Planilha
          </Button>
          <Button
            variant={aba === "lista" ? "default" : "outline"}
            onClick={() => setAba("lista")}
            className={aba === "lista" ? "bg-[#1B3A5F] text-white" : "border-[#1B3A5F] text-[#1B3A5F]"}
          >
            <List className="w-4 h-4 mr-2" /> Lista
          </Button>
        </div>
      </div>

      {/* Centros de Custo */}
      <GerenciarCentrosCusto centros={centros} onAtualizar={loadCentros} />

      {/* Conteúdo */}
      {aba === "planilha" ? (
        <PlanilhaLancamento
          irmaos={irmaos}
          centrosAtivos={centrosAtivos}
          onSalvo={loadMensalidades}
        />
      ) : (
        <ListaMensalidades
          mensalidades={mensalidades}
          centros={centros}
          onAtualizar={loadMensalidades}
        />
      )}
    </div>
  );
}