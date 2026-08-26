import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Check, Loader2 } from "lucide-react";

export default function OrdemDoDiaEditor({ valor, onSalvar }) {
  const [texto, setTexto] = useState(valor || "");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const salvar = async () => {
    setSalvando(true);
    await onSalvar(texto);
    setSalvando(false);
    setSalvo(true);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-[#1B3A5F]">Ordem do Dia</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          rows={6}
          value={texto}
          onChange={(e) => { setTexto(e.target.value); setSalvo(false); }}
          placeholder={"1. Leitura e aprovação do balaústre anterior\n2. Leitura do expediente\n3. ..."}
        />
        <Button onClick={salvar} disabled={salvando} className="bg-[#1B3A5F] hover:bg-[#152e4d] gap-2">
          {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : salvo ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {salvando ? "Salvando..." : salvo ? "Salvo" : "Salvar ordem do dia"}
        </Button>
      </CardContent>
    </Card>
  );
}