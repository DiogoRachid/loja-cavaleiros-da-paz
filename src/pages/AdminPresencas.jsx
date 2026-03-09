import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ClipboardList, Check, X, Save, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function AdminPresencas() {
  const [sessoes, setSessoes] = useState([]);
  const [sessaoId, setSessaoId] = useState("");
  const [irmaos, setIrmaos] = useState([]);
  const [presencas, setPresencas] = useState([]);
  const [saving, setSaving] = useState(false);
  const admin = JSON.parse(sessionStorage.getItem("admin_data") || "{}");

  useEffect(() => { loadDados(); }, []);
  useEffect(() => { if (sessaoId) loadPresencas(); }, [sessaoId]);

  const loadDados = async () => {
    const [s, ir] = await Promise.all([
      base44.entities.Sessao.list("-data", 20),
      base44.entities.Irmao.filter({ ativo: true }),
    ]);
    setSessoes(s);
    setIrmaos(ir);
  };

  const loadPresencas = async () => {
    const existing = await base44.entities.Presenca.filter({ sessao_id: sessaoId });
    const sessao = sessoes.find(s => s.id === sessaoId);
    // Montar lista com todos os irmãos
    const lista = irmaos.map(ir => {
      const p = existing.find(e => e.irmao_id === ir.id);
      return p || {
        sessao_id: sessaoId,
        sessao_data: sessao?.data || "",
        irmao_id: ir.id,
        irmao_nome: ir.nome_completo,
        irmao_cim: ir.numero_glp,
        presente: false,
        justificativa: "",
        justificativa_aceita: false,
        _novo: true,
      };
    });
    setPresencas(lista);
  };

  const togglePresente = (irmaoId) => {
    setPresencas(prev => prev.map(p =>
      p.irmao_id === irmaoId ? { ...p, presente: !p.presente } : p
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
      const { _novo, ...dados } = p;
      if (_novo) {
        await base44.entities.Presenca.create(dados);
      } else if (p.id) {
        await base44.entities.Presenca.update(p.id, dados);
      }
    }
    await loadPresencas();
    setSaving(false);
  };

  const presentes = presencas.filter(p => p.presente).length;
  const ausentes = presencas.length - presentes;

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

      {/* Seleção de Sessão */}
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

      {sessaoId && presencas.length > 0 && (
        <>
          {/* Resumo */}
          <div className="grid grid-cols-3 gap-4">
            <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-slate-800">{presencas.length}</p><p className="text-xs text-slate-500">Total</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{presentes}</p><p className="text-xs text-slate-500">Presentes</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-500">{ausentes}</p><p className="text-xs text-slate-500">Ausentes</p></CardContent></Card>
          </div>

          {/* Lista */}
          <div className="space-y-2">
            {presencas.map(p => (
              <Card key={p.irmao_id} className={p.presente ? "border-green-200" : ""}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => togglePresente(p.irmao_id)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${p.presente ? "bg-green-500 text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
                      >
                        {p.presente ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                      </button>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{p.irmao_nome}</p>
                        <p className="text-xs text-slate-500">Nº GLP: {p.irmao_cim}</p>
                      </div>
                    </div>
                    <Badge className={p.presente ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}>
                      {p.presente ? "Presente" : "Ausente"}
                    </Badge>
                  </div>
                  {!p.presente && (
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        value={p.justificativa}
                        onChange={e => setJustificativa(p.irmao_id, e.target.value)}
                        placeholder="Justificativa (opcional)"
                        className="text-sm h-8"
                      />
                      {p.justificativa && (
                        <button
                          onClick={() => toggleJustificativa(p.irmao_id)}
                          className={`text-xs px-2 py-1 rounded ${p.justificativa_aceita ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}
                        >
                          {p.justificativa_aceita ? "Aceita" : "Aceitar"}
                        </button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}