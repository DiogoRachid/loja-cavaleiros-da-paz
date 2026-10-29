#!/bin/sh
set -eu

if [ "${RENEWED_LINEAGE:-}" = /etc/letsencrypt/live/maconaria.dpdns.org ]; then
  nginx -t && systemctl reload nginx
fi
