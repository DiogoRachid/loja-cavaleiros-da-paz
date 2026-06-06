import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, Phone, PhoneOff, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export default function FaltasConsecutivas({ irmaos, sessoes, presencas, contatos, onContatoSalvo }) {
  const [expandido, setExpandido] = useState(null);
  const [descricao, setDescricao] = useState("");
  const [salvando, setSalvando] = useState(false);

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
                        <p className="font-medium text-slate-700">Último contato: {ir.ultimoContato.status}</p>
                        {ir.ultimoContato.descricao && <p className="text-slate-600 mt-1">{ir.ultimoContato.descricao}</p>}
                        <p className="text-xs text-slate-400 mt-1">
                          {ir.ultimoContato.data_contato ? new Date(ir.ultimoContato.data_contato).toLocaleDateString("pt-BR") : ""} — por {ir.ultimoContato.registrado_por}
                        </p>
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

      {/* Histórico de contatos recentes */}
      {contatos.length > 0 && (
        <div className="space-y-3 mt-6">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Histórico de Contatos Recentes</h3>
          <div className="space-y-2">
            {contatos.slice(0, 10).map(c => (
              <Card key={c.id} className="bg-slate-50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-medium text-sm text-slate-800">{c.irmao_nome}</p>
                      {c.descricao && <p className="text-xs text-slate-600 mt-0.5">{c.descricao}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={c.status === "Contatado" ? "bg-green-100 text-green-700" : c.status === "Sem Contato" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}>
                        {c.status === "Contatado" ? <><Phone className="w-3 h-3 mr-1" />{c.status}</> : c.status === "Sem Contato" ? <><PhoneOff className="w-3 h-3 mr-1" />{c.status}</> : c.status}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {c.data_contato ? new Date(c.data_contato).toLocaleDateString("pt-BR") : ""}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}