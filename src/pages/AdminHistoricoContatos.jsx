import { useState, useEffect } from "react";
import { db } from "@/api/db";
import { Heart, Phone, PhoneOff, Trash2, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminHistoricoContatos() {
  const [contatos, setContatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => { loadContatos(); }, []);

  const loadContatos = async () => {
    const c = await db.ContatoHospitaleiro.list("-created_date", 500);
    setContatos(c);
    setLoading(false);
  };

  const excluirContato = async (id) => {
    if (!confirm("Excluir este registro de contato?")) return;
    await db.ContatoHospitaleiro.delete(id);
    setContatos(prev => prev.filter(c => c.id !== id));
  };

  const filtrados = contatos
    .filter(c => (c.irmao_nome || "").toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => (a.irmao_nome || "").localeCompare(b.irmao_nome || ""));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#1B3A5F] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
          <Heart className="w-6 h-6 text-[#C9A227]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A5F]">Histórico de Contatos</h1>
          <p className="text-slate-500">Todos os registros de contatos do Hospitaleiro</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Buscar por nome do irmão..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtrados.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-slate-400">
            Nenhum contato encontrado.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtrados.map(c => (
            <Card key={c.id} className="bg-slate-50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-800">{c.irmao_nome}</p>
                    {c.descricao && <p className="text-xs text-slate-600 mt-0.5">{c.descricao}</p>}
                    <p className="text-xs text-slate-400 mt-0.5">
                      {c.faltas_consecutivas} faltas · por {c.registrado_por}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={c.status === "Contatado" ? "bg-green-100 text-green-700" : c.status === "Sem Contato" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}>
                      {c.status === "Contatado" ? <><Phone className="w-3 h-3 mr-1" />{c.status}</> : c.status === "Sem Contato" ? <><PhoneOff className="w-3 h-3 mr-1" />{c.status}</> : c.status}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {c.data_contato ? new Date(c.data_contato).toLocaleDateString("pt-BR") : ""}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => excluirContato(c.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}