# Loja Cavaleiros da Paz nº 25

Frontend React/Vite da loja, publicado no VPS2 com o tenant `cpaz25`.

## Endereços

- Aplicação: **https://cpaz25.maconaria.dpdns.org**
- Domínio principal: https://maconaria.dpdns.org (redireciona para `cpaz25`)
- Repositório: https://github.com/DiogoRachid/loja-cavaleiros-da-paz
- VPS2: `137.131.240.231`, Nginx do host.

No Cloudflare, os registros `A @` e `A cpaz25` apontam para o VPS2. O
certificado Let's Encrypt cobre os dois nomes e é renovado pelo Certbot.

## Atualizar o frontend

Na máquina com o repositório, Node.js, tar e a chave SSH de acesso ao VPS2:

```bash
bash deploy/publish-vps2.sh
```

O script instala as dependências do lockfile, compila o frontend e publica uma
release. As variáveis públicas de build são `VITE_BASE44_APP_ID` e
`VITE_BASE44_BACKEND_URL`, definidas no script para a aplicação existente.
`VPS2_HOST` e `SSH_KEY` podem ser informadas para ajustar o acesso SSH.

Estrutura no VPS2:

```text
/var/www/maconaria/tenants/cpaz25/
├── current -> releases/<data>-<commit>
└── releases/
```

A troca de `current` é atômica. Para voltar a uma release anterior, no VPS2:

```bash
ln -s releases/<release-anterior> /var/www/maconaria/tenants/cpaz25/current.rollback
mv -Tf /var/www/maconaria/tenants/cpaz25/current.rollback /var/www/maconaria/tenants/cpaz25/current
```

## Nginx e HTTPS

- Configuração: `deploy/nginx.conf`, instalada em
  `/etc/nginx/sites-available/maconaria.dpdns.org` e habilitada em `sites-enabled`.
- `deploy/nginx-http.conf` é usado somente na primeira emissão do certificado.
- Webroot ACME: `/var/www/letsencrypt`.
- Certificado: `/etc/letsencrypt/live/maconaria.dpdns.org/`.
- Hook de renovação: `deploy/certbot-reload.sh`, instalado em
  `/etc/letsencrypt/renewal-hooks/deploy/maconaria-reload` para recarregar o Nginx.
- Logs: `/var/log/nginx/maconaria-cpaz25.{access,error}.log`.
- `/functions/arquivo` mantém o proxy de arquivos usado anteriormente na Vercel.
- As rotas SPA funcionam por acesso direto; assets inexistentes retornam 404.

Após alterar a configuração do Nginx, executar `sudo nginx -t` antes de
`sudo systemctl reload nginx`.

## Tenants e serviços da aplicação

`cpaz25` é o primeiro tenant de hospedagem, com endereço e diretório próprios.
Os links de arquivos e a prévia de compartilhamento usam o domínio em que o
frontend está aberto, inclusive ao receber links antigos da Vercel/Base44.

O frontend continua conectado às funções do backend Base44 existente, que acessam
o **Supabase do VPS2**. A Evolution API configurada no Storage privado desse
Supabase é **https://evolution.rachid.dpdns.org**, também no VPS2.

A hospedagem por subdomínio ainda não implementa isolamento de dados
entre várias lojas. Para cadastrar outros tenants de aplicação, será necessário
implementar também a resolução do tenant e a autorização no backend/banco.

As funções executadas no Base44 têm seu próprio ciclo de publicação. O código em
`base44/shared/storage.ts` e `base44/shared/divulgacaoBiblioteca.ts` já usa o novo
domínio; a alteração precisa ser sincronizada/publicada no Base44 para valer nas
mensagens geradas no servidor. A publicação do frontend no VPS2 é realizada pelo
script acima.
