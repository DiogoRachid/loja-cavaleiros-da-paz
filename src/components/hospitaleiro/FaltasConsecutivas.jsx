import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, Phone, PhoneOff, CheckCircle, ChevronDown, ChevronUp, Pencil, Trash2, X, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export default function FaltasConsecutivas({ irmaos, sessoes, presencas, contatos, onContatoSalvo }) {
  const [expandido, setExpandido] = useState(null);
  const [descricao, setDescricao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [descricaoEdit, setDescricaoEdit] = useState("");

  // Ordenar sessões por data (mais antiga primeiro)
  const sessoesOrdenadas = [...sessoes].sort((a, b) => (a.data || "").localeCompare(b.data || ""));

  // Calcular faltas consecutivas (das mais recentes para trás)
  const calcularFaltasConsecutivas = (irmaoId) => {
    let consecutivas = 0;
    for (let i = sessoesOrdenadas.length - 1; i >= 0; i--) {
      const sessao = sessoesOrdenadas[i];
      const presenca = presencas.find(p => p.irmao_id === irmaoId && p.sessao_id === sessao.id);
      if (presenca?.presente || presenca?.dispensado) break;
      consecutivas++;
    }
    return consecutivas;
  };

  // Irmãos com 3+ faltas consecutivas
  const irmaosFaltosos = irmaos
    .map(ir => ({
      ...ir,
      faltasConsecutivas: calcularFaltasConsecutivas(ir.id),
      ultimoContato: contatos.find(c => c.irmao_id === ir.id && c.status !== "Pendente"),
      contatoPendente: contatos.find(c => c.irmao_id === ir.id && c.status === "Pendente"),
    }))
    .filter(ir => ir.faltasConsecutivas >= 3)
    .sort((a, b) => b.faltasConsecutivas - a.faltasConsecutivas);

  const registrarContato = async (irmao, status) => {
    setSalvando(true);
    const admin = JSON.parse(sessionStorage.getItem("admin_data") || "{}");
    await base44.entities.ContatoHospitaleiro.create({
      irmao_id: irmao.id,
      irmao_nome: irmao.nome_completo,
      faltas_consecutivas: irmao.faltasConsecutivas,
      status,
      descricao: status === "Contatado" ? descricao : "",
      data_contato: new Date().toISOString(),
      registrado_por: admin.nome_completo || "Hospitaleiro",
    });
    setDescricao("");
    setExpandido(null);
    setSalvando(false);
    onContatoSalvo();
  };

  const excluirContato = async (contatoId) => {
    if (!confirm("Excluir este registro de contato?")) return;
    await base44.entities.ContatoHospitaleiro.delete(contatoId);
    onContatoSalvo();
  };

  const salvarEdicao = async (contatoId) => {
    setSalvando(true);
    await base44.entities.ContatoHospitaleiro.update(contatoId, { descricao: descricaoEdit });
    setEditando(null);
    setDescricaoEdit("");
    setSalvando(false);
    onContatoSalvo();
  };

  if (sessoesOrdenadas.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-slate-400">
          Nenhuma sessão realizada ainda para calcular faltas.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-bold text-[#1B3A5F]">Irmãos com 3+ Faltas Consecutivas</h2>
        <Badge className="bg-red-100 text-red-700">{irmaosFaltosos.length}</Badge>
      </div>

      {irmaosFaltosos.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
            <p className="text-slate-600 font-medium">Nenhum irmão com 3 ou mais faltas consecutivas.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {irmaosFaltosos.map(ir => (
            <Card key={ir.id} className="border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{ir.nome_completo}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-slate-500">GLP: {ir.numero_glp}</p>
                        {ir.telefone && <p className="text-xs text-slate-500">| Tel: {ir.telefone}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-100 text-red-700">{ir.faltasConsecutivas} faltas</Badge>
                    {ir.ultimoContato && (
                      <Badge className={ir.ultimoContato.status === "Contatado" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}>
                        {ir.ultimoContato.status}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandido(expandido === ir.id ? null : ir.id)}
                    >
                      {expandido === ir.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {expandido === ir.id && (
                  <div className="mt-4 space-y-3 border-t pt-3">
                    {ir.ultimoContato && (
                      <div className="bg-slate-50 p-3 rounded-lg text-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-slate-700">Último contato: {ir.ultimoContato.status}</p>
                            {editando === ir.ultimoContato.id ? (
                              <div className="mt-2 flex items-center gap-2">
                                <Textarea
                                  value={descricaoEdit}
                                  onChange={e => setDescricaoEdit(e.target.value)}
                                  className="h-16 text-sm"
                                />
                                <Button size="icon" className="h-8 w-8 bg-green-600 hover:bg-green-700" disabled={salvando} onClick={() => salvarEdicao(ir.ultimoContato.id)}>
                                  <Check className="w-3.5 h-3.5" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditando(null)}>
                                  <X className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            ) : (
                              ir.ultimoContato.descricao && <p className="text-slate-600 mt-1">{ir.ultimoContato.descricao}</p>
                            )}
                            <p className="text-xs text-slate-400 mt-1">
                              {ir.ultimoContato.data_contato ? new Date(ir.ultimoContato.data_contato).toLocaleDateString("pt-BR") : ""} — por {ir.ultimoContato.registrado_por}
                            </p>
                          </div>
                          {editando !== ir.ultimoContato.id && (
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-blue-600" onClick={() => { setEditando(ir.ultimoContato.id); setDescricaoEdit(ir.ultimoContato.descricao || ""); }}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => excluirContato(ir.ultimoContato.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Textarea
                        value={descricao}
                        onChange={e => setDescricao(e.target.value)}
                        placeholder="Descreva o contato realizado..."
                        className="h-20"
                      />
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          onClick={() => registrarContato(ir, "Contatado")}
                          disabled={salvando || !descricao.trim()}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Phone className="w-4 h-4 mr-2" /> Contato Realizado
                        </Button>
                        <Button
                          onClick={() => registrarContato(ir, "Sem Contato")}
                          disabled={salvando}
                          variant="outline"
                          className="border-red-400 text-red-600 hover:bg-red-50"
                        >
                          <PhoneOff className="w-4 h-4 mr-2" /> Não Conseguiu Contato
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}


    </div>
  );
}