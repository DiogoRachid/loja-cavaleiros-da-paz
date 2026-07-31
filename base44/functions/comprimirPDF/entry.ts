import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { PDFDocument } from 'npm:pdf-lib@1.17.1';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { url } = await req.json();
  if (!url) return Response.json({ error: 'URL ausente' }, { status: 400 });

  const response = await fetch(url);
  if (!response.ok) return Response.json({ error: 'Erro ao baixar PDF' }, { status: 500 });

  const arrayBuffer = await response.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  // Re-salva o PDF removendo objetos desnecessários (compressão leve)
  const compressed = await pdfDoc.save({ useObjectStreams: true });

  return new Response(compressed, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=documento.pdf',
    },
  });
});