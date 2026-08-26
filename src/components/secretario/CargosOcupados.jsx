import { Badge } from "@/components/ui/badge";
import CargoIcon from "@/components/CargoIcon";

// Lê a preparação da reunião (oficiais confirmados / substitutos) para mostrar quem ocupou cada cargo
export function cargosOcupados(sessao) {
  if (!sessao?.preparacao_json) return [];
  let dados = sessao.preparacao_json;
  try {
    if (typeof dados === "string") dados = JSON.parse(dados);
  } catch {
    return [];
  }
  const quadro = dados?.quadroOficiais || [];
  return quadro
    .filter((o) => o.confirmado || o.substituto_nome)
    .map((o) => ({
      cargo: o.cargo,
      nome: o.substituto_nome || o.titular_nome || "",
      substituto: !!o.substituto_nome,
    }))
    .filter((o) => o.nome);
}

export default function CargosOcupados({ sessao }) {
  const lista = cargosOcupados(sessao);
  if (lista.length === 0) {
    return (
      <p className="text-sm text-slate-400 py-4 text-center">
        Nenhum cargo confirmado — confirme os oficiais em "Preparar Reunião".
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {lista.map((o) => (
        <div key={o.cargo} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
          <CargoIcon cargo={o.cargo} className="w-4 h-4 text-[#C9A227]" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500">{o.cargo}</p>
            <p className="text-sm font-medium text-slate-800 truncate">{o.nome}</p>
          </div>
          {o.substituto && <Badge className="bg-amber-100 text-amber-800 text-xs">Substituto</Badge>}
        </div>
      ))}
    </div>
  );
}