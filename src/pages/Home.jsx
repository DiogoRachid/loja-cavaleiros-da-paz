import { useEffect, useState } from "react";
import { db } from "@/api/db";
import ScrollProgress from "@/components/landing/ScrollProgress";
import LandingNav from "@/components/landing/LandingNav";
import LandingHero from "@/components/landing/LandingHero";
import SobreSection from "@/components/landing/SobreSection";
import PrincipiosSection from "@/components/landing/PrincipiosSection";
import AtividadesSection from "@/components/landing/AtividadesSection";
import ReunioesSection from "@/components/landing/ReunioesSection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Home() {
  const [loja, setLoja] = useState(null);

  useEffect(() => {
    db.DadosLoja.list()
      .then((lista) => setLoja(lista?.[0] || null))
      .catch(() => setLoja(null));
  }, []);

  return (
    <div className="min-h-screen bg-[#1B3A5F]">
      <style>{`html { scroll-behavior: smooth; }`}</style>
      <ScrollProgress />
      <LandingNav />
      <LandingHero loja={loja} />
      <SobreSection loja={loja} />
      <PrincipiosSection />
      <AtividadesSection />
      <ReunioesSection loja={loja} />
      <LandingFooter />
    </div>
  );
}