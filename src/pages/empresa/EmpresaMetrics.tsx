import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Award, Calendar } from 'lucide-react';

interface MetricData {
  produto: string;
  indicacoes: number;
  veterinario: string;
  data: string;
}

export default function EmpresaMetrics() {
  const { organization } = useAuth();
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalIndicacoes, setTotalIndicacoes] = useState(0);

  useEffect(() => {
    fetchMetrics();
  }, [organization?.id]);

  const fetchMetrics = async () => {
    if (!organization?.id) return;

    try {
      // Buscar indicações com dados dos produtos e veterinários
      const { data: indicacoes, error } = await supabase
        .from('indicacoes_produto')
        .select(`
          id,
          created_at,
          produtos!inner(nome),
          users!inner(nome)
        `)
        .eq('org_id', organization.id);

      if (error) throw error;

      // Processar dados para métricas
      const processedMetrics: MetricData[] = indicacoes?.map(indicacao => ({
        produto: indicacao.produtos?.nome || 'Produto não encontrado',
        indicacoes: 1,
        veterinario: indicacao.users?.nome || 'Veterinário não encontrado',
        data: new Date(indicacao.created_at).toLocaleDateString('pt-BR')
      })) || [];

      setMetrics(processedMetrics);
      setTotalIndicacoes(processedMetrics.length);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Agrupar produtos por quantidade de indicações
  const produtosPorIndicacao = metrics.reduce((acc, metric) => {
    acc[metric.produto] = (acc[metric.produto] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topProdutos = Object.entries(produtosPorIndicacao)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Agrupar veterinários por quantidade de indicações
  const veterinariosPorIndicacao = metrics.reduce((acc, metric) => {
    acc[metric.veterinario] = (acc[metric.veterinario] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topVeterinarios = Object.entries(veterinariosPorIndicacao)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  if (loading) {
    return <div className="p-8">Carregando métricas...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Métricas de Indicação</h1>
        <p className="text-muted-foreground">
          Estatísticas sobre as indicações dos seus produtos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Indicações</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIndicacoes}</div>
            <p className="text-xs text-muted-foreground">
              Todas as indicações recebidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Indicados</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(produtosPorIndicacao).length}</div>
            <p className="text-xs text-muted-foreground">
              Produtos com indicações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veterinários Ativos</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(veterinariosPorIndicacao).length}</div>
            <p className="text-xs text-muted-foreground">
              Veterinários indicando
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média por Dia</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalIndicacoes > 0 ? Math.round(totalIndicacoes / 30) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Indicações por dia (30 dias)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Produtos Mais Indicados</CardTitle>
            <CardDescription>Produtos com maior número de indicações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProdutos.length > 0 ? topProdutos.map(([produto, indicacoes], index) => (
              <div key={produto} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <span className="font-medium">{produto}</span>
                </div>
                <Badge>{indicacoes} indicações</Badge>
              </div>
            )) : (
              <p className="text-muted-foreground">Nenhuma indicação registrada</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Veterinários</CardTitle>
            <CardDescription>Veterinários que mais indicam seus produtos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topVeterinarios.length > 0 ? topVeterinarios.map(([veterinario, indicacoes], index) => (
              <div key={veterinario} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <span className="font-medium">{veterinario}</span>
                </div>
                <Badge variant="secondary">{indicacoes} indicações</Badge>
              </div>
            )) : (
              <p className="text-muted-foreground">Nenhum veterinário registrado</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico Recente de Indicações</CardTitle>
          <CardDescription>Últimas indicações recebidas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.slice(0, 10).map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{metric.produto}</p>
                  <p className="text-sm text-muted-foreground">
                    Indicado por {metric.veterinario}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{metric.data}</p>
                </div>
              </div>
            ))}
            {metrics.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma indicação registrada ainda
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}