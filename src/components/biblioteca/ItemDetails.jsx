import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, FileText, Newspaper, Archive, 
  MapPin, QrCode, History, Loader2 
} from "lucide-react";
import { format, parseISO } from "date-fns";
import QRCode from "@/components/biblioteca/QRCodeDisplay";

export default function ItemDetails({ item, onClose }) {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (item) {
      loadHistorico();
    }
  }, [item]);

  const loadHistorico = async () => {
    try {
      const emprestimos = await base44.entities.Emprestimo.filter(
        { item_id: item.id },
        "-data_retirada",
        20
      );
      setHistorico(emprestimos);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
    setLoading(false);
  };

  if (!item) return null;

  const tipoIcons = {
    "Livro": BookOpen,
    "Revista": FileText,
    "Periódico": Newspaper,
    "Outro": Archive
  };

  const TipoIcon = tipoIcons[item.tipo] || Archive;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-start gap-4">
        <div className="p-4 rounded-xl bg-[#1B3A5F]">
          <TipoIcon className="w-8 h-8 text-[#C9A227]" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-800">{item.nome}</h2>
          <p className="text-slate-500">{item.autor || "Autor não informado"}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge>{item.tipo}</Badge>
            <Badge variant={item.quantidade_disponivel > 0 ? "default" : "destructive"}>
              {item.quantidade_disponivel} disponíveis de {item.quantidade_total}
            </Badge>
          </div>
        </div>
      </div>

      {/* Informações */}
      <div className="grid sm:grid-cols-2 gap-4">
        {item.localizacao && (
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-4 h-4" />
            <span>{item.localizacao}</span>
          </div>
        )}
        {item.descricao && (
          <div className="sm:col-span-2">
            <p className="text-slate-600">{item.descricao}</p>
          </div>
        )}
      </div>

      {/* QR Code */}
      {item.codigo_qr && (
        <div className="border rounded-xl p-4 bg-slate-50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <QrCode className="w-5 h-5" />
            QR Code do Item
          </h3>
          <QRCode value={item.codigo_qr} itemName={item.nome} />
        </div>
      )}

      {/* Histórico */}
      <div className="border rounded-xl p-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <History className="w-5 h-5" />
          Histórico de Empréstimos
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
                  <p className="font-medium text-slate-700">{emp.irmao_nome}</p>
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
                      Dev: {format(parseISO(emp.data_devolucao), "dd/MM/yyyy")}
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