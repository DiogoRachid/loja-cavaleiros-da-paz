import { cargosOcupados } from "@/components/secretario/CargosOcupados";
export const CARGOS_ASSINATURA = [{ chave: "vm", cargo: "Venerável Mestre" }, { chave: "secretario", cargo: "Secretário" }, { chave: "orador", cargo: "Orador" }];
export function assinaturasSessao(sessao, quadro) {
  const ocupados = cargosOcupados(sessao);
  return Object.fromEntries(CARGOS_ASSINATURA.map(({ chave, cargo }) => [chave, ocupados.find((item) => item.cargo === cargo)?.nome || quadro.find((item) => item.cargo === cargo)?.titular_nome || ""]));
}
export function lerAssinaturas(salvas, padrao) {
  return Object.fromEntries(CARGOS_ASSINATURA.map(({ chave }) => [chave, typeof salvas?.[chave] === "string" ? salvas[chave] : padrao[chave] || ""]));
}