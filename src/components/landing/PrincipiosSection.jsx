import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Scale, Users, Sparkles, Handshake, ArrowUpRight } from "lucide-react";
import Reveal from "@/components/landing/Reveal";

const PRINCIPIOS = [
  { icon: Scale, titulo: "Liberdade", texto: "O livre pensar e o respeito à consciência de cada Irmão." },
  { icon: Users, titulo: "Igualdade", texto: "Todos os Obreiros são iguais dentro do Templo, sem distinção." },
  { icon: Handshake, titulo: "Fraternidade", texto: "O apoio mútuo entre os Irmãos e suas famílias." },
  { icon: Sparkles, titulo: "Virtude", texto: "O aperfeiçoamento moral contínuo como dever de cada Maçom." },
];

export default function PrincipiosSection() {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const principio = PRINCIPIOS[active];
  const Icon = principio.icon;
  return (
    <section id="principios" className="scroll-mt-20 bg-landing-deep px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-12 text-center"><p className="mb-4 text-xs uppercase tracking-[0.3em] text-lodge-gold">Nossos valores</p><h2 className="text-3xl font-semibold text-primary-foreground md:text-4xl">Princípios que nos guiam</h2><p className="mt-4 text-sm text-slate-300">Selecione um princípio para conhecer seu significado na Loja.</p></Reveal>
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid grid-cols-2 gap-3">
            {PRINCIPIOS.map(({ icon: Symbol, titulo }, index) => <button key={titulo} type="button" aria-pressed={active === index} onClick={() => setActive(index)} className={`flex min-h-32 flex-col items-start justify-between rounded-lg border p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lodge-gold ${active === index ? "border-lodge-gold bg-landing-bright/50 text-primary-foreground" : "border-primary-foreground/15 bg-landing-surface text-slate-300 hover:border-lodge-gold/60 hover:bg-landing-bright/25"}`}><Symbol className="h-6 w-6 text-lodge-gold" /><span className="font-semibold">{titulo}</span></button>)}
          </div>
          <div aria-live="polite" className="flex min-h-72 items-center overflow-hidden rounded-lg border border-lodge-gold/30 bg-landing-surface p-8 md:p-12">
            <motion.div key={principio.titulo} initial={reduced ? false : { opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
              <span className="text-sm font-medium tracking-widest text-lodge-gold">0{active + 1} / 04</span>
              <Icon className="mt-7 h-10 w-10 text-lodge-gold" />
              <h3 className="mt-6 text-3xl font-semibold text-primary-foreground">{principio.titulo}</h3>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-slate-200">{principio.texto}</p>
              <ArrowUpRight className="mt-8 h-5 w-5 text-lodge-gold" aria-hidden="true" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}