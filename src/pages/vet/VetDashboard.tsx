import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PawPrint, 
  Stethoscope, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  FileText,
  Calendar,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalAnimals: number;
  recentDiagnostics: number;
  lowStockItems: number;
  topProducts: Array<{ name: string; count: number }>;
  recentPrescriptions: number;
}

export default function VetDashboard() {
  const { userProfile, organization } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalAnimals: 0,
    recentDiagnostics: 0,
    lowStockItems: 0,
    topProducts: [],
    recentPrescriptions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [userProfile?.org_id]);

  const fetchDashboardData = async () => {
    if (!userProfile?.org_id) return;

    try {
      // Fetch animals count
      const { count: animalsCount } = await supabase
        .from('animais')
        .select('*', { count: 'exact' })
        .eq('org_id', userProfile.org_id);

      // Fetch recent diagnostics (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: diagnosticsCount } = await supabase
        .from('diagnosticos')
        .select('*', { count: 'exact' })
        .eq('org_id', userProfile.org_id)
        .gte('created_at', sevenDaysAgo.toISOString());

      // Fetch low stock items
      const { count: lowStockCount } = await supabase
        .from('estoque')
        .select('*', { count: 'exact' })
        .eq('org_id', userProfile.org_id)
        .lt('quantidade', 10);

      // Fetch recent prescriptions
      const { count: prescriptionsCount } = await supabase
        .from('receitas')
        .select('*', { count: 'exact' })
        .eq('org_id', userProfile.org_id)
        .gte('created_at', sevenDaysAgo.toISOString());

      // Fetch top indicated products
      const { data: indicationsData } = await supabase
        .from('indicacoes_produto')
        .select(`
          produto_id,
          produtos(nome)
        `)
        .eq('org_id', userProfile.org_id)
        .gte('created_at', sevenDaysAgo.toISOString());

      const productCounts = indicationsData?.reduce((acc: any, indication: any) => {
        const productName = indication.produtos?.nome || 'Produto não encontrado';
        acc[productName] = (acc[productName] || 0) + 1;
        return acc;
      }, {}) || {};

      const topProducts = Object.entries(productCounts)
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalAnimals: animalsCount || 0,
        recentDiagnostics: diagnosticsCount || 0,
        lowStockItems: lowStockCount || 0,
        topProducts,
        recentPrescriptions: prescriptionsCount || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Carregando dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Stethoscope className="h-8 w-8 text-primary" />
            Dashboard Veterinário
          </h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo(a), Dr(a). {userProfile?.nome}! Acompanhe suas atividades veterinárias.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{organization?.name}</Badge>
          <Badge className="bg-primary text-primary-foreground">
            {organization?.plano.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Animais Ativos</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnimals}</div>
            <p className="text-xs text-muted-foreground">
              Limite: {organization?.limite_animais}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diagnósticos (7d)</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentDiagnostics}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 7 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Items com menos de 10 unidades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas (7d)</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentPrescriptions}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 7 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as funcionalidades mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              asChild
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Link to="/vet/animals">
                <PawPrint className="h-6 w-6" />
                Gerenciar Animais
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Link to="/vet/diagnostics">
                <Stethoscope className="h-6 w-6" />
                Novo Diagnóstico
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Link to="/vet/prescriptions">
                <FileText className="h-6 w-6" />
                Nova Receita
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Produtos Mais Indicados
            </CardTitle>
            <CardDescription>Últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topProducts.length > 0 ? (
              <div className="space-y-3">
                {stats.topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">#{index + 1}</span>
                      <span className="text-sm">{product.name}</span>
                    </div>
                    <Badge variant="secondary">{product.count} indicações</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma indicação nos últimos 7 dias</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Alertas e Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.lowStockItems > 0 && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md">
                  <Package className="h-4 w-4 text-destructive" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Estoque baixo</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.lowStockItems} items precisam de reposição
                    </p>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/vet/inventory">Ver</Link>
                  </Button>
                </div>
              )}
              
              <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-md">
                <Calendar className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Agenda do dia</p>
                  <p className="text-xs text-muted-foreground">
                    5 consultas agendadas para hoje
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Ver agenda
                </Button>
              </div>

              <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-md">
                <Clock className="h-4 w-4 text-warning" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Vacinas atrasadas</p>
                  <p className="text-xs text-muted-foreground">
                    3 animais com vacinas em atraso
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Verificar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}