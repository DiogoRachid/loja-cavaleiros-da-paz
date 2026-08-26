import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Mail, Phone } from "lucide-react";

const CALENDARIO_URL =
  "webcal://p133-caldav.icloud.com/published/2/MTE4OTcxMzcyMDExODk3MXpVMJXwr2vT2q1xXrvKY5Bo-F7nDiToCpUvjRHTwqnLuU7OWhwX0meCb2Ies0FOUS0jjoAPV67ObmqfQ85CmGg";

export default function ReunioesSection({ loja }) {
  const itens = [
    { icon: Calendar, label: "Dia de reunião", valor: loja?.dia_reuniao },
    { icon: Clock, label: "Horário", valor: loja?.hora_reuniao },
    { icon: MapPin, label: "Templo", valor: loja?.endereco },
    { icon: Phone, label: "Telefone", valor: loja?.telefone },
    { icon: Mail, label: "E-mail", valor: loja?.email },
  ].filter((i) => i.valor);

  return (
    <section id="reunioes" className="py-24 px-6 bg-gradient-to-b from-[#123054] to-[#0D1F33]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
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
            {itens.map(({ icon: Icon, label, valor }) => (
              <div key={label} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-[#C9A227]/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-[#C9A227]" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-white text-sm leading-relaxed">{valor}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center">
            Os dados de reunião e contato da Loja serão exibidos aqui.
          </p>
        )}

        <div className="text-center mt-10">
          <a
            href={CALENDARIO_URL}
            className="inline-flex items-center gap-2 border border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227] hover:text-[#1B3A5F] font-semibold px-6 py-3 rounded-full transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Assinar o calendário da Loja
          </a>
        </div>
      </motion.div>
    </section>
  );
}