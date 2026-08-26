import { useState, useEffect } from "react";
import { db } from "@/api/db";
import { Loader2, Users, GraduationCap, BarChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import IrmaoGrauCard from "@/components/vigilantes/IrmaoGrauCard";

const MESES_MINIMOS = 12;

function mesesDesde(dataStr) {
  if (!dataStr) return null;
  const d = new Date(dataStr);
  if (isNaN(d)) return null;
  const agora = new Date();
  return Math.max(0, (agora.getFullYear() - d.getFullYear()) * 12 + (agora.getMonth() - d.getMonth()));
}

export default function AdminVigilantes() {
  const cargo = sessionStorage.getItem("admin_cargo") || "";
  const isPrimeiro = cargo === "Primeiro Vigilante";
  const grauAlvo = isPrimeiro ? "Aprendiz" : "Companheiro";
  const proximoGrau = isPrimeiro ? "Companheiro" : "Mestre";
  const campoData = isPrimeiro ? "data_iniciacao" : "data_elevacao";

  const [loading, setLoading] = useState(true);
  const [irmaos, setIrmaos] = useState([]);
  const [presencas, setPresencas] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [todosIrmaos, todasPresencas] = await Promise.all([
        db.Irmao.filter({ grau: grauAlvo, ativo: true }, "nome_completo", 500),
        db.Presenca.list("-created_date", 2000),
      ]);
      setIrmaos(todosIrmaos);
      setPresencas(todasPresencas);
      setLoading(false);
    };
    load();
  }, [grauAlvo]);

  const dadosIrmao = (irmao) => {
    const meses = mesesDesde(irmao[campoData]);
    const doIrmao = presencas.filter((p) => p.irmao_id === irmao.id && !p.dispensado);
    const frequencia = doIrmao.length > 0
      ? Math.round((doIrmao.filter((p) => p.presente).length / doIrmao.length) * 100)
      : null;
    const apto = meses !== null && meses >= MESES_MINIMOS;
    return { meses, frequencia, apto };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const computados = irmaos.map((i) => ({ irmao: i, ...dadosIrmao(i) }));
  const aptos = computados.filter((c) => c.apto).length;
  const comFrequencia = computados.filter((c) => c.frequencia !== null);
  const freqMedia = comFrequencia.length > 0
    ? Math.round(comFrequencia.reduce((acc, c) => acc + c.frequencia, 0) / comFrequencia.length)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center flex-shrink-0">
          <Users className="w-6 h-6 text-[#C9A227]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1B3A5F]">Painel do {cargo || "Vigilante"}</h1>
          <p className="text-slate-500 text-sm">Acompanhamento dos {grauAlvo === "Aprendiz" ? "Aprendizes" : "Companheiros"}</p>
        </div>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="w-8 h-8 text-[#1B3A5F]" />
            <div>
              <p className="text-2xl font-bold text-[#1B3A5F]">{irmaos.length}</p>
              <p className="text-xs text-slate-500">{grauAlvo === "Aprendiz" ? "Aprendizes" : "Companheiros"} ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-600">{aptos}</p>
              <p className="text-xs text-slate-500">Aptos a {proximoGrau} (≥ {MESES_MINIMOS} meses)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <BarChart className="w-8 h-8 text-[#C9A227]" />
            <div>
              <p className="text-2xl font-bold text-[#1B3A5F]">{freqMedia !== null ? `${freqMedia}%` : "—"}</p>
              <p className="text-xs text-slate-500">Frequência média</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista */}
      <Card>
        <CardContent className="p-3 sm:p-4 space-y-2">
          {computados.length === 0 && (
            <p className="text-center text-slate-400 py-8">
              Nenhum {grauAlvo === "Aprendiz" ? "Aprendiz" : "Companheiro"} ativo cadastrado.
            </p>
          )}
          {computados.map(({ irmao, meses, frequencia, apto }) => (
            <IrmaoGrauCard
              key={irmao.id}
              irmao={irmao}
              mesesNoGrau={meses}
              frequencia={frequencia}
              apto={apto}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}