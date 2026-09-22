import Reveal from "@/components/landing/Reveal";

export default function SobreSection({ loja }) {
  return (
    <section id="sobre" className="relative scroll-mt-20 border-t border-lodge-gold/15 bg-landing-surface px-6 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lodge-gold/50 to-transparent" />
      <div className="relative mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_1.5fr] md:gap-20">
        <Reveal>
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-lodge-gold">A Loja</p>
          <h2 className="mb-8 text-4xl font-semibold tracking-tight text-primary-foreground md:text-5xl">Quem somos</h2>
        </Reveal>

        <div className="space-y-6 border-l border-lodge-gold/40 pl-7 text-left text-base leading-relaxed text-slate-300 md:pl-10 md:text-lg">
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