import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, DollarSign, Gavel, Star, Users, Heart, Music, Library, ClipboardList, HeartHandshake } from "lucide-react";

export const PORTAIS = [
  { title: "Secretaria", desc: "Balaústre, expedientes e visitantes", icon: FileText, page: "AdminSecretario" },
  { title: "Chancelaria", desc: "Presenças, frequências e comunicados", icon: ClipboardList, page: "AdminChanceler" },
  { title: "Tesouraria", desc: "Mensalidades e relatório financeiro", icon: DollarSign, page: "AdminTesoureiro" },
  { title: "Orador", desc: "Pareceres e guarda da lei", icon: Gavel, page: "AdminOrador" },
  { title: "Mestre de Cerimônias", desc: "Protocolo e ordem de entrada", icon: Star, page: "AdminMC" },
  { title: "Vigilantes", desc: "Prontidão de grau e trabalhos", icon: Users, page: "AdminVigilantes" },
  { title: "Hospitaleiro", desc: "Contatos e assistência aos irmãos", icon: Heart, page: "AdminHospitaleiro" },
  { title: "Ação Social", desc: "Auxílios externos e pareceres", icon: HeartHandshake, page: "AdminAcaoSocial" },
  { title: "Mestre de Harmonia", desc: "Roteiros musicais das sessões", icon: Music, page: "AdminMestreHarmonia" },
  { title: "Biblioteca", desc: "Acervo físico e digital", icon: Library, page: "BibDashboard" },
];

export default function PortaisCargos() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {PORTAIS.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.page} to={createPageUrl(item.page)}>
            <Card className="hover:shadow-md hover:border-[#C9A227] transition-all cursor-pointer h-full">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#C9A227]/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-[#1B3A5F]" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}