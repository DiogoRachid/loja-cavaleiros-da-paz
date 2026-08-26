import Reveal from "@/components/landing/Reveal";

export default function SobreSection({ loja }) {
  return (
    <section id="sobre" className="relative py-28 px-6 bg-[#0D1F33]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#C9A227]/[0.06] to-transparent" />
      <div className="relative max-w-4xl mx-auto text-center">
        <Reveal>
          <p className="text-[#C9A227] text-xs uppercase tracking-[0.3em] mb-4">A Loja</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Quem somos</h2>
        </Reveal>

        <div className="space-y-5 text-slate-300 text-base md:text-lg leading-relaxed text-left md:text-center">
          <Reveal delay={0.1}>
            <p>
              A Augusta e Respeitável Loja Simbólica Cavaleiros da Paz nº25 é uma Oficina regular
              jurisdicionada à Grande Loja Maçônica do Estado do Paraná, reunindo Irmãos que buscam,
              pelo estudo e pela prática das virtudes, o seu aprimoramento moral e intelectual.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p>
              Nossos trabalhos são conduzidos com respeito ao Ritual, à tradição maçônica e à
              fraternidade que une os Obreiros desta Loja, sempre voltados à construção de uma
              sociedade mais justa, solidária e livre.
            </p>
          </Reveal>
          {loja?.oriente && (
            <Reveal delay={0.3}>
              <p className="text-slate-400">
                Oriente de {loja.oriente}
                {loja?.potencia ? ` — ${loja.potencia}` : ""}.
              </p>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}