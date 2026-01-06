import { useEffect, useMemo, useState } from "react";
import { productApi, collectionApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductFormDialog, type AdminProductFormData } from "@/components/admin/ProductFormDialog";
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

type ApiProduct = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  color: { name: string; hex: string }[];
  size: string;
  description: string;
  model: string;
  collection_id: number;
};

type Collection = { id: number; name: string };

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  colors: { name: string; hex: string }[];
  sizes: string[];
  description: string;
  collection?: string;
  collectionId?: number;
  model?: string;
};

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [apiCollections, apiProducts] = await Promise.all([collectionApi.list().catch(() => []), productApi.list().catch(() => [])]);
        const cols = apiCollections as Collection[];
        setCollections(cols);
        const mapped = (apiProducts as ApiProduct[]).map((p) => {
          const colName = cols.find((c) => c.id === p.collection_id)?.name;
          return {
            id: String(p.id),
            name: p.name,
            price: p.price,
            image: p.image,
            category: p.category,
            colors: Array.isArray(p.color)
              ? p.color.map((c: any, idx) => ({
                  name: c?.name ?? `Cor ${idx + 1}`,
                  hex: c?.hex ?? String(c ?? "#000000"),
                }))
              : [],
            sizes: p.size
              ? p.size
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              : ["Único"],
            description: p.description,
            collection: colName,
            collectionId: p.collection_id,
            model: p.model,
          } as Product;
        });
        setProducts(mapped);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao carregar produtos";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // somente na montagem
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toBackendPayload = (product: AdminProductFormData) => ({
    name: product.name,
    price: product.price,
    color: product.colors,
    category: product.category,
    size: product.sizes.join(","),
    description: product.description,
    image: product.image,
    model: product.model || "manual",
    collection_id: product.collectionId,
  });

  const handleAddProduct = async (product: AdminProductFormData) => {
    if (!product.collectionId) {
      toast.error("Selecione uma coleção");
      return;
    }
    try {
      const created = (await productApi.create(toBackendPayload(product))) as ApiProduct;
      const mapped = mapApiProduct(created); // É preciso implementar essa funcao com o codigo da linha 69
      setProducts((prev) => [...prev, mapped]);
      toast.success("Produto adicionado com sucesso!");
      setIsFormOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao adicionar produto";
      toast.error(message);
    }
  };

  const handleEditProduct = async (updatedProduct: AdminProductFormData) => {
    if (!updatedProduct.id || !updatedProduct.collectionId) {
      toast.error("Dados inválidos para edição.");
      return;
    }
    try {
      const saved = (await productApi.update(updatedProduct.id, toBackendPayload(updatedProduct))) as ApiProduct;
      const mapped: Product = {
        id: String(saved.id),
        name: saved.name,
        price: saved.price,
        image: saved.image,
        category: saved.category,
        colors: Array.isArray(saved.color)
          ? saved.color.map((c: any, idx) => ({
              name: c?.name ?? `Cor ${idx + 1}`,
              hex: c?.hex ?? String(c ?? "#000000"),
            }))
          : [],
        sizes: saved.size
          ? saved.size
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : ["Único"],
        description: saved.description,
        collection: collections.find((c) => c.id === saved.collection_id)?.name,
        collectionId: saved.collection_id,
        model: saved.model,
      };
      setProducts((prev) => prev.map((p) => (p.id === mapped.id ? mapped : p)));
      toast.success("Produto atualizado com sucesso!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao editar produto";
      toast.error(message);
    } finally {
      setEditingProduct(null);
      setIsFormOpen(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (deletingProduct) {
      try {
        await productApi.remove(deletingProduct.id);
        setProducts(products.filter((p) => p.id !== deletingProduct.id));
        toast.success("Produto removido com sucesso!");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao remover produto";
        toast.error(message);
      } finally {
        setDeletingProduct(null);
      }
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
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
            setEditingProduct(null);
            setIsFormOpen(true);
          }}
          className="gradient-primary shadow-soft"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Produto
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
                <th className="text-left p-4 font-semibold">Imagem</th>
                <th className="text-left p-4 font-semibold">Nome</th>
                <th className="text-left p-4 font-semibold">Categoria</th>
                <th className="text-left p-4 font-semibold">Preço</th>
                <th className="text-left p-4 font-semibold">Coleção</th>
                <th className="text-right p-4 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-border/50 hover:bg-muted/30 transition-smooth">
                  <td className="p-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="p-4 font-medium">{product.name}</td>
                  <td className="p-4">
                    <Badge variant="outline">{product.category}</Badge>
                  </td>
                  <td className="p-4 font-display font-bold text-primary">R$ {product.price.toFixed(2)}</td>
                  <td className="p-4">
                    {product.collection ? (
                      <Badge className="gradient-primary border-0">{product.collection}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(product)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-destructive/30 hover:bg-destructive/10 text-destructive"
                        onClick={() => setDeletingProduct(product)}
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum produto encontrado</p>
          </div>
        )}
      </div>

      {/* Product Form Dialog */}
      <ProductFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        product={editingProduct}
        onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
        collections={collections}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deletingProduct?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
