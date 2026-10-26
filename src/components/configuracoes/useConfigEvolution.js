import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function useConfigEvolution(permitido) {
  const [config, setConfig] = useState({ destino: "", chave_api: "", chave_configurada: false });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [salvo, setSalvo] = useState(false);
  const [login, setLogin] = useState(false);
  const tratarErro = (error) => {
    setLogin((error.status || error.response?.status) === 401);
    setErro(error.response?.data?.error || error.message || "Não foi possível acessar a configuração.");
  };
  useEffect(() => {
    if (!permitido) { setCarregando(false); return; }
    let ativo = true;
    base44.functions.invoke("configEvolution", { operacao: "carregar" }).then(({ data }) => {
      if (!ativo) return;
      if (data.error) throw new Error(data.error);
      setConfig({ ...data, chave_api: "" });
    }).catch((error) => { if (ativo) tratarErro(error); }).finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [permitido]);
  const alterar = (campo, valor) => { setConfig((atual) => ({ ...atual, [campo]: valor })); setSalvo(false); };
  const salvar = async () => {
    setSalvando(true); setErro(""); setSalvo(false);
    try {
      const { data } = await base44.functions.invoke("configEvolution", { operacao: "salvar", destino: config.destino, chave_api: config.chave_api });
      if (data.error) throw new Error(data.error);
      setConfig({ ...data, chave_api: "" }); setSalvo(true);
    } catch (error) { tratarErro(error); }
    finally { setSalvando(false); }
  };
  return { config, carregando, salvando, erro, salvo, login, alterar, salvar };
}