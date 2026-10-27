import { db } from "@/api/db";

const GRAUS = ["Aprendiz", "Companheiro", "Mestre"];

// Regra de navegação do portal. Não substitui autorização no servidor.
export function grausPermitidosBiblioteca(irmao) {
  if (irmao?.ativo !== true) return [];
  const nivel = GRAUS.indexOf(irmao.grau);
  return nivel < 0 ? [] : GRAUS.slice(0, nivel + 1);
}

export function podeLerObra(irmao, obra) {
  return Boolean(obra && grausPermitidosBiblioteca(irmao).includes(obra.grau_minimo));
}

export async function atualizarIrmaoBiblioteca() {
  if (sessionStorage.getItem("irmao_auth") !== "true") return null;
  const salvo = JSON.parse(sessionStorage.getItem("irmao_data") || "null");
  if (!salvo?.id) return null;
  const atual = await db.Irmao.get(salvo.id);
  if (sessionStorage.getItem("irmao_auth") !== "true" || JSON.parse(sessionStorage.getItem("irmao_data") || "null")?.id !== salvo.id) return null;
  if (!grausPermitidosBiblioteca(atual).length) return null;
  sessionStorage.setItem("irmao_data", JSON.stringify(atual));
  return atual;
}

export async function consultarObrasPermitidas(tipo, irmao, filtro = {}, sort) {
  const graus = grausPermitidosBiblioteca(irmao);
  if (!graus.length) return [];
  const digital = tipo === "digital";
  return (digital ? db.AcervoDigital : db.Item).filter({
    ...filtro, ativo: true, ...(digital ? { disponivel: true } : {}),
    grau_minimo: { $in: graus },
  }, sort);
}

export async function confirmarObraPermitida(tipo, id) {
  const irmao = await atualizarIrmaoBiblioteca();
  const [obra] = await consultarObrasPermitidas(tipo, irmao, { id });
  if (!podeLerObra(irmao, obra)) throw new Error("Obra indisponível para o seu grau ou não encontrada.");
  return { irmao, obra };
}