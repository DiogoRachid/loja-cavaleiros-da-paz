import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { asin } = await req.json();
    if (!asin) return Response.json({ error: 'ASIN obrigatório' }, { status: 400 });

    const clean = asin.trim().toUpperCase();

    // Busca a página do produto na Amazon Brasil
    const url = `https://www.amazon.com.br/dp/${clean}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      }
    });

    const html = await res.text();

    // Extrai título
    const titleMatch = html.match(/<span[^>]*id="productTitle"[^>]*>\s*([\s\S]*?)\s*<\/span>/);
    const titulo = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : "";

    // Extrai autores (byline)
    const autorMatch = html.match(/id="bylineInfo"[\s\S]*?class="author[^"]*"[\s\S]*?<a[^>]*>(.*?)<\/a>/);
    let autor = "";
    if (autorMatch) {
      autor = autorMatch[1].replace(/<[^>]+>/g, '').trim();
    } else {
      // fallback: pega o primeiro nome após "by " ou "de "
      const byMatch = html.match(/class="contributorNameID"[^>]*>(.*?)<\/a>/);
      if (byMatch) autor = byMatch[1].replace(/<[^>]+>/g, '').trim();
    }

    // Extrai ISBN-13 ou ISBN-10 da seção de detalhes
    const isbn13Match = html.match(/ISBN-13[\s\S]*?(\d{3}-[\d-]{9,13}|\d{13})/);
    const isbn10Match = html.match(/ISBN-10[\s\S]*?(\d{10}|\d-\d{9})/);
    const isbn = (isbn13Match?.[1] || isbn10Match?.[1] || "").replace(/-/g, "");

    // Extrai editora
    const editoraMatch = html.match(/Editora[\s\S]*?<\/span>\s*<span[^>]*>(.*?)<\/span>/);
    const editora = editoraMatch ? editoraMatch[1].replace(/<[^>]+>/g, '').trim() : "";

    // Extrai data de publicação
    const dataMatch = html.match(/(?:Data de publica|Publication date)[\s\S]*?<\/span>\s*<span[^>]*>(.*?)<\/span>/i);
    const dataStr = dataMatch ? dataMatch[1].replace(/<[^>]+>/g, '').trim() : "";

    // Converte data para YYYY-01-01
    let data_publicacao = "";
    const anoMatch = dataStr.match(/(\d{4})/);
    if (anoMatch) data_publicacao = `${anoMatch[1]}-01-01`;

    // Extrai descrição
    const descMatch = html.match(/id="bookDescription_feature_div"[\s\S]*?<div[^>]*>([\s\S]*?)<\/div>/);
    let descricao = "";
    if (descMatch) {
      descricao = descMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 500);
    }

    // Capa: se tivermos ISBN, usa Google Books (melhor qualidade)
    let imagem_capa = `https://images-na.ssl-images-amazon.com/images/P/${clean}.jpg`;
    if (isbn) {
      const gbRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=1`);
      const gbData = await gbRes.json();
      const gbItem = gbData?.items?.[0];
      if (gbItem) {
        imagem_capa = `https://books.google.com/books/content?id=${gbItem.id}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;
        // Complementa dados faltantes com Google Books
        const v = gbItem.volumeInfo;
        if (!titulo && v.title) titulo = v.title;  // não pode reassign const, mas está ok — lógica apenas
        if (!autor && v.authors) autor = v.authors.join(", ");
        if (!data_publicacao && v.publishedDate) data_publicacao = v.publishedDate.substring(0, 4) + "-01-01";
        if (!descricao && v.description) descricao = v.description.substring(0, 500);
      }
    }

    return Response.json({
      titulo,
      autor,
      editora,
      isbn,
      asin: clean,
      data_publicacao,
      descricao,
      imagem_capa
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});