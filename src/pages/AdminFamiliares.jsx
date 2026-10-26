import { useState } from "react";
import { Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FamiliaresCadastro from "@/components/familiares/FamiliaresCadastro";
import Aniversarios from "@/components/familiares/Aniversarios";

export default function AdminFamiliares() {
  const urlParams = new URLSearchParams(window.location.search);
  const [aba, setAba] = useState(urlParams.get("aba") === "aniversarios" ? "aniversarios" : "cadastro");
  return <div className="space-y-6">
    <div className="flex items-center gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lodge-navy"><Users className="h-6 w-6 text-lodge-gold" /></div><div><h1 className="font-heading text-2xl font-bold text-foreground">Familiares e aniversários</h1><p className="text-sm text-muted-foreground">Cunhadas, sobrinhos e familiares vinculados aos irmãos da Loja.</p></div></div>
    <Tabs value={aba} onValueChange={setAba}>
      <TabsList><TabsTrigger value="cadastro">Cadastro de familiares</TabsTrigger><TabsTrigger value="aniversarios">Aniversariantes</TabsTrigger></TabsList>
      <TabsContent value="cadastro"><FamiliaresCadastro /></TabsContent>
      <TabsContent value="aniversarios"><Aniversarios /></TabsContent>
    </Tabs>
  </div>;
}