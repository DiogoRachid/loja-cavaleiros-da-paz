import {
  Triangle, Scale, Weight, BookOpen, Feather, Key, Stamp, Bird, Ruler,
  Wallet, Sword, Swords, Flag, Shield, Hammer, Music, Utensils, BookMarked,
  Heart, Award,
} from "lucide-react";

// Joia (símbolo) de cada cargo, conforme o ritual
export const CARGO_JOIA = {
  "Venerável Mestre": { icon: Triangle, joia: "Um esquadro" },
  "Primeiro Vigilante": { icon: Scale, joia: "Um nível" },
  "Segundo Vigilante": { icon: Weight, joia: "Um prumo" },
  "Orador": { icon: BookOpen, joia: "Um livro aberto sobre fundo brilhante" },
  "Secretário": { icon: Feather, joia: "Duas penas cruzadas" },
  "Tesoureiro": { icon: Key, joia: "Uma chave" },
  "Chanceler": { icon: Stamp, joia: "Um sinete" },
  "Primeiro Diácono": { icon: Bird, joia: "Uma pomba inscrita em um triângulo" },
  "Segundo Diácono": { icon: Bird, joia: "Uma pomba livre" },
  "Mestre de Cerimônias": { icon: Ruler, joia: "Uma régua" },
  "Mestre de Cerimônias Adjunto": { icon: Ruler, joia: "Uma régua" },
  "Hospitaleiro": { icon: Wallet, joia: "Uma bolsa" },
  "Primeiro Experto": { icon: Sword, joia: "Um punhal" },
  "Segundo Experto": { icon: Sword, joia: "Um punhal" },
  "Porta Estandarte": { icon: Shield, joia: "Um estandarte" },
  "Porta Espada": { icon: Sword, joia: "Uma espada" },
  "Porta Bandeira": { icon: Flag, joia: "Uma bandeira" },
  "Guarda do Templo": { icon: Swords, joia: "Duas espadas cruzadas" },
  "Guarda Interno": { icon: Swords, joia: "Duas espadas cruzadas" },
  "Guarda Externo": { icon: Swords, joia: "Duas espadas cruzadas" },
  "Cobridor": { icon: Sword, joia: "Um alfanje" },
  "Arquiteto": { icon: Hammer, joia: "Um maço e um cinzel cruzados" },
  "Mestre de Harmonia": { icon: Music, joia: "Uma lira" },
  "Mestre de Banquetes": { icon: Utensils, joia: "Uma cornucópia" },
  "Bibliotecário": { icon: BookMarked, joia: "Um livro com uma pena de escrever" },
  "Secretário de Ação Social": { icon: Heart, joia: "Coração" },
};

// Joias oficiais do ritual (imagens extraídas do documento da Loja)
const B = "https://base44.app/api/apps/69aea997b473b479398fe231/files/mp/public/69aea997b473b479398fe231/";

export const CARGO_JOIA_IMG = {
  "Venerável Mestre": `${B}9112a6ee1_joia1.jpeg`,
  "Primeiro Vigilante": `${B}711cc0f84_joia2.jpeg`,
  "Segundo Vigilante": `${B}0e4dd0003_joia3.jpeg`,
  "Orador": `${B}9151252a3_joia4.jpeg`,
  "Secretário": `${B}893584310_joia5.jpeg`,
  "Tesoureiro": `${B}b7b05f0af_joia6.jpeg`,
  "Chanceler": `${B}e9cd56ada_joia7.jpeg`,
  "Primeiro Diácono": `${B}a3f8d2967_joia8.jpeg`,
  "Segundo Diácono": `${B}906a9e3b2_joia9.jpeg`,
  "Mestre de Cerimônias": `${B}4d8c39cbd_joia10.jpeg`,
  "Mestre de Cerimônias Adjunto": `${B}4d8c39cbd_joia10.jpeg`,
  "Hospitaleiro": `${B}8ffd249bb_joia11.jpeg`,
  "Primeiro Experto": `${B}a75fc3c33_joia12.jpeg`,
  "Segundo Experto": `${B}a75fc3c33_joia12.jpeg`,
  "Porta Estandarte": `${B}172079dd4_joia13.jpeg`,
  "Porta Espada": `${B}c87103ca3_joia14.jpeg`,
  "Porta Bandeira": `${B}645a293bc_joia15.jpeg`,
  "Guarda do Templo": `${B}13568cf36_joia16.jpeg`,
  "Guarda Interno": `${B}13568cf36_joia16.jpeg`,
  "Guarda Externo": `${B}13568cf36_joia16.jpeg`,
  "Cobridor": `${B}ea5fadb74_joia17.jpeg`,
  "Arquiteto": `${B}54b05a290_joia18.jpeg`,
  "Mestre de Harmonia": `${B}76729b519_joia19.jpeg`,
  "Mestre de Banquetes": `${B}550de7d94_joia20.jpeg`,
  "Bibliotecário": `${B}5e13b6f6f_joia21.jpeg`,
  "Mestre Instalado": `${B}1d0da6c01_joia22.jpeg`,
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