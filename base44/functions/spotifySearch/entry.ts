import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { action, query, playlist_id } = await req.json();
    const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
    const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      return Response.json({ error: "Credenciais Spotify não configuradas" }, { status: 500 });
    }

    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + btoa(clientId + ":" + clientSecret),
      },
      body: "grant_type=client_credentials",
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return Response.json({ error: "Falha ao autenticar no Spotify", details: tokenData }, { status: 500 });
    }
    const token = tokenData.access_token;

    if (action === "search") {
      const params = new URLSearchParams({ q: query, type: "playlist", limit: "10" });
      const res = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.status !== 200) {
        return Response.json({ error: "Spotify API error", status: res.status, details: data }, { status: 500 });
      }
      const playlists = (data.playlists?.items || []).filter(p => p !== null).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        image: p.images?.[0]?.url || "",
        owner: p.owner?.display_name || "",
        tracks_total: p.tracks?.total || 0,
        uri: p.uri,
      }));
      return Response.json({ playlists });
    }

    if (action === "search_tracks") {
      const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`;
      const res = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.status !== 200) {
        return Response.json({ error: "Spotify API error", status: res.status, details: data }, { status: 500 });
      }
      const tracks = (data.tracks?.items || []).filter(t => t !== null).map(t => ({
        id: t.id,
        name: t.name,
        artists: t.artists?.map(a => a.name).join(", ") || "",
        album: t.album?.name || "",
        duration_ms: t.duration_ms,
        preview_url: t.preview_url,
        uri: t.uri,
        image: t.album?.images?.[0]?.url || "",
      }));
      return Response.json({ tracks });
    }

    if (action === "tracks") {
      // Playlists particulares da biblioteca exigem o token do usuário conectado (não o client_credentials)
      let authToken = token;
      const existingTokens = await base44.asServiceRole.entities.SpotifyToken.list();
      const tokenRecord = existingTokens[0];
      if (tokenRecord) {
        authToken = tokenRecord.access_token;
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
          if (refreshData.access_token) {
            authToken = refreshData.access_token;
            await base44.asServiceRole.entities.SpotifyToken.update(tokenRecord.id, {
              access_token: authToken,
              refresh_token: refreshData.refresh_token || tokenRecord.refresh_token,
              expires_at: Date.now() + (refreshData.expires_in || 3600) * 1000,
            });
          }
        }
      }

      const res = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.status !== 200) {
        return Response.json({ error: "Spotify tracks error", status: res.status, details: data }, { status: 500 });
      }
      if (!data.tracks) {
        return Response.json({
          error: "Esta playlist pertence a outra conta Spotify e o app não tem permissão para acessar suas músicas (limitação do modo de desenvolvimento do Spotify).",
          tracks: [],
        }, { status: 200 });
      }
      const rawItems = data.items?.items || data.tracks?.items || [];
      const tracks = rawItems
        .map(entry => entry?.item?.name ? entry.item : (entry?.track || entry?.item?.track))
        .filter(track => track && track.name)
        .map(track => ({
          id: track.id,
          name: track.name,
          artists: track.artists?.map(a => a.name).join(", ") || "",
          album: track.album?.name || "",
          duration_ms: track.duration_ms,
          preview_url: track.preview_url,
          uri: track.uri,
          image: track.album?.images?.[0]?.url || "",
        }));
      return Response.json({ tracks });
    }

    return Response.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});