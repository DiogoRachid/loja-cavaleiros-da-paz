import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Search, Filter, Eye, UserCheck, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const grauColors = { Aprendiz: "bg-yellow-100 text-yellow-800", Companheiro: "bg-blue-100 text-blue-800", Mestre: "bg-purple-100 text-purple-800" };
const situacaoColors = { Regular: "bg-green-100 text-green-800", Irregular: "bg-red-100 text-red-800", Suspenso: "bg-orange-100 text-orange-800", Afastado: "bg-slate-100 text-slate-700" };

export default function AdminMembros() {
  const [irmaos, setIrmaos] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroGrau, setFiltroGrau] = useState("Todos");
  const [filtroSituacao, setFiltroSituacao] = useState("Todos");
  const [selecionado, setSelecionado] = useState(null);

  useEffect(() => { loadIrmaos(); }, []);

  const loadIrmaos = async () => {
    const data = await base44.entities.Irmao.list("-created_date", 100);
    setIrmaos(data);
  };

  const filtrados = irmaos.filter(i => {
    const matchBusca = !busca || i.nome_completo?.toLowerCase().includes(busca.toLowerCase()) || i.cim?.includes(busca);
    const matchGrau = filtroGrau === "Todos" || i.grau === filtroGrau;
    const matchSituacao = filtroSituacao === "Todos" || i.situacao === filtroSituacao;
    return matchBusca && matchGrau && matchSituacao;
  });

  const stats = {
    total: irmaos.filter(i => i.ativo).length,
    regulares: irmaos.filter(i => i.situacao === "Regular").length,
    irregulares: irmaos.filter(i => i.situacao === "Irregular").length,
  };
  const pctAdimplencia = stats.total > 0 ? Math.round((stats.regulares / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
          <Users className="w-6 h-6 text-[#C9A227]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A5F]">Gestão de Membros</h1>
          <p className="text-slate-500">{stats.total} irmãos ativos</p>
        </div>
      </div>

      {/* Cards Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Ativos", value: stats.total, icon: Users, color: "bg-blue-500" },
          { label: "Regulares", value: stats.regulares, icon: UserCheck, color: "bg-green-500" },
          { label: "Irregulares", value: stats.irregulares, icon: UserX, color: "bg-red-500" },
          { label: "Adimplência", value: `${pctAdimplencia}%`, icon: Filter, color: "bg-purple-500" },
        ].map(c => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg ${c.color} flex items-center justify-center mb-2`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-xl font-bold text-slate-800">{c.value}</p>
                <p className="text-xs text-slate-500">{c.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome ou CIM..." className="pl-9" />
        </div>
        <Select value={filtroGrau} onValueChange={setFiltroGrau}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["Todos","Aprendiz","Companheiro","Mestre"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroSituacao} onValueChange={setFiltroSituacao}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["Todos","Regular","Irregular","Suspenso","Afastado"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {filtrados.map(ir => (
          <Card key={ir.id} className={`hover:shadow-md transition-shadow cursor-pointer ${selecionado?.id === ir.id ? "border-[#C9A227]" : ""}`}
            onClick={() => setSelecionado(selecionado?.id === ir.id ? null : ir)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1B3A5F]/10 flex items-center justify-center font-bold text-[#1B3A5F]">
                    {ir.nome_completo?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{ir.nome_completo}</p>
                    <p className="text-xs text-slate-500">CIM: {ir.cim} {ir.cargo && ir.cargo !== "Nenhum" ? `• ${ir.cargo}` : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={grauColors[ir.grau] || ""}>{ir.grau}</Badge>
                  <Badge className={situacaoColors[ir.situacao] || ""}>{ir.situacao}</Badge>
                </div>
              </div>
              {selecionado?.id === ir.id && (
                <div className="mt-4 pt-4 border-t grid md:grid-cols-3 gap-3 text-sm">
                  <div><span className="text-slate-500">Email: </span><span>{ir.email || "—"}</span></div>
                  <div><span className="text-slate-500">Telefone: </span><span>{ir.telefone || "—"}</span></div>
                  <div><span className="text-slate-500">Iniciação: </span><span>{ir.data_iniciacao || "—"}</span></div>
                  <div><span className="text-slate-500">Profissão: </span><span>{ir.profissao || "—"}</span></div>
                  <div><span className="text-slate-500">Nascimento: </span><span>{ir.data_nascimento || "—"}</span></div>
                  {ir.observacoes && <div className="md:col-span-3"><span className="text-slate-500">Obs: </span><span>{ir.observacoes}</span></div>}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filtrados.length === 0 && (
          <Card><CardContent className="p-8 text-center text-slate-400">Nenhum irmão encontrado.</CardContent></Card>
        )}
      </div>
    </div>
  );
}