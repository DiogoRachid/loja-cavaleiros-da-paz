import { Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CredenciaisOficial({ numeroGlp, senha, loading, onNumeroGlp, onSenha, onSubmit }) {
  return <form onSubmit={onSubmit} className="space-y-5">
    <fieldset disabled={loading} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="oficial-glp" className="text-primary-foreground">Número GLP</Label>
        <div className="relative"><User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id="oficial-glp" value={numeroGlp} onChange={(event) => onNumeroGlp(event.target.value)} placeholder="Seu número de cadastro GLP" autoComplete="username" required className="portal-login-input border-lodge-gold/30 bg-background pl-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-lodge-gold" /></div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="oficial-senha" className="text-primary-foreground">Senha</Label>
        <div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id="oficial-senha" type="password" value={senha} onChange={(event) => onSenha(event.target.value)} placeholder="Sua senha" autoComplete="current-password" required className="portal-login-input border-lodge-gold/30 bg-background pl-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-lodge-gold" /></div>
      </div>
    </fieldset>
    <p className="text-xs text-primary-foreground/75">Quando houver mais de uma função disponível, você poderá escolher entre titular e substituto após a verificação do cadastro.</p>
    <Button type="submit" disabled={loading || !numeroGlp.trim() || !senha} className="w-full bg-lodge-gold font-semibold text-landing-deep hover:bg-lodge-gold/80">{loading ? "Verificando..." : "Entrar"}</Button>
  </form>;
}