import { motion } from "framer-motion";
import { BookOpen, HeartHandshake, Music, Users, Gavel, Library } from "lucide-react";
import Reveal from "@/components/landing/Reveal";

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
    <section id="atividades" className="py-16 px-6 bg-[#123054]">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-10">
          <p className="text-[#C9A227] text-xs uppercase tracking-[0.3em] mb-4">O que fazemos</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Nossas atividades</h2>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ATIVIDADES.map(({ icon: Icon, titulo, texto }, i) => (
            <Reveal key={titulo} delay={(i % 3) * 0.12}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-[#C9A227]/40 hover:bg-white/[0.08] hover:shadow-xl hover:shadow-black/20"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A227]/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="w-11 h-11 mb-4 rounded-xl bg-[#C9A227]/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#C9A227]/30">
                  <Icon className="w-5 h-5 text-[#C9A227]" />
                </div>
                <h3 className="text-white font-semibold mb-2">{titulo}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{texto}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}