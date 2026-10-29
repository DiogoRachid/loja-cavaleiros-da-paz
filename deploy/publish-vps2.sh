#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(dirname "$(dirname "$(realpath "$0")")")"
VPS2_HOST="${VPS2_HOST:-ubuntu@137.131.240.231}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/ssh-key-2026-06-04.key}"
SITE_ROOT=/var/www/maconaria/tenants/cpaz25
RELEASE="$(date -u +%Y%m%dT%H%M%SZ)-$(git -C "$PROJECT_DIR" rev-parse --short HEAD)"
SSH=(ssh -o BatchMode=yes -o StrictHostKeyChecking=yes -i "$SSH_KEY")

npm --prefix "$PROJECT_DIR" ci --no-audit --no-fund
VITE_BASE44_APP_ID=69aea997b473b479398fe231 \
VITE_BASE44_BACKEND_URL=https://base44.app \
  npm --prefix "$PROJECT_DIR" run build

# Cada tenant tem suas próprias releases; current só muda após a cópia terminar.
"${SSH[@]}" "$VPS2_HOST" \
  "ls -ld /var/www && sudo -n install -d -m 0755 /var/www/maconaria/tenants && sudo -n install -d -o ubuntu -g www-data -m 0755 '$SITE_ROOT' '$SITE_ROOT/releases' '$SITE_ROOT/releases/$RELEASE'"
tar -C "$PROJECT_DIR/dist" -cf - . | "${SSH[@]}" "$VPS2_HOST" \
  "tar -xf - -C '$SITE_ROOT/releases/$RELEASE' && chmod -R a+rX '$SITE_ROOT/releases/$RELEASE'"
"${SSH[@]}" "$VPS2_HOST" \
  "test -s '$SITE_ROOT/releases/$RELEASE/index.html' && ln -s 'releases/$RELEASE' '$SITE_ROOT/current.next' && mv -Tf '$SITE_ROOT/current.next' '$SITE_ROOT/current' && readlink -f '$SITE_ROOT/current'"
