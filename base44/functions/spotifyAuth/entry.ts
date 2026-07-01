import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
    const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");
    if (!clientId || !clientSecret) {
      return Response.json({ error: "Credenciais Spotify não configuradas" }, { status: 500 });
    }

    const { action, code, redirect_uri } = await req.json();

    if (action === "authorize_url") {
      const scope = "playlist-read-private playlist-read-collaborative";
      const params = new URLSearchParams({
        client_id: clientId,
        response_type: "code",
        redirect_uri,
        scope,
      });
      return Response.json({ url: `https://accounts.spotify.com/authorize?${params.toString()}` });
    }

    if (action === "status") {
      const tokens = await base44.asServiceRole.entities.SpotifyToken.list();
      return Response.json({ connected: tokens.length > 0 });
    }

    if (action === "disconnect") {
      const tokens = await base44.asServiceRole.entities.SpotifyToken.list();
      for (const t of tokens) {
        await base44.asServiceRole.entities.SpotifyToken.delete(t.id);
      }
      return Response.json({ success: true });
    }

    if (action === "exchange_code") {
      const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Basic " + btoa(clientId + ":" + clientSecret),
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri,
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        return Response.json({ error: "Falha ao trocar código por token", details: tokenData }, { status: 500 });
      }

      const existing = await base44.asServiceRole.entities.SpotifyToken.list();
      const payload = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || existing[0]?.refresh_token || "",
        expires_at: Date.now() + (tokenData.expires_in || 3600) * 1000,
      };
      if (existing.length > 0) {
        await base44.asServiceRole.entities.SpotifyToken.update(existing[0].id, payload);
      } else {
        await base44.asServiceRole.entities.SpotifyToken.create(payload);
      }
      return Response.json({ success: true });
    }

    if (action === "my_playlists") {
      const existing = await base44.asServiceRole.entities.SpotifyToken.list();
      const tokenRecord = existing[0];
      if (!tokenRecord) {
        return Response.json({ error: "Spotify não conectado" }, { status: 400 });
      }

      let accessToken = tokenRecord.access_token;

      if (!tokenRecord.expires_at || Date.now() >= tokenRecord.expires_at - 60000) {
        const refreshRes = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + btoa(clientId + ":" + clientSecret),
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: tokenRecord.refresh_token,
          }),
        });
        const refreshData = await refreshRes.json();
        if (!refreshData.access_token) {
          return Response.json({ error: "Falha ao renovar token", details: refreshData }, { status: 500 });
        }
        accessToken = refreshData.access_token;
        await base44.asServiceRole.entities.SpotifyToken.update(tokenRecord.id, {
          access_token: accessToken,
          refresh_token: refreshData.refresh_token || tokenRecord.refresh_token,
          expires_at: Date.now() + (refreshData.expires_in || 3600) * 1000,
        });
      }

      let playlists = [];
      let url = "https://api.spotify.com/v1/me/playlists?limit=50";
      while (url) {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (res.status !== 200) {
          return Response.json({ error: "Spotify API error", status: res.status, details: data }, { status: 500 });
        }
        playlists = playlists.concat(
          (data.items || []).filter((p) => p !== null).map((p) => ({
            spotify_playlist_id: p.id,
            spotify_playlist_name: p.name,
            spotify_playlist_image: p.images?.[0]?.url || "",
            spotify_playlist_uri: p.uri,
            owner: p.owner?.display_name || "",
            tracks_total: p.tracks?.total || 0,
          }))
        );
        url = data.next || null;
      }

      return Response.json({ playlists });
    }

    return Response.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});