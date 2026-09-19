import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const SEM_PASTA_ID = "__sem_pasta__";

export default function FiltroPastasDropdown({ pastas, selectedIds, onChange }) {
  const toggle = (id) => {
    onChange(
      selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="border-[#1B3A5F] text-[#1B3A5F]">
          <Filter className="w-4 h-4 mr-1" />
          {selectedIds.length > 0 ? `Pastas (${selectedIds.length})` : "Filtrar por pasta"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs">Mostrar músicas das pastas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-56 overflow-y-auto">
          <DropdownMenuCheckboxItem
            checked={selectedIds.includes(SEM_PASTA_ID)}
            onCheckedChange={() => toggle(SEM_PASTA_ID)}
            onSelect={(e) => e.preventDefault()}
            className="text-sm cursor-pointer"
          >
            Músicas sem pasta
          </DropdownMenuCheckboxItem>
          {pastas.length > 0 && <DropdownMenuSeparator />}
          {pastas.map((p) => (
            <DropdownMenuCheckboxItem
              key={p.id}
              checked={selectedIds.includes(p.id)}
              onCheckedChange={() => toggle(p.id)}
              onSelect={(e) => e.preventDefault()}
              className="text-sm cursor-pointer"
            >
              {p.nome}
            </DropdownMenuCheckboxItem>
          ))}
        </div>
        {selectedIds.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <button
              onClick={() => onChange([])}
              className="w-full text-left px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-sm"
            >
              Limpar filtro
            </button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}