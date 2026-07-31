import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { chatAcervo } from "@/api/functions";
import { createPageUrl } from "@/utils";

export default function IrmaoBibliotecaChat() {
  const [mensagens, setMensagens] = useState([]);
  const [pergunta, setPergunta] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [irmao, setIrmao] = useState(null);
  const fimDaListaRef = useRef(null);

  // Mesmo padrão de autenticação usado em IrmaoAcervoDigital.jsx
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
    setMensagens((prev) => [...prev, novaMensagemUsuario]);
    setPergunta("");
    setCarregando(true);

    try {
      // Chama a função customizada exportada em @/api/functions
      const resp = await chatAcervo({
        pergunta: texto,
        grau_usuario: irmao.grau,
      });

      // O SDK pode devolver o corpo direto ou dentro de resp.data,
      // dependendo da versão — cobre os dois casos.
      const dados = resp?.data ?? resp;

      setMensagens((prev) => [
        ...prev,
        {
          autor: "agente",
          texto: dados.resposta,
          fontes: dados.fontes || [],
        },
      ]);
    } catch (err) {
      setMensagens((prev) => [
        ...prev,
        {
          autor: "agente",
          texto: "Desculpe, ocorreu um erro ao consultar o acervo. Tente novamente.",
          erro: true,
        },
      ]);
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
              <ReactMarkdown>{msg.texto}</ReactMarkdown>

              {msg.fontes && msg.fontes.length > 0 && (
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

        {carregando && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-500">
              Consultando o acervo...
            </div>
          </div>
        )}

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
