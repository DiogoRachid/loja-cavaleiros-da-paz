import { useState, useEffect } from "react";
import { db } from "@/api/db";
import { ClipboardList, Check, X, Save, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const GRAU_NIVEL = { "Aprendiz": 1, "Companheiro": 2, "Mestre": 3 };
const GRAU_CORES = {
  "Aprendiz": "bg-blue-100 text-blue-800",
  "Companheiro": "bg-yellow-100 text-yellow-800",
  "Mestre": "bg-purple-100 text-purple-800",
};

export default function AdminPresencas() {
  const [sessoes, setSessoes] = useState([]);
  const [sessaoId, setSessaoId] = useState("");
  const [irmaos, setIrmaos] = useState([]);
  const [presencas, setPresencas] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadDados(); }, []);
  useEffect(() => { if (sessaoId) loadPresencas(); }, [sessaoId]);

  const loadDados = async () => {
    const [s, ir] = await Promise.all([
      db.Sessao.list("-data", 20),
      db.Irmao.filter({ ativo: true }, "nome_completo", 500),
    ]);
    setSessoes(s);
    setIrmaos(ir);
  };

  const sessaoAtual = sessoes.find(s => s.id === sessaoId);
  const grauSessao = sessaoAtual?.grau || "Aprendiz";

  const loadPresencas = async () => {
    const existing = await db.Presenca.filter({ sessao_id: sessaoId }, "-created_date", 500);
    const sessao = sessoes.find(s => s.id === sessaoId);
    const grau = sessao?.grau || "Aprendiz";

    const lista = irmaos.map(ir => {
      const p = existing.find(e => e.irmao_id === ir.id);
      const grauIrmao = ir.grau || "Aprendiz";
      const dispensadoAuto = (GRAU_NIVEL[grauIrmao] || 1) < (GRAU_NIVEL[grau] || 1);
      
      if (p) {
        return {
          ...p,
          _grau: grauIrmao,
          dispensado: p.dispensado || dispensadoAuto,
        };
      }
      return {
        sessao_id: sessaoId,
        sessao_data: sessao?.data || "",
        irmao_id: ir.id,
        irmao_nome: ir.nome_completo,
        irmao_cim: ir.numero_glp,
        presente: false,
        dispensado: dispensadoAuto,
        justificativa: "",
        justificativa_aceita: false,
        _novo: true,
        _grau: grauIrmao,
      };
    });

    lista.sort((a, b) => (a.irmao_nome || "").localeCompare(b.irmao_nome || "", "pt-BR"));
    setPresencas(lista);
  };

  const togglePresente = (irmaoId) => {
    setPresencas(prev => prev.map(p =>
      p.irmao_id === irmaoId ? { ...p, presente: !p.presente, dispensado: false } : p
    ));
  };

  const toggleDispensado = (irmaoId) => {
    setPresencas(prev => prev.map(p =>
      p.irmao_id === irmaoId ? { ...p, dispensado: !p.dispensado, presente: false } : p
    ));
  };

  const setJustificativa = (irmaoId, val) => {
    setPresencas(prev => prev.map(p =>
      p.irmao_id === irmaoId ? { ...p, justificativa: val } : p
    ));
  };

  const toggleJustificativa = (irmaoId) => {
    setPresencas(prev => prev.map(p =>
      p.irmao_id === irmaoId ? { ...p, justificativa_aceita: !p.justificativa_aceita } : p
    ));
  };

  const salvar = async () => {
    setSaving(true);
    for (const p of presencas) {
      const { _novo, _grau, id, created_date, updated_date, created_by_id, ...dados } = p;
      if (_novo) {
        await db.Presenca.create(dados);
      } else if (id) {
        await db.Presenca.update(id, dados);
      }
    }
    await loadPresencas();
    setSaving(false);
  };

  const presentes = presencas.filter(p => p.presente).length;
  const dispensados = presencas.filter(p => p.dispensado && !p.presente).length;
  const ausentes = presencas.length - presentes - dispensados;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A5F]">Controle de Presenças</h1>
            <p className="text-slate-500">Frequência por sessão</p>
          </div>
        </div>
        {sessaoId && (
          <Button onClick={salvar} disabled={saving} className="bg-[#1B3A5F] text-white">
            <Save className="w-4 h-4 mr-2" />{saving ? "Salvando..." : "Salvar Presenças"}
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-4 space-y-1">
          <Label>Sessão</Label>
          <Select value={sessaoId} onValueChange={setSessaoId}>
            <SelectTrigger><SelectValue placeholder="Selecione uma sessão..." /></SelectTrigger>
            <SelectContent>
              {sessoes.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.tipo} — {s.data} às {s.hora}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {sessaoId && sessaoAtual && (
        <div className="flex items-center gap-2">
          <Badge className={GRAU_CORES[grauSessao] || "bg-slate-100 text-slate-800"}>
            Grau: {grauSessao}
          </Badge>
          <span className="text-sm text-slate-500">Irmãos com grau inferior são automaticamente dispensados</span>
        </div>
      )}

      {sessaoId && presencas.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-slate-800">{presencas.length}</p><p className="text-xs text-slate-500">Total</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{presentes}</p><p className="text-xs text-slate-500">Presentes</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-amber-600">{dispensados}</p><p className="text-xs text-slate-500">Dispensados</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-500">{ausentes}</p><p className="text-xs text-slate-500">Ausentes</p></CardContent></Card>
          </div>

          <div className="space-y-2">
            {presencas.map(p => (
              <Card key={p.irmao_id} className={p.presente ? "border-green-200" : p.dispensado ? "border-amber-200" : ""}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button
                        onClick={() => togglePresente(p.irmao_id)}
                        title="Presente"
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${p.presente ? "bg-green-500 text-white" : "bg-slate-100 text-slate-400 hover:bg-green-100 hover:text-green-600"}`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-medium text-slate-800 text-sm leading-tight">{p.irmao_nome}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-slate-500">Nº GLP: {p.irmao_cim}</p>
                            {p._grau && <Badge className={`text-[10px] px-1.5 py-0 ${GRAU_CORES[p._grau] || ""}`}>{p._grau}</Badge>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!p.presente && (
                            <Button
                              variant={p.dispensado ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleDispensado(p.irmao_id)}
                              className={`text-xs h-7 ${p.dispensado ? "bg-amber-500 hover:bg-amber-600 text-white" : "border-amber-400 text-amber-600 hover:bg-amber-50"}`}
                            >
                              <ShieldAlert className="w-3 h-3 mr-1" />
                              Dispensado
                            </Button>
                          )}
                          <Badge className={`flex-shrink-0 ${p.presente ? "bg-green-100 text-green-800" : p.dispensado ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                            {p.presente ? "Presente" : p.dispensado ? "Dispensado" : "Ausente"}
                          </Badge>
                        </div>
                      </div>
                      {!p.presente && !p.dispensado && (
                        <div className="mt-2 flex items-center gap-2">
                          <Input
                            value={p.justificativa}
                            onChange={e => setJustificativa(p.irmao_id, e.target.value)}
                            placeholder="Justificativa (opcional)"
                            className="text-sm h-8 flex-1"
                          />
                          {p.justificativa && (
                            <button
                              onClick={() => toggleJustificativa(p.irmao_id)}
                              className={`flex-shrink-0 text-xs px-2 py-1 rounded ${p.justificativa_aceita ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}
                            >
                              {p.justificativa_aceita ? "Aceita" : "Aceitar"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}