import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HandCoins } from "lucide-react";

// Tronco de Solidariedade (valor informado pelo Tesoureiro) e Bolsa de Propostas e Informações
export default function TroncoBolsaForm({ dados, onChange }) {
  const f = (k, v) => onChange({ ...dados, [k]: v });

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#1B3A5F]">
          <HandCoins className="w-4 h-4" /> Tronco de Solidariedade e Bolsa de Propostas
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Valor arrecadado no Tronco (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={dados.tronco_valor ?? ""}
              onChange={(e) => f("tronco_valor", e.target.value)}
              placeholder="0,00"
            />
          </div>
          <div className="space-y-1">
            <Label>Informado por (Tesoureiro)</Label>
            <Input
              value={dados.tronco_informante ?? ""}
              onChange={(e) => f("tronco_informante", e.target.value)}
              placeholder="Ir∴ Tesoureiro"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label>Bolsa de Propostas e Informações — decifrado pelo Venerável Mestre</Label>
          <Textarea
            rows={4}
            value={dados.bolsa_conteudo ?? ""}
            onChange={(e) => f("bolsa_conteudo", e.target.value)}
            placeholder="Documento, certificado, proposta ou informação encontrada na coleta (deixe em branco se nada foi encontrado)"
          />
        </div>
      </CardContent>
    </Card>
  );
}