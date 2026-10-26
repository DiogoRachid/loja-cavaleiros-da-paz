import { db } from "@/api/db";
import { listarSubstituicoesAtivas } from "@/lib/substituicao";

const PAGINAS = {
  "Venerável Mestre": "AdminVM", "Primeiro Vigilante": "AdminVigilantes", "Segundo Vigilante": "AdminVigilantes",
  "Orador": "AdminOrador", "Secretário": "AdminSecretario", "Secretário de Ação Social": "AdminAcaoSocial",
  "Tesoureiro": "AdminTesoureiro", "Chanceler": "AdminChanceler", "Bibliotecário": "BibDashboard",
  "Mestre de Cerimônias": "AdminMC", "Mestre de Harmonia": "AdminMestreHarmonia", "Hospitaleiro": "AdminHospitaleiro",
  "Primeiro Diácono": "AdminVM", "Segundo Diácono": "AdminVM",
};

async function listarQuadro(filtro) {
  const registros = [];
  for (let offset = 0; ; offset += 100) {
    const pagina = await db.QuadroOficiais.filter(filtro, "cargo,id", 100, offset);
    registros.push(...pagina);
    if (pagina.length < 100) return registros;
  }
}

export async function buscarCargosDisponiveis(irmao) {
  const exercicio = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", year: "numeric" }).format(new Date());
  const [titulares, substitutos, sessoes] = await Promise.all([
    listarQuadro({ exercicio, publicado: true, titular_id: irmao.id }),
    listarQuadro({ exercicio, publicado: true, substituto_id: irmao.id }),
    listarSubstituicoesAtivas(irmao.id),
  ]);
  const opcoes = new Map();
  const adicionar = (cargo, tipo, origem, substituicao = null) => {
    if (!Object.hasOwn(PAGINAS, cargo)) return;
    const id = `${tipo}:${cargo}`;
    if (!opcoes.has(id)) opcoes.set(id, { id, cargo, tipo, origem, substituicao });
  };
  adicionar(irmao.cargo, "Titular", "Cargo do cadastro");
  titulares.forEach((oficial) => adicionar(oficial.cargo, "Titular", `Quadro de oficiais · ${exercicio}`));
  substitutos.forEach((oficial) => adicionar(oficial.cargo, "Substituto", `Quadro de oficiais · ${exercicio}`, { cargo: oficial.cargo, quadro_id: oficial.id, exercicio }));
  sessoes.forEach(({ cargo, sessao }) => adicionar(cargo, "Substituto", `Sessão de ${sessao.data?.split("-").reverse().join("/") || "data não informada"}`, { cargo, sessao_id: sessao.id, sessao_data: sessao.data }));
  return [...opcoes.values()];
}

export function aplicarCargoEscolhido(irmao, opcao) {
  if (!Object.hasOwn(PAGINAS, opcao.cargo)) throw new Error("Cargo indisponível.");
  ["admin_auth", "admin_data", "admin_cargo", "admin_substituindo", "bib_auth", "bib_data", "bib_auth_time", "irmao_auth", "irmao_data"].forEach((chave) => sessionStorage.removeItem(chave));
  if (opcao.cargo === "Bibliotecário") {
    sessionStorage.setItem("bib_auth", "true");
    sessionStorage.setItem("bib_data", JSON.stringify({ ...irmao, nome: irmao.nome_completo }));
  } else {
    sessionStorage.setItem("admin_auth", "true");
    sessionStorage.setItem("admin_data", JSON.stringify(irmao));
    sessionStorage.setItem("admin_cargo", opcao.cargo);
  }
  if (opcao.substituicao) sessionStorage.setItem("admin_substituindo", JSON.stringify(opcao.substituicao));
  return PAGINAS[opcao.cargo];
}