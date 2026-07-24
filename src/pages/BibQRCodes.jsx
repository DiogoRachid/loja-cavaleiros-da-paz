import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { 
  Search, QrCode, Loader2, Download, Printer,
  BookOpen, FileText, Newspaper, Archive
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import QRCodeDisplay from "@/components/biblioteca/QRCodeDisplay";

export default function BibQRCodes() {
  const navigate = useNavigate();
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  // Código QR fixo para devolução
  const codigoDevolucao = "LCP25-DEVOLUCAO-BIBLIOTECA";

  useEffect(() => {
    const bibAuth = sessionStorage.getItem("bib_auth");
    if (bibAuth !== "true") {
      navigate(createPageUrl("BibLogin"));
      return;
    }
    loadItens();
  }, []);

  const loadItens = async () => {
    try {
      const data = await db.Item.filter({ ativo: true });
      setItens(data);
    } catch (error) {
      console.error("Erro ao carregar itens:", error);
    }
    setLoading(false);
  };

  const tipoIcons = {
    "Livro": BookOpen,
    "Revista": FileText,
    "Periódico": Newspaper,
    "Outro": Archive
  };

  const filteredItens = itens.filter(item => 
    item.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.codigo_qr?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B3A5F]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">QR Codes</h1>
        <p className="text-slate-500">Gerencie os códigos QR do acervo</p>
      </div>

      {/* QR Code de Devolução */}
      <Card className="border-[#C9A227] bg-gradient-to-br from-amber-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#C9A227]" />
            QR Code de Devolução (Fixo na Biblioteca)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4">
            Este QR Code deve ser impresso e fixado na biblioteca. 
            Os irmãos o escaneiam para iniciar o processo de devolução.
          </p>
          <QRCodeDisplay value={codigoDevolucao} itemName="Devolucao-Biblioteca" size={250} />
        </CardContent>
      </Card>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Buscar item pelo nome ou código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de QR Codes dos Itens */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItens.map((item) => {
          const TipoIcon = tipoIcons[item.tipo] || Archive;
          return (
            <Card 
              key={item.id} 
              className={`cursor-pointer transition-all ${
                selectedItem?.id === item.id ? "ring-2 ring-[#1B3A5F]" : "hover:shadow-md"
              }`}
              onClick={() => setSelectedItem(item)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <TipoIcon className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-800 truncate">{item.nome}</h3>
                    <p className="text-xs text-slate-500 truncate">{item.autor}</p>
                  </div>
                  <Badge variant="outline">{item.tipo}</Badge>
                </div>
                
                {item.codigo_qr ? (
                  <div className="text-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(item.codigo_qr)}`}
                      alt="QR Code"
                      className="mx-auto rounded border"
                    />
                    <p className="text-xs text-slate-400 mt-2 font-mono truncate">
                      {item.codigo_qr}
                    </p>
                  </div>
                ) : (
                  <p className="text-center text-slate-400 py-4">
                    Sem QR Code
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Item Selecionado - QR Code Grande */}
      {selectedItem && selectedItem.codigo_qr && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">{selectedItem.nome}</CardTitle>
          </CardHeader>
          <CardContent>
            <QRCodeDisplay 
              value={selectedItem.codigo_qr} 
              itemName={selectedItem.nome}
              size={300}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}