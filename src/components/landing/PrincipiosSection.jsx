import { motion, useReducedMotion } from "framer-motion";
import { Scale, Users, Sparkles, Handshake } from "lucide-react";
import Reveal from "@/components/landing/Reveal";

const PRINCIPIOS = [
  { icon: Scale, titulo: "Liberdade", texto: "O livre pensar e o respeito à consciência de cada Irmão." },
  { icon: Users, titulo: "Igualdade", texto: "Todos os Obreiros são iguais dentro do Templo, sem distinção." },
  { icon: Handshake, titulo: "Fraternidade", texto: "O apoio mútuo entre os Irmãos e suas famílias." },
  { icon: Sparkles, titulo: "Virtude", texto: "O aperfeiçoamento moral contínuo como dever de cada Maçom." },
];

export default function PrincipiosSection() {
  const reduceMotion = useReducedMotion();
  return (
    <section id="principios" className="scroll-mt-20 bg-lodge-deep px-6 py-24 md:py-32">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-10">
          <p className="text-[#C9A227] text-xs uppercase tracking-[0.3em] mb-4">Nossos valores</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Princípios que nos guiam</h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRINCIPIOS.map(({ icon: Icon, titulo, texto }, i) => (
            <Reveal key={titulo} delay={i * 0.12}>
              <motion.div
                whileHover={reduceMotion ? undefined : { y: -4 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="group h-full border-t border-lodge-gold/30 p-6 text-left transition-colors duration-300 hover:bg-lodge-surface"
              >
                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full border border-lodge-gold/40 transition-transform duration-300 group-hover:scale-110">
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