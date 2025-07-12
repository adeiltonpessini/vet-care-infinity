import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown,
  Users,
  Building2,
  CreditCard,
  Palette,
  Globe,
  DollarSign,
  Settings,
  Shield,
  BarChart3,
  Zap,
  Mail,
  Eye,
  AlertTriangle,
  TrendingUp,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SuperAdminOrganizations from '@/components/superadmin/SuperAdminOrganizations';
import SuperAdminUsers from '@/components/superadmin/SuperAdminUsers';
import SuperAdminPlans from '@/components/superadmin/SuperAdminPlans';
import SuperAdminDesign from '@/components/superadmin/SuperAdminDesign';
import SuperAdminIntegrations from '@/components/superadmin/SuperAdminIntegrations';
import SuperAdminLogs from '@/components/superadmin/SuperAdminLogs';

interface DashboardStats {
  totalUsers: number;
  totalOrganizations: number;
  organizationsByType: Record<string, number>;
  totalRevenue: number;
  organizationsOverLimit: number;
  inactiveOrganizations: number;
}

export default function SuperAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrganizations: 0,
    organizationsByType: {},
    totalRevenue: 0,
    organizationsOverLimit: 0,
    inactiveOrganizations: 0
  });
  const [loading, setLoading] = useState(true);

  // Verificar se é superadmin usando email direto do user
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (user.email !== 'adeilton.ata@gmail.com') {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      // Total de usuários
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Total de organizações
      const { count: totalOrganizations, data: orgs } = await supabase
        .from('organizations')
        .select('type', { count: 'exact' });

      // Organizações por tipo
      const organizationsByType = orgs?.reduce((acc, org) => {
        acc[org.type] = (acc[org.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Organizações acima do limite (mock)
      const organizationsOverLimit = Math.floor(Math.random() * 5);

      // Organizações inativas (mock)
      const inactiveOrganizations = Math.floor(Math.random() * 10);

      // Revenue total (mock)
      const totalRevenue = Math.floor(Math.random() * 50000) + 10000;

      setStats({
        totalUsers: totalUsers || 0,
        totalOrganizations: totalOrganizations || 0,
        organizationsByType,
        totalRevenue,
        organizationsOverLimit,
        inactiveOrganizations
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email === 'adeilton.ata@gmail.com') {
      loadDashboardStats();
    }
  }, [user]);

  if (!user || user.email !== 'adeilton.ata@gmail.com') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-destructive mb-4" />
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta área.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getOrganizationTypeLabel = (type: string) => {
    const labels = {
      clinica_veterinaria: 'Clínicas Veterinárias',
      empresa_alimentos: 'Empresas de Alimentos',
      empresa_medicamentos: 'Empresas de Medicamentos',
      fazenda: 'Fazendas'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">SuperAdmin</h1>
                <p className="text-muted-foreground">Painel de controle do sistema</p>
              </div>
            </div>
            <Badge variant="destructive" className="gap-1">
              <Shield className="h-3 w-3" />
              ROOT ACCESS
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid grid-cols-7 gap-1 w-full">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="organizations" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Organizações
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Planos
            </TabsTrigger>
            <TabsTrigger value="design" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Design
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Integrações
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Dashboard Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +12% desde o mês passado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Organizações</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : stats.totalOrganizations}</div>
                  <p className="text-xs text-muted-foreground">
                    <Activity className="h-3 w-3 inline mr-1" />
                    {stats.inactiveOrganizations} inativas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? '...' : formatCurrency(stats.totalRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Este mês
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Alertas</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">
                    {loading ? '...' : stats.organizationsOverLimit}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Acima do limite
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Organizations by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Organizações por Tipo</CardTitle>
                <CardDescription>
                  Distribuição das organizações cadastradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(stats.organizationsByType).map(([type, count]) => (
                    <div key={type} className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm text-muted-foreground">
                        {getOrganizationTypeLabel(type)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Ferramentas de administração mais utilizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Globe className="h-6 w-6" />
                    Landing Page
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Mail className="h-6 w-6" />
                    E-mail Templates
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Settings className="h-6 w-6" />
                    Sistema
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <BarChart3 className="h-6 w-6" />
                    Relatórios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organizations">
            <SuperAdminOrganizations />
          </TabsContent>

          <TabsContent value="users">
            <SuperAdminUsers />
          </TabsContent>

          <TabsContent value="plans">
            <SuperAdminPlans />
          </TabsContent>

          <TabsContent value="design">
            <SuperAdminDesign />
          </TabsContent>

          <TabsContent value="integrations">
            <SuperAdminIntegrations />
          </TabsContent>

          <TabsContent value="logs">
            <SuperAdminLogs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}