import { motion, useReducedMotion } from "framer-motion";
import { Calendar, Clock, MapPin, Mail, Phone, Compass } from "lucide-react";

const CALENDARIO_URL =
  "webcal://p133-caldav.icloud.com/published/2/MTE4OTcxMzcyMDExODk3MXpVMJXwr2vT2q1xXrvKY5Bo-F7nDiToCpUvjRHTwqnLuU7OWhwX0meCb2Ies0FOUS0jjoAPV67ObmqfQ85CmGg";

export default function ReunioesSection({ loja }) {
  const reduceMotion = useReducedMotion();
  const itens = [
    { icon: Calendar, label: "Dia de reunião", valor: loja?.dia_reuniao },
    { icon: Clock, label: "Horário", valor: loja?.hora_reuniao },
    { icon: MapPin, label: "Templo", valor: loja?.endereco },
    { icon: Compass, label: "Oriente", valor: loja?.oriente },
    { icon: Phone, label: "Telefone", valor: loja?.telefone },
    { icon: Mail, label: "E-mail", valor: loja?.email },
  ].filter((i) => i.valor);

  return (
    <section id="reunioes" className="scroll-mt-20 bg-landing-deep px-6 py-24 md:py-32">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-12" id="contato">
          <p className="text-[#C9A227] text-xs uppercase tracking-[0.25em] mb-4">Reuniões e contato</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Onde nos encontramos</h2>
        </div>

        {itens.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {itens.map(({ icon: Icon, label, valor }, i) => (
              <motion.div
                key={label}
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={reduceMotion ? undefined : { y: -4 }}
                className="group flex items-start gap-4 rounded-lg border border-lodge-gold/15 bg-landing-surface p-5 transition-colors duration-300 hover:border-lodge-gold/40 hover:bg-landing-bright/30"
              >
                <div className="w-10 h-10 rounded-xl bg-[#C9A227]/20 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="w-4 h-4 text-[#C9A227]" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-white text-sm leading-relaxed">{valor}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center">
            Os dados de reunião e contato da Loja serão exibidos aqui.
          </p>
        )}

        <div className="text-center mt-10">
          <motion.a
            href={CALENDARIO_URL}
            whileHover={reduceMotion ? undefined : { scale: 1.03 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-md border border-lodge-gold px-6 py-3 font-semibold text-lodge-gold transition-colors hover:bg-lodge-gold hover:text-landing-deep"
          >
            <Calendar className="w-4 h-4" />
            Assinar o calendário da Loja
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}