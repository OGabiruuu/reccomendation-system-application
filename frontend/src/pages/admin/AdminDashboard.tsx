import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Layers, Star, TrendingUp } from 'lucide-react';
import { statisticsApi } from '@/lib/api';

type ApiStats = {
  products_count: number,
  collections_count: number,
  categories_count: number,
  products_by_category: { category: string, product_quantity: number }[]
};

export default function AdminDashboard() {
  const [apiStats, setApiStats] = useState<ApiStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const apiData = await statisticsApi.list()
        setApiStats(apiData as ApiStats)
        setError(null)
      }
      catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao carregar dados do servidor!"
        setError(message)
      }
      finally {
        setLoading(false)
      }
    }

    fetchData();
  }, [])

  // Passa os dados simples da API para o formato do objeto na UI.
  const stats = useMemo(() => ([
    { title: 'Total de Produtos', value: apiStats?.products_count, icon: Package, color: 'text-blue-500' },
    { title: 'Categorias', value: apiStats?.categories_count, icon: Layers, color: 'text-purple-500' },
    { title: 'Coleções', value: apiStats?.collections_count, icon: Star, color: 'text-pink-500' },
  ]), [apiStats])

  // Representa a lista de quantidade de produtos por categoria no formato do objeto da UI.
  const productsByCategory = useMemo(() => (apiStats?.products_by_category || []), [apiStats])
  const totalProducts = useMemo(() => (apiStats?.products_count || 0), [apiStats])

  // Aqui devemos ter os dados da API



  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral do seu catálogo de produtos
        </p>
      </div>
      {loading && <div className="p-6 text-sm text-muted-foreground border-b border-border/50">Carregando dados...</div>}
      {error && <div className="p-4 text-sm text-red-700 bg-red-50 border-b border-red-200">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Products by Category */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Produtos por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productsByCategory.map((entry) => (
              <div key={entry.category} className="flex items-center justify-between">
                <span className="font-medium">{entry.category}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-primary"
                      style={{ width: `${(entry.product_quantity / totalProducts) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {entry.product_quantity} {entry.product_quantity === 1 ? 'item' : 'itens'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
