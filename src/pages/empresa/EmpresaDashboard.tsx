import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, Users, Award } from 'lucide-react';

interface DashboardData {
  totalProdutos: number;
  totalIndicacoes: number;
  totalFuncionarios: number;
  produtoMaisIndicado: string;
}

export default function EmpresaDashboard() {
  const { organization } = useAuth();
  const [data, setData] = useState<DashboardData>({
    totalProdutos: 0,
    totalIndicacoes: 0,
    totalFuncionarios: 0,
    produtoMaisIndicado: 'Nenhum',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [organization?.id]);

  const fetchDashboardData = async () => {
    if (!organization?.id) return;

    try {
      const [produtosRes, indicacoesRes, funcionariosRes] = await Promise.all([
        supabase.from('produtos').select('id').eq('org_id', organization.id),
        supabase.from('indicacoes_produto').select('id').eq('org_id', organization.id),
        supabase.from('users').select('id').eq('org_id', organization.id),
      ]);

      setData({
        totalProdutos: produtosRes.data?.length || 0,
        totalIndicacoes: indicacoesRes.data?.length || 0,
        totalFuncionarios: funcionariosRes.data?.length || 0,
        produtoMaisIndicado: 'Ração Premium',
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Carregando dashboard...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Empresa</h1>
        <p className="text-muted-foreground">
          Visão geral dos produtos e indicações da {organization?.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalProdutos}</div>
            <p className="text-xs text-muted-foreground">
              Produtos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indicações Recebidas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalIndicacoes}</div>
            <p className="text-xs text-muted-foreground">
              +12% este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalFuncionarios}</div>
            <p className="text-xs text-muted-foreground">
              Membros da equipe
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produto Top</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{data.produtoMaisIndicado}</div>
            <p className="text-xs text-muted-foreground">
              Mais indicado
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Indicações Recentes</CardTitle>
            <CardDescription>Últimas indicações dos seus produtos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Ração Premium Cães</p>
                <p className="text-sm text-muted-foreground">Dr. Silva - ClínicaVet</p>
              </div>
              <Badge>Hoje</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Suplemento Gatos</p>
                <p className="text-sm text-muted-foreground">Dr. Costa - AniVet</p>
              </div>
              <Badge variant="secondary">Ontem</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feedback Veterinários</CardTitle>
            <CardDescription>Avaliações dos profissionais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Ração Premium Cães</p>
                <p className="text-sm text-muted-foreground">⭐⭐⭐⭐⭐ "Excelente resultado"</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Medicamento Anti-pulgas</p>
                <p className="text-sm text-muted-foreground">⭐⭐⭐⭐⭐ "Muito eficaz"</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}