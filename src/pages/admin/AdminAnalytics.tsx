import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  Users, 
  PawPrint, 
  Package,
  TrendingUp,
  Activity,
  Crown,
  BarChart3,
  Calendar,
  Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  totalOrganizations: number;
  totalUsers: number;
  totalAnimals: number;
  totalProducts: number;
  organizationsByType: Array<{ type: string; count: number; label: string }>;
  usersByRole: Array<{ role: string; count: number; label: string }>;
  organizationsByPlan: Array<{ plan: string; count: number; label: string }>;
  recentActivities: Array<{ date: string; organizations: number; users: number; animals: number }>;
  topOrganizations: Array<{ name: string; type: string; users: number; animals: number; products: number }>;
}

const COLORS = {
  primary: '#8884d8',
  secondary: '#82ca9d',
  accent: '#ffc658',
  warning: '#ff7300',
  success: '#00ff00',
  info: '#0088fe'
};

const PIE_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#0088fe'];

export default function AdminAnalytics() {
  const { userProfile } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (userProfile?.role !== 'superadmin') {
      return;
    }
    loadAnalytics();
  }, [userProfile, timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Get total counts
      const [orgsResult, usersResult, animalsResult, productsResult] = await Promise.all([
        supabase.from('organizations').select('*'),
        supabase.from('users').select('*'),
        supabase.from('animais').select('*'),
        supabase.from('produtos').select('*')
      ]);

      if (orgsResult.error || usersResult.error || animalsResult.error || productsResult.error) {
        console.error('Error loading analytics data');
        return;
      }

      const organizations = orgsResult.data || [];
      const users = usersResult.data || [];
      const animals = animalsResult.data || [];
      const products = productsResult.data || [];

      // Organization types breakdown
      const orgTypeCount = organizations.reduce((acc, org) => {
        acc[org.type] = (acc[org.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const organizationsByType = [
        { type: 'clinica_veterinaria', count: orgTypeCount.clinica_veterinaria || 0, label: 'Clínicas Veterinárias' },
        { type: 'empresa_alimentos', count: orgTypeCount.empresa_alimentos || 0, label: 'Empresas de Alimentos' },
        { type: 'empresa_medicamentos', count: orgTypeCount.empresa_medicamentos || 0, label: 'Empresas de Medicamentos' },
        { type: 'fazenda', count: orgTypeCount.fazenda || 0, label: 'Fazendas' }
      ];

      // Users by role breakdown
      const userRoleCount = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const usersByRole = [
        { role: 'superadmin', count: userRoleCount.superadmin || 0, label: 'Super Admins' },
        { role: 'admin', count: userRoleCount.admin || 0, label: 'Administradores' },
        { role: 'veterinario', count: userRoleCount.veterinario || 0, label: 'Veterinários' },
        { role: 'colaborador', count: userRoleCount.colaborador || 0, label: 'Colaboradores' },
        { role: 'vendedor', count: userRoleCount.vendedor || 0, label: 'Vendedores' },
        { role: 'gerente_produto', count: userRoleCount.gerente_produto || 0, label: 'Gerentes de Produto' }
      ];

      // Organizations by plan
      const orgPlanCount = organizations.reduce((acc, org) => {
        acc[org.plano] = (acc[org.plano] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const organizationsByPlan = [
        { plan: 'free', count: orgPlanCount.free || 0, label: 'Free' },
        { plan: 'pro', count: orgPlanCount.pro || 0, label: 'Pro' },
        { plan: 'enterprise', count: orgPlanCount.enterprise || 0, label: 'Enterprise' }
      ];

      // Mock recent activities data (in a real app, you'd get this from actual activity logs)
      const recentActivities = [
        { date: '2024-01-01', organizations: 5, users: 12, animals: 45 },
        { date: '2024-01-02', organizations: 7, users: 18, animals: 62 },
        { date: '2024-01-03', organizations: 10, users: 25, animals: 78 },
        { date: '2024-01-04', organizations: 12, users: 30, animals: 95 },
        { date: '2024-01-05', organizations: 15, users: 38, animals: 112 },
        { date: '2024-01-06', organizations: 18, users: 45, animals: 128 },
        { date: '2024-01-07', organizations: organizations.length, users: users.length, animals: animals.length }
      ];

      // Get organization stats for top organizations
      const orgStats = await Promise.all(
        organizations.slice(0, 5).map(async (org) => {
          const [orgUsers, orgAnimals, orgProducts] = await Promise.all([
            supabase.from('users').select('*').eq('org_id', org.id),
            supabase.from('animais').select('*').eq('org_id', org.id),
            supabase.from('produtos').select('*').eq('org_id', org.id)
          ]);

          return {
            name: org.name,
            type: org.type,
            users: orgUsers.data?.length || 0,
            animals: orgAnimals.data?.length || 0,
            products: orgProducts.data?.length || 0
          };
        })
      );

      setAnalytics({
        totalOrganizations: organizations.length,
        totalUsers: users.length,
        totalAnimals: animals.length,
        totalProducts: products.length,
        organizationsByType,
        usersByRole,
        organizationsByPlan,
        recentActivities,
        topOrganizations: orgStats
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (userProfile?.role !== 'superadmin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Crown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você precisa ser um superadmin para acessar esta página.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Carregando analytics...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8" />
            Analytics do Sistema
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral completa do sistema e métricas de uso
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizações</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalOrganizations}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +8% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Animais</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalAnimals}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +15% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +5% vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento ao Longo do Tempo</CardTitle>
            <CardDescription>
              Evolução de organizações, usuários e animais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.recentActivities}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="organizations" stroke={COLORS.primary} name="Organizações" />
                <Line type="monotone" dataKey="users" stroke={COLORS.secondary} name="Usuários" />
                <Line type="monotone" dataKey="animals" stroke={COLORS.accent} name="Animais" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Organization Types */}
        <Card>
          <CardHeader>
            <CardTitle>Organizações por Tipo</CardTitle>
            <CardDescription>
              Distribuição dos tipos de organizações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.organizationsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.organizationsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Users by Role */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários por Cargo</CardTitle>
            <CardDescription>
              Distribuição dos cargos no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.usersByRole}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.secondary} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plans Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Planos</CardTitle>
            <CardDescription>
              Organizações por tipo de plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.organizationsByPlan}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Organizations */}
      <Card>
        <CardHeader>
          <CardTitle>Principais Organizações</CardTitle>
          <CardDescription>
            Organizações com maior atividade no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topOrganizations.map((org, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{org.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {org.type === 'clinica_veterinaria' && 'Clínica Veterinária'}
                      {org.type === 'empresa_alimentos' && 'Empresa de Alimentos'}
                      {org.type === 'empresa_medicamentos' && 'Empresa de Medicamentos'}
                      {org.type === 'fazenda' && 'Fazenda'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-sm font-medium">{org.users}</div>
                    <div className="text-xs text-muted-foreground">Usuários</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{org.animals}</div>
                    <div className="text-xs text-muted-foreground">Animais</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{org.products}</div>
                    <div className="text-xs text-muted-foreground">Produtos</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}