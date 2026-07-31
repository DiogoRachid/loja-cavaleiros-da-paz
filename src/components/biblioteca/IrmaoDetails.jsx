import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, Phone, Calendar, Award, History, Loader2, BookOpen 
} from "lucide-react";
import { format, parseISO } from "date-fns";

export default function IrmaoDetails({ irmao, onClose }) {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, ativos: 0 });

  useEffect(() => {
    if (irmao) {
      loadHistorico();
    }
  }, [irmao]);

  const loadHistorico = async () => {
    try {
      const emprestimos = await base44.entities.Emprestimo.filter(
        { irmao_id: irmao.id },
        "-data_retirada",
        50
      );
      setHistorico(emprestimos);
      setStats({
        total: emprestimos.length,
        ativos: emprestimos.filter(e => e.status === "Ativo").length
      });
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
    setLoading(false);
  };

  if (!irmao) return null;

  const grauColors = {
    "Aprendiz": "bg-blue-100 text-blue-700",
    "Companheiro": "bg-amber-100 text-amber-700",
    "Mestre": "bg-emerald-100 text-emerald-700"
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1B3A5F] to-[#2d5a8f] flex items-center justify-center text-white font-bold text-2xl">
          {irmao.nome_completo?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-800">{irmao.nome_completo}</h2>
          {irmao.numero_glp && (
            <p className="text-slate-500">GLP: {irmao.numero_glp}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {irmao.grau && (
              <Badge className={grauColors[irmao.grau]}>
                <Award className="w-3 h-3 mr-1" />
                {irmao.grau}
              </Badge>
            )}
            <Badge variant="outline">
              <BookOpen className="w-3 h-3 mr-1" />
              {stats.ativos} empréstimo(s) ativo(s)
            </Badge>
          </div>
        </div>
      </div>

      {/* Informações de Contato */}
      <div className="grid sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
        {irmao.email && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
              <Mail className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="text-sm font-medium">{irmao.email}</p>
            </div>
          </div>
        )}
        {irmao.telefone && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
              <Phone className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Telefone</p>
              <p className="text-sm font-medium">{irmao.telefone}</p>
            </div>
          </div>
        )}
        {irmao.data_iniciacao && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
              <Calendar className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Data de Iniciação</p>
              <p className="text-sm font-medium">
                {format(parseISO(irmao.data_iniciacao), "dd/MM/yyyy")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Observações */}
      {irmao.observacoes && (
        <div className="p-4 bg-slate-50 rounded-xl">
          <p className="text-xs text-slate-500 mb-1">Observações</p>
          <p className="text-sm text-slate-700">{irmao.observacoes}</p>
        </div>
      )}

      {/* Histórico de Empréstimos */}
      <div className="border rounded-xl p-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <History className="w-5 h-5" />
          Histórico de Empréstimos ({stats.total})
        </h3>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : historico.length === 0 ? (
          <p className="text-slate-500 text-center py-4">
            Nenhum empréstimo registrado
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {historico.map((emp) => (
              <div 
                key={emp.id} 
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-slate-700">{emp.item_nome}</p>
                  <p className="text-sm text-slate-500">
                    Retirada: {emp.data_retirada && format(parseISO(emp.data_retirada), "dd/MM/yyyy")}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={emp.status === "Ativo" ? "default" : "secondary"}>
                    {emp.status}
                  </Badge>
                  {emp.data_devolucao && (
                    <p className="text-xs text-slate-500 mt-1">
                      Devolvido: {format(parseISO(emp.data_devolucao), "dd/MM/yyyy")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}