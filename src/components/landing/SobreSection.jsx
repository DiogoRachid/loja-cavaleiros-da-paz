import { motion } from "framer-motion";

export default function SobreSection({ loja }) {
  return (
    <section id="sobre" className="relative py-24 px-6 bg-[#0D1F33]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center"
      >
        <p className="text-[#C9A227] text-xs uppercase tracking-[0.25em] mb-4">A Loja</p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Quem somos</h2>

        <div className="space-y-5 text-slate-300 text-base md:text-lg leading-relaxed text-left md:text-center">
          <p>
            A Augusta e Respeitável Loja Simbólica Cavaleiros da Paz nº25 é uma Oficina regular
            jurisdicionada à Grande Loja Maçônica do Estado do Paraná, reunindo Irmãos que buscam,
            pelo estudo e pela prática das virtudes, o seu aprimoramento moral e intelectual.
          </p>
          <p>
            Nossos trabalhos são conduzidos com respeito ao Ritual, à tradição maçônica e à
            fraternidade que une os Obreiros desta Loja, sempre voltados à construção de uma
            sociedade mais justa, solidária e livre.
          </p>
          {loja?.oriente && (
            <p className="text-slate-400">
              Oriente de {loja.oriente}
              {loja?.potencia ? ` — ${loja.potencia}` : ""}.
            </p>
          )}
        </div>
      </motion.div>
    </section>
  );
}