import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { createPageUrl } from "@/utils";

const CHAT_ACERVO_URL = "https://supabase.rachid.dpdns.org/functions/v1/chatAcervo";
const CHAT_ACERVO_SECRET = import.meta.env.VITE_CHAT_ACERVO_SECRET;

export default function IrmaoBibliotecaChat() {
  const [mensagens, setMensagens] = useState([]);
  const [pergunta, setPergunta] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [irmao, setIrmao] = useState(null);
  const fimDaListaRef = useRef(null);

  useEffect(() => {
    const irmaoAuth = sessionStorage.getItem("irmao_auth");
    const irmaoData = sessionStorage.getItem("irmao_data");

    if (irmaoAuth !== "true" || !irmaoData) {
      window.location.href = createPageUrl("IrmaoLogin");
      return;
    }

    setIrmao(JSON.parse(irmaoData));
  }, []);

  useEffect(() => {
    fimDaListaRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  async function enviarPergunta() {
    const texto = pergunta.trim();
    if (!texto || carregando || !irmao) return;

    const novaMensagemUsuario = { autor: "usuario", texto };
    // Mensagem do agente já entra na lista, vazia, para ser preenchida
    // progressivamente conforme o stream chega.
    const indiceMensagemAgente = mensagens.length + 1;
    setMensagens((prev) => [
      ...prev,
      novaMensagemUsuario,
      { autor: "agente", texto: "", fontes: [], streaming: true },
    ]);
    setPergunta("");
    setCarregando(true);

    try {
      const resposta = await fetch(CHAT_ACERVO_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-chat-secret": CHAT_ACERVO_SECRET,
        },
        body: JSON.stringify({
          pergunta: texto,
          grau_usuario: irmao.grau,
        }),
      });

      if (!resposta.ok || !resposta.body) {
        const textoErro = await resposta.text();
        throw new Error(`Erro ${resposta.status}: ${textoErro}`);
      }

      const reader = resposta.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fontesExtraidas = [];
      let fontesJaLidas = false;
      let textoAcumulado = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // A primeira linha do stream traz as fontes; só processa uma vez.
        if (!fontesJaLidas) {
          const quebraLinha = buffer.indexOf("\n");
          if (quebraLinha === -1) continue; // ainda não chegou a linha inteira

          const primeiraLinha = buffer.slice(0, quebraLinha);
          buffer = buffer.slice(quebraLinha + 1);

          if (primeiraLinha.startsWith("__FONTES__")) {
            try {
              fontesExtraidas = JSON.parse(primeiraLinha.slice("__FONTES__".length));
            } catch {
              fontesExtraidas = [];
            }
          }
          fontesJaLidas = true;

          setMensagens((prev) => {
            const copia = [...prev];
            copia[indiceMensagemAgente] = {
              ...copia[indiceMensagemAgente],
              fontes: fontesExtraidas,
            };
            return copia;
          });
        }

        textoAcumulado += buffer;
        buffer = "";

        setMensagens((prev) => {
          const copia = [...prev];
          copia[indiceMensagemAgente] = {
            ...copia[indiceMensagemAgente],
            texto: textoAcumulado,
          };
          return copia;
        });
      }

      setMensagens((prev) => {
        const copia = [...prev];
        copia[indiceMensagemAgente] = {
          ...copia[indiceMensagemAgente],
          streaming: false,
        };
        return copia;
      });
    } catch (err) {
      setMensagens((prev) => {
        const copia = [...prev];
        copia[indiceMensagemAgente] = {
          autor: "agente",
          texto: "Desculpe, ocorreu um erro ao consultar o acervo. Tente novamente.",
          erro: true,
          streaming: false,
        };
        return copia;
      });
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  function aoTeclar(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarPergunta();
    }
  }

  if (!irmao) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-gray-400">
        Carregando...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto border rounded-lg bg-white shadow-sm">
      <div className="px-4 py-3 border-b">
        <h2 className="text-lg font-semibold">Consulta ao Acervo Digital</h2>
        <p className="text-sm text-gray-500">
          Pergunte sobre os livros e artigos disponíveis no acervo (grau: {irmao.grau})
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {mensagens.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-8">
            Faça uma pergunta sobre o conteúdo do acervo digital.
          </p>
        )}

        {mensagens.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.autor === "usuario" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.autor === "usuario"
                  ? "bg-blue-600 text-white"
                  : msg.erro
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.autor === "agente" && msg.texto === "" && msg.streaming ? (
                <span className="text-gray-400">Consultando o acervo...</span>
              ) : (
                <ReactMarkdown>{msg.texto}</ReactMarkdown>
              )}

              {msg.streaming && msg.texto !== "" && (
                <span className="inline-block w-1.5 h-3.5 bg-gray-400 ml-0.5 animate-pulse align-middle" />
              )}

              {msg.fontes && msg.fontes.length > 0 && !msg.streaming && (
                <div className="mt-2 pt-2 border-t border-gray-300 text-xs text-gray-500">
                  <strong>Fontes:</strong>
                  <ul className="list-disc list-inside">
                    {msg.fontes.map((f) => (
                      <li key={f.acervo_id}>{f.titulo}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}

        <div ref={fimDaListaRef} />
      </div>

      <div className="border-t px-3 py-3 flex gap-2">
        <textarea
          value={pergunta}
          onChange={(e) => setPergunta(e.target.value)}
          onKeyDown={aoTeclar}
          placeholder="Digite sua pergunta..."
          rows={1}
          className="flex-1 resize-none border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={enviarPergunta}
          disabled={carregando || !pergunta.trim()}
          className="bg-blue-600 text-white rounded-md px-4 py-2 text-sm disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
