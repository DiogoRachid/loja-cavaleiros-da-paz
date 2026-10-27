import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BibliotecaAcessoAviso({ mensagem, onRetry }) {
  return <div role="alert" className="space-y-3 rounded-lg border border-border bg-card p-6 text-center">
    <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
    <p className="text-sm text-foreground">{mensagem}</p>
    {onRetry && <Button variant="outline" onClick={onRetry}>Tentar novamente</Button>}
  </div>;
}