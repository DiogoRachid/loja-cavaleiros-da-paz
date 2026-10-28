import { MessageCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import useConfigEvolution from "@/components/configuracoes/useConfigEvolution";

export default function ConfigEvolution() {
  const usuario = JSON.parse(sessionStorage.getItem("admin_data") || "null");
  const permitido = (sessionStorage.getItem("admin_cargo") || usuario?.cargo) === "Venerável Mestre";
  const { config, carregando, salvando, erro, salvo, login, alterar, salvar } = useConfigEvolution(permitido);
  if (!permitido) return null;
  return <Card>
    <CardHeader><CardTitle className="flex items-center gap-2 text-base text-foreground"><MessageCircle className="h-4 w-4" /> WhatsApp · Evolution API</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <p className="text-sm text-muted-foreground">Biblioteca: ao confirmar “Compartilhar no grupo”, o bibliotecário envia a mensagem da obra ao grupo da Loja pela Evolution API. Cadastrar, editar ou disponibilizar obras não dispara mensagens. Informe abaixo os dados da instância conectada no seu VPS e o ID do grupo da Loja.</p>
      <p className="text-sm text-muted-foreground">Aniversários de nascimento dos Irmãos ativos: envio diário às 9h, no horário de Brasília, quando habilitado abaixo. Uma mensagem reúne os aniversariantes do dia; sem aniversariantes, não há envio.</p>
      {carregando ? <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Carregando configuração...</p> : <>
        <fieldset disabled={salvando || login} className="grid min-w-0 gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="evolution-url">URL da Evolution API</Label><Input id="evolution-url" type="url" value={config.url_api || ""} onChange={(event) => alterar("url_api", event.target.value)} placeholder="https://seu-servidor-evolution" /><p className="text-xs text-muted-foreground">Endereço base do serviço, sem /message/sendText.</p></div>
          <div className="space-y-2"><Label htmlFor="evolution-instancia">Nome da instância</Label><Input id="evolution-instancia" value={config.instancia || ""} onChange={(event) => alterar("instancia", event.target.value)} placeholder="Nome exato da instância conectada" /></div>
          <div className="space-y-2"><Label htmlFor="evolution-chave">Chave da API</Label><Input id="evolution-chave" type="password" autoComplete="new-password" value={config.chave_api} onChange={(event) => alterar("chave_api", event.target.value)} placeholder={config.chave_configurada ? "Chave configurada. Digite apenas para substituir." : "Informe a chave da Evolution API"} /><p className="text-xs text-muted-foreground">A chave é guardada no armazenamento privado externo e não é exibida novamente. Deixe em branco para manter a chave salva.</p></div>
          <div className="space-y-2"><Label htmlFor="evolution-destino">Número ou ID do grupo destinatário</Label><Input id="evolution-destino" value={config.destino} onChange={(event) => alterar("destino", event.target.value)} placeholder="5511999999999 ou 120363000000000000@g.us" /><p className="text-xs text-muted-foreground">Para divulgar obras, informe o ID completo do grupo da Loja terminado em @g.us, não o nome ou link de convite. Um número individual pode ser usado nos aniversários, mas não nas divulgações da biblioteca.</p></div>
          <div className="space-y-2 md:col-span-2"><Label htmlFor="evolution-ativo" className="flex items-center gap-2"><input id="evolution-ativo" type="checkbox" checked={config.aniversarios_ativos === true} onChange={(event) => alterar("aniversarios_ativos", event.target.checked)} /> Enviar aniversários automaticamente</Label><p className="text-xs text-muted-foreground">Salvar não envia imediatamente. O envio ocorre na próxima execução diária após completar a configuração, mesmo com o aplicativo fechado. Desmarque para pausar.</p></div>
        </fieldset>
        <Button type="button" onClick={salvar} disabled={salvando || login || !config.url_api?.trim() || !config.instancia?.trim() || !config.destino.trim() || (!config.chave_configurada && !config.chave_api.trim())}>{salvando ? "Salvando..." : "Salvar configuração WhatsApp"}</Button>
      </>}
      {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
      {login && <Button type="button" variant="outline" onClick={() => base44.auth.redirectToLogin(window.location.href)}>Entrar na conta administrativa</Button>}
      {salvo && <p role="status" className="text-sm text-muted-foreground">Configuração do WhatsApp salva.</p>}
    </CardContent>
  </Card>;
}