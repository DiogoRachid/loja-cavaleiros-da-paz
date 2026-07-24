import {
  Triangle, Scale, Weight, BookOpen, Feather, Key, Stamp, Bird, Ruler,
  Wallet, Sword, Swords, Flag, Shield, Hammer, Music, Utensils, BookMarked,
  Heart, Award,
} from "lucide-react";

// Joia (símbolo) de cada cargo, conforme o ritual
export const CARGO_JOIA = {
  "Venerável Mestre": { icon: Triangle, joia: "Esquadro" },
  "Primeiro Vigilante": { icon: Scale, joia: "Nível" },
  "Segundo Vigilante": { icon: Weight, joia: "Prumo" },
  "Orador": { icon: BookOpen, joia: "Livro aberto" },
  "Secretário": { icon: Feather, joia: "Penas cruzadas" },
  "Tesoureiro": { icon: Key, joia: "Chave" },
  "Chanceler": { icon: Stamp, joia: "Sinete" },
  "Primeiro Diácono": { icon: Bird, joia: "Pomba em triângulo" },
  "Segundo Diácono": { icon: Bird, joia: "Pomba livre" },
  "Mestre de Cerimônias": { icon: Ruler, joia: "Régua" },
  "Mestre de Cerimônias Adjunto": { icon: Ruler, joia: "Régua" },
  "Hospitaleiro": { icon: Wallet, joia: "Bolsa" },
  "Primeiro Experto": { icon: Sword, joia: "Punhal" },
  "Segundo Experto": { icon: Sword, joia: "Punhal" },
  "Porta Estandarte": { icon: Shield, joia: "Estandarte" },
  "Porta Espada": { icon: Sword, joia: "Espada" },
  "Porta Bandeira": { icon: Flag, joia: "Bandeira" },
  "Guarda do Templo": { icon: Swords, joia: "Espadas cruzadas" },
  "Guarda Interno": { icon: Swords, joia: "Espadas cruzadas" },
  "Guarda Externo": { icon: Swords, joia: "Espadas cruzadas" },
  "Cobridor": { icon: Sword, joia: "Alfanje" },
  "Arquiteto": { icon: Hammer, joia: "Maço e cinzel" },
  "Mestre de Harmonia": { icon: Music, joia: "Lira" },
  "Mestre de Banquetes": { icon: Utensils, joia: "Cornucópia" },
  "Bibliotecário": { icon: BookMarked, joia: "Livro com pena" },
  "Secretário de Ação Social": { icon: Heart, joia: "Coração" },
};

export default function CargoIcon({ cargo, className = "w-5 h-5" }) {
  const Icon = CARGO_JOIA[cargo]?.icon || Award;
  return <Icon className={className} />;
}