import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, query, playlist_id } = await req.json();
    const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
    const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");

    // Get access token via client credentials
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
      console.error("Spotify token error:", JSON.stringify(tokenData));
      return Response.json({ error: "Falha ao autenticar no Spotify", details: tokenData }, { status: 500 });
    }
    const token = tokenData.access_token;

    if (action === "search") {
      const params = new URLSearchParams({ q: query, type: "playlist", limit: "10" });
      const searchUrl = `https://api.spotify.com/v1/search?${params.toString()}`;
      const res = await fetch(searchUrl, { headers: { Authorization: `Bearer ${token}` } });
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

    if (action === "tracks") {
      const res = await fetch(
        `https://api.spotify.com/v1/playlists/${playlist_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.status !== 200) {
        return Response.json({ error: "Spotify tracks error", status: res.status, details: data }, { status: 500 });
      }
      const rawItems = data.tracks?.items || [];
      if (rawItems.length > 0) {
        console.log("First raw item keys:", Object.keys(rawItems[0]), "track exists:", !!rawItems[0].track);
      } else {
        console.log("No items in tracks. tracks object keys:", Object.keys(data.tracks || {}));
      }
      const tracks = rawItems
        .filter(item => item && item.track)
        .map(item => ({
          id: item.track.id,
          name: item.track.name,
          artists: item.track.artists?.map(a => a.name).join(", ") || "",
          album: item.track.album?.name || "",
          duration_ms: item.track.duration_ms,
          preview_url: item.track.preview_url,
          uri: item.track.uri,
          image: item.track.album?.images?.[0]?.url || "",
        }));
      return Response.json({ tracks });
    }

    return Response.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});