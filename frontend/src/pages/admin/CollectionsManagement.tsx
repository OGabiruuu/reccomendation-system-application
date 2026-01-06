import { useEffect, useState } from "react";
import { collectionApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CollectionFormDialog, type AdminCollectionFormData } from "@/components/admin/CollectionFromDialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ApiCollection = { id: number; name: string; quantity: number };
type Collection = { id: string; name: string; quantity: number };

export default function ProductsManagement() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [deletingCollection, setDeletingCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapApiCollection = (apiData: ApiCollection) => {
    return {
      id: String(apiData.id),
      name: apiData.name,
      quantity: apiData.quantity,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const apiCollections = await collectionApi.list().catch(() => []);
        const cols = (apiCollections as ApiCollection[]).map((c) => {
          return {
            id: String(c.id),
            name: c.name,
            quantity: c.quantity,
          };
        });
        setCollections(cols);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao carregar coleções";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // somente na montagem
  }, []);

  const filteredCollections = collections.filter((collection) => collection.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const toBackendPayload = (collection: AdminCollectionFormData) => ({
    name: collection.name,
  });

  const handleAddCollection = async (collection: AdminCollectionFormData) => {
    try {
      const created = (await collectionApi.create(toBackendPayload(collection))) as ApiCollection;
      const mapped = mapApiCollection(created as ApiCollection);
      setCollections((prev) => [...prev, mapped]);
      toast.success("Coleção adicionada com sucesso!");
      setIsFormOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao adicionar coleção";
      toast.error(message);
    }
  };

  // OBS: Ainda não há um patch para a API...
  const handleEditCollection = async (updatedCollection: AdminCollectionFormData) => {
    if (!updatedCollection.id) {
      toast.error("Dados inválidos para edição.");
      return;
    }
    try {
      const saved = (await collectionApi.update(updatedCollection.id, updatedCollection)) as ApiCollection;
      const mapped: Collection = mapApiCollection(saved);
      setCollections((prev) => prev.map((c) => (c.id === mapped.id ? mapped : c)));
      toast.success("Coleção atualizada com sucesso!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao editar coleção";
      toast.error(message);
    } finally {
      setEditingCollection(null);
      setIsFormOpen(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (deletingCollection) {
      try {
        await collectionApi.remove(deletingCollection.id);
        setCollections(collections.filter((p) => p.id !== deletingCollection.id));
        toast.success("Coleção removida com sucesso!");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao remover coleção";
        toast.error(message);
      } finally {
        setDeletingCollection(null);
      }
    }
  };

  const openEditDialog = (product: Collection) => {
    setEditingCollection(product);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Produtos</h1>
          <p className="text-muted-foreground mt-2">Gerencie seu catálogo de produtos</p>
        </div>
        <Button
          onClick={() => {
            setEditingCollection(null);
            setIsFormOpen(true);
          }}
          className="gradient-primary shadow-soft"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Coleção
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input placeholder="Buscar produtos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      {/* Products Table */}
      <div className="bg-card rounded-xl border border-border/50 shadow-soft overflow-hidden">
        {error && <div className="p-4 text-sm text-red-700 bg-red-50 border-b border-red-200">{error}</div>}
        {loading && <div className="p-4 text-sm text-muted-foreground border-b border-border/50">Carregando produtos...</div>}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border/50">
              <tr>
                <th className="w-1/3 text-left p-4 font-semibold">Nome</th>
                <th className="w-1/3 text-center p-4 font-semibold">Quantidade de items</th>
                <th className="w-1/3 text-right p-4 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCollections.map((collection) => (
                <tr key={collection.id} className="border-b border-border/50 hover:bg-muted/30 transition-smooth">
                  <td className="w-1/4 p-4 font-medium">{collection.name}</td>
                  <td className="w-1/4 text-center p-4">
                    <Badge variant="outline">{collection.quantity}</Badge>
                  </td>
                  <td className="w-1/4 p-4">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(collection)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-destructive/30 hover:bg-destructive/10 text-destructive"
                        onClick={() => setDeletingCollection(collection)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCollections.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma coleção encontrada</p>
          </div>
        )}
      </div>

      {/* Product Form Dialog */}
      <CollectionFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        collection={editingCollection}
        onSubmit={editingCollection ? handleEditCollection : handleAddCollection}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingCollection} onOpenChange={() => setDeletingCollection(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deletingCollection?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCollection}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
