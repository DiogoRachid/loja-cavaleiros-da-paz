import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function PreferenciasSection({ onReset }) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#1B3A5F]">Preferências gerais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-green-600" />
          As configurações são salvas automaticamente e aplicadas na hora nos players abertos.
        </p>
        <Button variant="outline" onClick={() => setOpen(true)}>
          <RotateCcw className="w-4 h-4" /> Restaurar configurações padrão
        </Button>
      </CardContent>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar padrões?</AlertDialogTitle>
            <AlertDialogDescription>
              Todas as configurações do player voltarão aos valores originais.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onReset}>Restaurar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}