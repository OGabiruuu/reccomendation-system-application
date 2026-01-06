import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Button } from "../ui/button";

export type AdminCollectionFormData = {
  id?: string;
  name: string;
  quantity: number;
};

interface CollectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: AdminCollectionFormData | null;
  onSubmit: (collection: AdminCollectionFormData) => void;
}

export function CollectionFormDialog({ open, onOpenChange, collection, onSubmit }: CollectionFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
  });

  useEffect(() => {
    if (collection) {
      setFormData({
        name: collection.name,
        quantity: collection.quantity.toString(),
      });
    } else {
      setFormData({
        name: '',
        quantity: '',
      });
    }
  }, [collection, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.quantity) {
      toast.error("Preencha o campo obrigatório");
      return;
    }

    const collectionData: AdminCollectionFormData = {
      ...(collection ? { id: collection.id } : {}),
      name: formData.name,
      quantity: parseInt(formData.quantity)
    };

    onSubmit(collectionData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">{collection ? "Editar Coleção" : "Nova coleção"}</DialogTitle>
          <DialogDescription>Preencha as informações da coleção</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Nome da coleção *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                className="hover:border-primary/40 transition-smooth"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade de produtos *</Label>
              <Input
                id="quantity"
                type="number"
                step="1"
                value={formData.quantity}
                onChange={(e: any) => setFormData({ ...formData, quantity: e.target.value })}
                className="hover:border-primary/40 transition-smooth"
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 gradient-primary">
              {collection ? "Salvar Alterações" : "Criar Coleção"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
