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
            <Card className="h-full border-border shadow-sm transition-colors hover:border-lodge-gold">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-lodge-navy/10">
                  <Icon className="h-5 w-5 text-lodge-navy" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}