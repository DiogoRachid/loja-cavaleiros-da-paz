import { motion } from "framer-motion";
import { BookOpen, HeartHandshake, Music, Users, Gavel, Library } from "lucide-react";

const ATIVIDADES = [
  { icon: Gavel, titulo: "Sessões Ritualísticas", texto: "Reuniões ordinárias e magnas conduzidas conforme o Ritual da Grande Loja do Paraná." },
  { icon: BookOpen, titulo: "Instrução Maçônica", texto: "Trabalhos, pranchas e instruções apresentados pelos Irmãos em cada grau." },
  { icon: HeartHandshake, titulo: "Ação Social", texto: "Auxílio fraterno e iniciativas de solidariedade voltadas à comunidade." },
  { icon: Music, titulo: "Harmonia", texto: "Cerimonial e trilha musical que acompanham cada etapa dos trabalhos." },
  { icon: Library, titulo: "Biblioteca e Acervo", texto: "Acervo físico e digital de obras maçônicas disponível aos Irmãos." },
  { icon: Users, titulo: "Convívio Fraterno", texto: "Ágapes, comissões e encontros que fortalecem a união da Loja." },
];

export default function AtividadesSection() {
  return (
    <section id="atividades" className="py-24 px-6 bg-[#123054]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#C9A227] text-xs uppercase tracking-[0.25em] mb-4">O que fazemos</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Nossas atividades</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ATIVIDADES.map(({ icon: Icon, titulo, texto }, i) => (
            <motion.div
              key={titulo}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <div className="w-11 h-11 mb-4 rounded-xl bg-[#C9A227]/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#C9A227]" />
              </div>
              <h3 className="text-white font-semibold mb-2">{titulo}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{texto}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}