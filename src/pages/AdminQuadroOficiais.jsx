import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Award, Save, Eye, CheckCircle, Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CARGOS = [
  "Venerável Mestre","Primeiro Vigilante","Segundo Vigilante","Orador",
  "Secretário","Tesoureiro","Chanceler","Bibliotecário","Mestre de Cerimônias",
  "Primeiro Diácono","Segundo Diácono","Porta Bandeira","Porta Estandarte","Porta Espada",
  "Arquiteto","Hospitaleiro","Mestre de Harmonia","Secretário de Ação Social","Guarda do Templo",
  "Guarda Externo","Primeiro Experto","Segundo Experto","Mestre de Banquetes"
];

const EXERCICIO = new Date().getFullYear().toString();
const admin = () => JSON.parse(sessionStorage.getItem("admin_data") || "{}");
const isVM = () => {
  const cargo = sessionStorage.getItem("admin_cargo");
  return cargo === "Venerável Mestre" || cargo === "Secretário";
};

export default function AdminQuadroOficiais() {
  const [quadro, setQuadro] = useState([]);
  const [irmaos, setIrmaos] = useState([]);
  const [editando, setEditando] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publicado, setPublicado] = useState(false);

  useEffect(() => { loadDados(); }, []);

  const loadDados = async () => {
    const [q, ir] = await Promise.all([
      base44.entities.QuadroOficiais.filter({ exercicio: EXERCICIO }),
      base44.entities.Irmao.filter({ ativo: true }),
    ]);
    setIrmaos(ir);
    if (q.length > 0) {
      setQuadro(q);
      setPublicado(q[0]?.publicado || false);
    } else {
      // Inicializar quadro vazio
      setQuadro(CARGOS.map(cargo => ({ cargo, exercicio: EXERCICIO, titular_id: "", titular_nome: "", substituto_id: "", substituto_nome: "", publicado: false })));
    }
  };

  const handleChange = (cargo, field, value) => {
    setQuadro(prev => prev.map(q => {
      if (q.cargo !== cargo) return q;
      if (field === "cargo") return { ...q, cargo: value };
      const irmao = irmaos.find(i => i.id === value);
      if (field === "titular_id") return { ...q, titular_id: value, titular_nome: irmao?.nome_completo || "" };
      if (field === "substituto_id") return { ...q, substituto_id: value, substituto_nome: irmao?.nome_completo || "" };
      return q;
    }));
  };

  const irmaosOrdenados = [...irmaos].sort((a, b) => a.nome_completo.localeCompare(b.nome_completo, "pt-BR"));

  const salvar = async () => {
    setSaving(true);
    for (const item of quadro) {
      if (item.id) {
        await base44.entities.QuadroOficiais.update(item.id, item);
      } else {
        const criado = await base44.entities.QuadroOficiais.create(item);
        item.id = criado.id;
      }
    }
    setEditando(false);
    setSaving(false);
  };

  const publicar = async () => {
    for (const item of quadro) {
      if (item.id) await base44.entities.QuadroOficiais.update(item.id, { publicado: true, data_publicacao: new Date().toISOString().split("T")[0] });
    }
    setPublicado(true);
    setQuadro(prev => prev.map(q => ({ ...q, publicado: true })));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
            <Award className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A5F]">Quadro de Oficiais</h1>
            <p className="text-slate-500">Exercício {EXERCICIO}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {publicado && <Badge className="bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Publicado</Badge>}
          {isVM() && !editando && <Button onClick={() => setEditando(true)} variant="outline" className="border-[#1B3A5F] text-[#1B3A5F]"><Edit2 className="w-4 h-4 mr-2" />Editar</Button>}
          {isVM() && editando && <Button onClick={salvar} disabled={saving} className="bg-[#1B3A5F] text-white"><Save className="w-4 h-4 mr-2" />{saving ? "Salvando..." : "Salvar"}</Button>}
          {isVM() && !publicado && !editando && quadro.length > 0 && (
            <Button onClick={publicar} className="bg-[#C9A227] text-[#1B3A5F] font-semibold"><Eye className="w-4 h-4 mr-2" />Publicar</Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1B3A5F] text-white">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium">Cargo</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Titular</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Substituto</th>
                </tr>
              </thead>
              <tbody>
                {quadro.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="px-4 py-3 font-medium text-[#1B3A5F] text-sm">
                      {editando && isVM() ? (
                        <Input
                          value={item.cargo}
                          onChange={e => handleChange(item.cargo, "cargo", e.target.value)}
                          className="h-8 text-sm font-medium text-[#1B3A5F]"
                        />
                      ) : item.cargo}
                    </td>
                    <td className="px-4 py-3">
                      {editando && isVM() ? (
                        <Select value={item.titular_id} onValueChange={v => handleChange(item.cargo, "titular_id", v)}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                          <SelectContent>{irmaosOrdenados.map(i => <SelectItem key={i.id} value={i.id}>{i.nome_completo}</SelectItem>)}</SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm text-slate-700">{item.titular_nome || <span className="text-slate-400 italic">Não definido</span>}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editando && isVM() ? (
                        <Select value={item.substituto_id} onValueChange={v => handleChange(item.cargo, "substituto_id", v)}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                          <SelectContent>{irmaosOrdenados.map(i => <SelectItem key={i.id} value={i.id}>{i.nome_completo}</SelectItem>)}</SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm text-slate-500">{item.substituto_nome || "—"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}