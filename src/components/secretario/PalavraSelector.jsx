import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import OradoresLista from "@/components/secretario/OradoresLista";
import OradorForm from "@/components/secretario/OradorForm";

export default function PalavraSelector({ oradores, onChange }) {
  return <Card><CardContent className="space-y-3 p-4">
    <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground"><MessageSquare className="h-4 w-4" />Usaram da Palavra</h2>
    <OradorForm onAdicionar={(orador) => onChange([...oradores, orador])} />
    <OradoresLista oradores={oradores} onChange={onChange} />
  </CardContent></Card>;
}