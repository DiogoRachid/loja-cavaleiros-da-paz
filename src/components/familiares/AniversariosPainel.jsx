import { Link } from "react-router-dom";
import { Cake } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AniversariosLista from "@/components/familiares/AniversariosLista";
import { hoje, MESES } from "@/components/familiares/utils";

export default function AniversariosPainel() {
  const mes = Number(hoje().slice(5, 7));
  return <Card>
    <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between"><CardTitle className="flex items-center gap-2 text-lg"><Cake className="h-5 w-5 text-lodge-gold" />Aniversariantes de {MESES[mes - 1].toLocaleLowerCase("pt-BR")}</CardTitle><Button variant="outline" asChild><Link to="/AdminFamiliares?aba=aniversarios">Ver todos os aniversários</Link></Button></CardHeader>
    <CardContent><AniversariosLista mes={mes} compacto /></CardContent>
  </Card>;
}