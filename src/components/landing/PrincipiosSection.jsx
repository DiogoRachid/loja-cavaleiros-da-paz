import { motion } from "framer-motion";
import { Scale, Users, Sparkles, Handshake } from "lucide-react";
import Reveal from "@/components/landing/Reveal";

const PRINCIPIOS = [
  { icon: Scale, titulo: "Liberdade", texto: "O livre pensar e o respeito à consciência de cada Irmão." },
  { icon: Users, titulo: "Igualdade", texto: "Todos os Obreiros são iguais dentro do Templo, sem distinção." },
  { icon: Handshake, titulo: "Fraternidade", texto: "O apoio mútuo entre os Irmãos e suas famílias." },
  { icon: Sparkles, titulo: "Virtude", texto: "O aperfeiçoamento moral contínuo como dever de cada Maçom." },
];

export default function PrincipiosSection() {
  return (
    <section id="principios" className="py-16 px-6 bg-gradient-to-b from-[#0D1F33] to-[#123054]">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-10">
          <p className="text-[#C9A227] text-xs uppercase tracking-[0.3em] mb-4">Nossos valores</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Princípios que nos guiam</h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRINCIPIOS.map(({ icon: Icon, titulo, texto }, i) => (
            <Reveal key={titulo} delay={i * 0.12}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="group h-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm transition-colors duration-300 hover:border-[#C9A227]/40 hover:bg-white/[0.08] hover:shadow-xl hover:shadow-[#C9A227]/10"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#C9A227]/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#C9A227]/30">
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