import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Heart, AlertTriangle, Phone, PhoneOff, CheckCircle, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FaltasConsecutivas from "@/components/hospitaleiro/FaltasConsecutivas";
import { autoRealizarSessoes } from "@/utils/autoRealizarSessoes";

export default function AdminHospitaleiro() {
  const [irmaos, setIrmaos] = useState([]);
  const [sessoes, setSessoes] = useState([]);
  const [presencas, setPresencas] = useState([]);
  const [contatos, setContatos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDados(); }, []);

  const loadDados = async () => {
    await autoRealizarSessoes();
    const [ir, s, p, c] = await Promise.all([
      base44.entities.Irmao.filter({ ativo: true }),
      base44.entities.Sessao.filter({ status: "Realizada" }),
      base44.entities.Presenca.list(),
      base44.entities.ContatoHospitaleiro.list("-created_date", 100),
    ]);
    setIrmaos(ir);
    setSessoes(s);
    setPresencas(p);
    setContatos(c);
    setLoading(false);
  };

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
          <h1 className="text-2xl font-bold text-[#1B3A5F]">Painel do Hospitaleiro</h1>
          <p className="text-slate-500">Acompanhamento de faltas e contatos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">{irmaos.length}</p>
            <p className="text-xs text-slate-500">Irmãos Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{sessoes.length}</p>
            <p className="text-xs text-slate-500">Sessões Realizadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{contatos.filter(c => c.status === "Pendente").length}</p>
            <p className="text-xs text-slate-500">Contatos Pendentes</p>
          </CardContent>
        </Card>
      </div>

      <FaltasConsecutivas
        irmaos={irmaos}
        sessoes={sessoes}
        presencas={presencas}
        contatos={contatos}
        onContatoSalvo={loadDados}
      />
    </div>
  );
}