import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { db } from "@/api/db";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FamiliarCampos from "@/components/familiares/FamiliarCampos";
import { novoFamiliar, dadosFamiliar, atualizarFamiliares, hoje } from "@/components/familiares/utils";

export default function FamiliarForm({ inicial, irmao, onClose }) {
  const [form, setForm] = useState(() => ({ ...novoFamiliar(irmao), ...inicial }));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const client = useQueryClient();
  const salvar = async (event) => {
    event.preventDefault();
    if (!form.nome_completo.trim() || !form.irmao_id) { setErro("Informe o nome e selecione o irmão responsável."); return; }
    if (form.data_nascimento && form.data_nascimento > hoje()) { setErro("A data de nascimento não pode ser futura."); return; }
    setSalvando(true); setErro("");
    try {
      const dados = dadosFamiliar(form);
      if (inicial?.id) await db.Familiar.update(inicial.id, dados);
      else await db.Familiar.create(dados);
      await atualizarFamiliares(client);
      onClose();
    } catch (error) { setErro(`Não foi possível salvar: ${error.message}`); }
    finally { setSalvando(false); }
  };
  return <Dialog open onOpenChange={(open) => { if (!open && !salvando) onClose(); }}>
    <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
      <DialogHeader><DialogTitle>{inicial?.id ? "Editar familiar" : "Cadastrar familiar"}</DialogTitle><DialogDescription>Vincule cunhadas, sobrinhos e outros familiares ao cadastro do irmão.</DialogDescription></DialogHeader>
      <form onSubmit={salvar} className="space-y-4">
        <fieldset disabled={salvando} className="min-w-0"><FamiliarCampos form={form} irmao={irmao} onChange={(valores) => setForm((atual) => ({ ...atual, ...valores }))} /></fieldset>
        {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={salvando} onClick={onClose}>Cancelar</Button><Button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar familiar"}</Button></div>
      </form>
    </DialogContent>
  </Dialog>;
}