import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

// Ajuste este import conforme o padrão de chamada de funções que vocês já usam no base44
// (ex: import { chatAcervo } from "@/functions/chatAcervo";)
import { base44 } from "@/api/base44Client";

export default function IrmaoBibliotecaChat({ grauUsuario = "Aprendiz" }) {
  const [mensagens, setMensagens] = useState([]);
  const [pergunta, setPergunta] = useState("");
  const [carregando, setCarregando] = useState(false);
  const fimDaListaRef = useRef(null);

  useEffect(() => {
    fimDaListaRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  async function enviarPergunta() {
    const texto = pergunta.trim();
    if (!texto || carregando) return;

    const novaMensagemUsuario = { autor: "usuario", texto };
    setMensagens((prev) => [...prev, novaMensagemUsuario]);
    setPergunta("");
    setCarregando(true);

    try {
      const resp = await base44.functions.invoke("chatAcervo", {
        pergunta: texto,
        grau_usuario: grauUsuario,
      });

      setMensagens((prev) => [
        ...prev,
        {
          autor: "agente",
          texto: resp.resposta,
          fontes: resp.fontes || [],
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

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto border rounded-lg bg-white shadow-sm">
      <div className="px-4 py-3 border-b">
        <h2 className="text-lg font-semibold">Consulta ao Acervo Digital</h2>
        <p className="text-sm text-gray-500">
          Pergunte sobre os livros e artigos disponíveis no acervo
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
