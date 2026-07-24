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

// Joias reais (imagens) — sendo adicionadas cargo por cargo
export const CARGO_JOIA_IMG = {
  "Venerável Mestre": "https://media.base44.com/images/public/69aea997b473b479398fe231/f061861bb_generated_image.png",
  "Primeiro Vigilante": "https://media.base44.com/images/public/69aea997b473b479398fe231/259327d55_generated_image.png",
  "Segundo Vigilante": "https://media.base44.com/images/public/69aea997b473b479398fe231/20925fa5a_generated_image.png",
  "Orador": "https://media.base44.com/images/public/69aea997b473b479398fe231/4c5b55d35_generated_image.png",
  "Secretário": "https://media.base44.com/images/public/69aea997b473b479398fe231/fd0d986fe_generated_image.png",
  "Tesoureiro": "https://media.base44.com/images/public/69aea997b473b479398fe231/2579f39d5_generated_image.png",
  "Chanceler": "https://media.base44.com/images/public/69aea997b473b479398fe231/66c2e02a9_generated_image.png",
  "Primeiro Diácono": "https://media.base44.com/images/public/69aea997b473b479398fe231/c5d40d6ca_generated_image.png",
  "Segundo Diácono": "https://media.base44.com/images/public/69aea997b473b479398fe231/423d6e0d6_generated_image.png",
  "Mestre de Cerimônias": "https://media.base44.com/images/public/69aea997b473b479398fe231/a422190e1_generated_image.png",
  "Mestre de Cerimônias Adjunto": "https://media.base44.com/images/public/69aea997b473b479398fe231/a422190e1_generated_image.png",
  "Hospitaleiro": "https://media.base44.com/images/public/69aea997b473b479398fe231/6d91371e8_generated_image.png",
  "Primeiro Experto": "https://media.base44.com/images/public/69aea997b473b479398fe231/3c2259b10_generated_image.png",
  "Segundo Experto": "https://media.base44.com/images/public/69aea997b473b479398fe231/3c2259b10_generated_image.png",
  "Porta Estandarte": "https://media.base44.com/images/public/69aea997b473b479398fe231/963bfc478_generated_image.png",
  "Porta Espada": "https://media.base44.com/images/public/69aea997b473b479398fe231/872072c55_generated_image.png",
  "Porta Bandeira": "https://media.base44.com/images/public/69aea997b473b479398fe231/af19f3220_generated_image.png",
  "Guarda do Templo": "https://media.base44.com/images/public/69aea997b473b479398fe231/9cb208866_generated_image.png",
  "Guarda Interno": "https://media.base44.com/images/public/69aea997b473b479398fe231/9cb208866_generated_image.png",
  "Guarda Externo": "https://media.base44.com/images/public/69aea997b473b479398fe231/9cb208866_generated_image.png",
  "Cobridor": "https://media.base44.com/images/public/69aea997b473b479398fe231/16d517078_generated_image.png",
  "Arquiteto": "https://media.base44.com/images/public/69aea997b473b479398fe231/67daf6614_generated_image.png",
  "Mestre de Harmonia": "https://media.base44.com/images/public/69aea997b473b479398fe231/f15209e83_generated_image.png",
  "Mestre de Banquetes": "https://media.base44.com/images/public/69aea997b473b479398fe231/49ae0edcd_generated_image.png",
  "Bibliotecário": "https://media.base44.com/images/public/69aea997b473b479398fe231/52a4d9859_generated_image.png",
};

export default function CargoIcon({ cargo, className = "w-5 h-5" }) {
  const img = CARGO_JOIA_IMG[cargo];
  if (img) {
    return (
      <img
        src={img}
        alt={CARGO_JOIA[cargo]?.joia || cargo}
        className={`${className} object-contain mix-blend-multiply`}
      />
    );
  }
  const Icon = CARGO_JOIA[cargo]?.icon || Award;
  return <Icon className={className} />;
}