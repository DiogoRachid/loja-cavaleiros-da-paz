import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "@/api/db";
import { createPageUrl } from "@/utils";
import { buscarCargosDisponiveis, aplicarCargoEscolhido } from "@/lib/cargosAcesso";

export default function useAcessoOficial() {
  const navigate = useNavigate();
  const [numeroGlp, setNumeroGlp] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [irmaoValidado, setIrmaoValidado] = useState(null);
  const [opcoes, setOpcoes] = useState([]);
  const concluir = (irmao, opcao) => {
    const pagina = aplicarCargoEscolhido(irmao, opcao);
    db.LogAcesso.create({ irmao_id: irmao.id, irmao_nome: irmao.nome_completo, irmao_numero_glp: irmao.numero_glp, data_acesso: new Date().toISOString(), tipo_acesso: "Login" }).catch(console.error);
    navigate(createPageUrl(pagina));
  };
  const handleLogin = async (event) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true); setErro("");
    try {
      const irmaos = await db.Irmao.filter({ numero_glp: numeroGlp.trim(), ativo: true });
      const irmao = irmaos?.[0];
      if (!irmao) { setErro("Número GLP não encontrado ou irmão inativo."); return; }
      // Mantém a verificação já utilizada pelo cadastro, sem alterar senhas.
      const senhaValida = irmao.senha ? irmao.senha === senha : irmao.numero_glp === senha;
      if (!senhaValida) { setErro("Senha incorreta."); return; }
      const disponiveis = await buscarCargosDisponiveis(irmao);
      if (!disponiveis.length) { setErro("Nenhum cargo administrativo ou substituição disponível para este Irmão."); return; }
      setSenha("");
      if (disponiveis.length === 1) { concluir(irmao, disponiveis[0]); return; }
      setOpcoes(disponiveis); setIrmaoValidado(irmao);
    } catch { setErro("Erro ao verificar as funções disponíveis. Tente novamente."); }
    finally { setLoading(false); }
  };
  const confirmarCargo = async (id) => {
    if (loading || !irmaoValidado) return;
    setLoading(true); setErro("");
    try {
      // Confere novamente os vínculos antes de aplicar a escolha.
      const atuais = await buscarCargosDisponiveis(irmaoValidado);
      const escolhida = atuais.find((item) => item.id === id);
      if (!escolhida) {
        setOpcoes(atuais);
        if (!atuais.length) setIrmaoValidado(null);
        setErro("Esta função não está mais disponível. Confira as opções ou entre novamente.");
        return;
      }
      concluir(irmaoValidado, escolhida);
    } catch { setErro("Não foi possível confirmar a função. Tente novamente."); }
    finally { setLoading(false); }
  };
  const voltar = () => { setIrmaoValidado(null); setOpcoes([]); setSenha(""); setErro(""); };
  return { numeroGlp, setNumeroGlp, senha, setSenha, loading, erro, irmaoValidado, opcoes, handleLogin, confirmarCargo, voltar };
}