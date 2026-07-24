import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { MessageSquare, Send, Users, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function AdminComunicados() {
  const [irmaos, setIrmaos] = useState([]);
  const [sessoes, setSessoes] = useState([]);
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [destinatario, setDestinatario] = useState("todos");
  const [sessaoRef, setSessaoRef] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviados, setEnviados] = useState([]);
  const admin = JSON.parse(sessionStorage.getItem("admin_data") || "{}");

  useEffect(() => { loadDados(); }, []);

  const loadDados = async () => {
    const [ir, s] = await Promise.all([
      db.Irmao.filter({ ativo: true }),
      db.Sessao.filter({ status: "Agendada" }),
    ]);
    setIrmaos(ir);
    setSessoes(s);
  };

  const gerarTextoPadrao = () => {
    const sessao = sessoes.find(s => s.id === sessaoRef);
    if (!sessao) return;
    setAssunto(`Convocação — ${sessao.tipo} — ${sessao.data}`);
    setMensagem(`Prezado Irmão,

Convocamos Vossa Senhoria para a ${sessao.tipo} desta Respeitável Loja, a realizar-se no dia ${sessao.data} às ${sessao.hora}h${sessao.local ? `, no ${sessao.local}` : ""}.

${sessao.pauta ? `Pauta:\n${sessao.pauta}` : ""}

Contamos com vossa assídua presença.

Fraternalmente,
Ir. ${admin.nome_completo || ""}
Chanceler`);
  };

  const enviar = async () => {
    if (!assunto || !mensagem) return alert("Preencha o assunto e a mensagem.");
    setEnviando(true);

    const destinatarios = destinatario === "todos"
      ? irmaos.filter(i => i.email)
      : irmaos.filter(i => i.email && (
          destinatario === "mestres" ? i.grau === "Mestre" :
          destinatario === "regulares" ? i.situacao === "Regular" : true
        ));

    let count = 0;
    for (const ir of destinatarios) {
      await base44.integrations.Core.SendEmail({
        to: ir.email,
        subject: assunto,
        body: mensagem.replace(/\n/g, "<br/>"),
        from_name: `Loja Cavaleiros da Paz — Chancelaria`,
      });
      count++;
    }

    setEnviados(prev => [{ assunto, destinatarios: count, data: new Date().toLocaleDateString("pt-BR"), id: Date.now() }, ...prev]);
    setAssunto(""); setMensagem(""); setSessaoRef("");
    setEnviando(false);
    alert(`Comunicado enviado para ${count} irmão(s).`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-[#C9A227]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A5F]">Comunicados</h1>
          <p className="text-slate-500">Envio de comunicados oficiais por email</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-[#1B3A5F] mx-auto mb-2" />
            <p className="text-2xl font-bold">{irmaos.filter(i => i.email).length}</p>
            <p className="text-xs text-slate-500">Irmãos com email</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Send className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{enviados.length}</p>
            <p className="text-xs text-slate-500">Comunicados enviados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="w-8 h-8 text-[#C9A227] mx-auto mb-2" />
            <p className="text-2xl font-bold">{sessoes.length}</p>
            <p className="text-xs text-slate-500">Sessões agendadas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-[#1B3A5F]">Novo Comunicado</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Destinatários</Label>
              <Select value={destinatario} onValueChange={setDestinatario}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Irmãos</SelectItem>
                  <SelectItem value="regulares">Apenas Regulares</SelectItem>
                  <SelectItem value="mestres">Apenas Mestres</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Referência de Sessão (opcional)</Label>
              <div className="flex gap-2">
                <Select value={sessaoRef} onValueChange={setSessaoRef}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Selecionar sessão..." /></SelectTrigger>
                  <SelectContent>
                    {sessoes.map(s => <SelectItem key={s.id} value={s.id}>{s.tipo} — {s.data}</SelectItem>)}
                  </SelectContent>
                </Select>
                {sessaoRef && (
                  <Button type="button" variant="outline" size="sm" onClick={gerarTextoPadrao} className="text-[#1B3A5F]">
                    Gerar
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Assunto *</Label>
            <Input value={assunto} onChange={e => setAssunto(e.target.value)} placeholder="Assunto do email" />
          </div>
          <div className="space-y-1">
            <Label>Mensagem *</Label>
            <Textarea value={mensagem} onChange={e => setMensagem(e.target.value)} rows={8} placeholder="Corpo do comunicado..." />
          </div>
          <div className="flex justify-end">
            <Button onClick={enviar} disabled={enviando} className="bg-[#1B3A5F] text-white">
              <Send className="w-4 h-4 mr-2" />{enviando ? "Enviando..." : "Enviar Comunicado"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {enviados.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-[#1B3A5F] text-base">Histórico da Sessão</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {enviados.map(e => (
              <div key={e.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{e.assunto}</p>
                    <p className="text-xs text-slate-500">{e.data} • {e.destinatarios} destinatário(s)</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Enviado</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}