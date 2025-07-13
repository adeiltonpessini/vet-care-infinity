import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsGrid } from '@/components/shared/StatsGrid';
import { DataCard } from '@/components/shared/DataCard';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { 
  PawPrint, 
  Stethoscope, 
  FileText, 
  Package, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalAnimals: number;
  totalDiagnostics: number;
  totalPrescriptions: number;
  lowStockItems: number;
  recentDiagnostics: any[];
  recentPrescriptions: any[];
  lowStockAlerts: any[];
}

export default function VetDashboard() {
  const { organization } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalAnimals: 0,
    totalDiagnostics: 0,
    totalPrescriptions: 0,
    lowStockItems: 0,
    recentDiagnostics: [],
    recentPrescriptions: [],
    lowStockAlerts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!organization) return;

      try {
        // Load animals count
        const { count: animalsCount } = await supabase
          .from('animais')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', organization.id);

        // Load diagnostics count and recent
        const { data: diagnostics, count: diagnosticsCount } = await supabase
          .from('diagnosticos')
          .select(`
            *,
            animais (nome, especie)
          `, { count: 'exact' })
          .eq('org_id', organization.id)
          .order('created_at', { ascending: false })
          .limit(5);

        // Load prescriptions count and recent
        const { data: prescriptions, count: prescriptionsCount } = await supabase
          .from('receitas')
          .select(`
            *,
            animais (nome, especie, nome_tutor)
          `, { count: 'exact' })
          .eq('org_id', organization.id)
          .order('created_at', { ascending: false })
          .limit(5);

        // Load low stock items
        const { data: lowStock, count: lowStockCount } = await supabase
          .from('estoque')
          .select('*', { count: 'exact' })
          .eq('org_id', organization.id)
          .filter('quantidade', 'lte', 'alerta_minimo');

        setStats({
          totalAnimals: animalsCount || 0,
          totalDiagnostics: diagnosticsCount || 0,
          totalPrescriptions: prescriptionsCount || 0,
          lowStockItems: lowStockCount || 0,
          recentDiagnostics: diagnostics || [],
          recentPrescriptions: prescriptions || [],
          lowStockAlerts: lowStock || []
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [organization]);

  const statsCards = [
    {
      title: 'Total de Animais',
      value: stats.totalAnimals.toString(),
      description: `Limite: ${organization?.limite_animais || 0}`,
      icon: <PawPrint className="h-4 w-4" />,
      variant: 'default' as const
    },
    {
      title: 'Diagnósticos',
      value: stats.totalDiagnostics.toString(),
      description: 'Total de diagnósticos',
      icon: <Stethoscope className="h-4 w-4" />,
      variant: 'default' as const
    },
    {
      title: 'Receitas Emitidas',
      value: stats.totalPrescriptions.toString(),
      description: 'Total de receitas',
      icon: <FileText className="h-4 w-4" />,
      variant: 'default' as const
    },
    {
      title: 'Itens em Estoque Baixo',
      value: stats.lowStockItems.toString(),
      description: 'Requer atenção',
      icon: <Package className="h-4 w-4" />,
      variant: (stats.lowStockItems > 0 ? 'warning' : 'default') as 'warning' | 'default'
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Dashboard Veterinário"
        description="Visão geral da clínica e atividades recentes"
        icon={<Stethoscope className="h-8 w-8" />}
      />

      <StatsGrid stats={statsCards} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Diagnostics */}
        <DataCard
          title="Diagnósticos Recentes"
          description="Últimos diagnósticos realizados"
          actions={[
            {
              label: 'Ver Todos',
              onClick: () => window.location.href = '/vet/diagnostics',
              variant: 'outline'
            }
          ]}
        >
          <div className="space-y-3">
            {stats.recentDiagnostics.length > 0 ? (
              stats.recentDiagnostics.map((diag) => (
                <div key={diag.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{diag.animais?.nome}</p>
                    <p className="text-sm text-muted-foreground">{diag.descricao}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {diag.animais?.especie}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {diag.tipo}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(diag.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum diagnóstico recente</p>
              </div>
            )}
          </div>
        </DataCard>

        {/* Recent Prescriptions */}
        <DataCard
          title="Receitas Recentes"
          description="Últimas receitas emitidas"
          actions={[
            {
              label: 'Ver Todas',
              onClick: () => window.location.href = '/vet/prescriptions',
              variant: 'outline'
            }
          ]}
        >
          <div className="space-y-3">
            {stats.recentPrescriptions.length > 0 ? (
              stats.recentPrescriptions.map((prescription) => (
                <div key={prescription.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{prescription.animais?.nome}</p>
                    <p className="text-sm text-muted-foreground">{prescription.medicamento}</p>
                    <p className="text-xs text-muted-foreground">
                      Tutor: {prescription.animais?.nome_tutor}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs mb-1">
                      {prescription.duracao_dias} dias
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {new Date(prescription.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma receita recente</p>
              </div>
            )}
          </div>
        </DataCard>
      </div>

      {/* Low Stock Alerts */}
      {stats.lowStockAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Alertas de Estoque Baixo
            </CardTitle>
            <CardDescription>
              Itens que precisam de reposição urgente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.lowStockAlerts.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg bg-warning/5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{item.nome}</h4>
                    <Badge variant="destructive">{item.quantidade} {item.unidade}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{item.categoria}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Mínimo: {item.alerta_minimo}
                    </span>
                    <Button size="sm" variant="outline" asChild>
                      <Link to="/vet/inventory">Repor</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as funcionalidades mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <Link to="/vet/animals">
                <PawPrint className="h-6 w-6" />
                Cadastrar Animal
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <Link to="/vet/diagnostics">
                <Stethoscope className="h-6 w-6" />
                Novo Diagnóstico
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <Link to="/vet/prescriptions">
                <FileText className="h-6 w-6" />
                Emitir Receita
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <Link to="/vet/inventory">
                <Package className="h-6 w-6" />
                Gerenciar Estoque
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}