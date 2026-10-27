import { db } from "@/api/db";
import { confirmarObraPermitida } from "@/lib/acessoBiblioteca";

export default async function abrirDocumentoBiblioteca(id) {
  const janela = window.open("about:blank", "_blank");
  if (janela) janela.opener = null;
  try {
    const { irmao, obra } = await confirmarObraPermitida("digital", id);
    if (!obra.arquivo_url) throw new Error("Arquivo indisponível.");
    if (!janela) throw new Error("Permita a abertura de uma nova aba para visualizar o PDF.");
    janela.location.replace(obra.arquivo_url);
    db.LogDownload.create({ documento_id: obra.id, documento_titulo: obra.titulo,
      irmao_id: irmao.id, irmao_nome: irmao.nome_completo,
      irmao_numero_glp: irmao.numero_glp, data_download: new Date().toISOString(),
    }).catch(console.error);
    return { irmao, obra };
  } catch (error) {
    janela?.close();
    throw error;
  }
}