import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { 
  BarChart3, 
  Download, 
  Filter,
  TrendingUp,
  PawPrint,
  Package,
  Users,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface ReportData {
  period: string;
  animals: number;
  products: number;
  users: number;
  activities: number;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#0088fe'];

export default function Reports() {
  const { organization } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [reportData, setReportData] = useState<ReportData[]>([]);

  useEffect(() => {
    if (organization) {
      loadReportData();
    }
  }, [organization, reportType, timeRange]);

  const loadReportData = async () => {
    if (!organization) return;
    
    setLoading(true);
    try {
      // Mock data for demonstration - replace with actual queries
      const mockData: ReportData[] = [
        { period: '2024-01-01', animals: 12, products: 5, users: 3, activities: 25 },
        { period: '2024-01-02', animals: 15, products: 7, users: 3, activities: 32 },
        { period: '2024-01-03', animals: 18, products: 8, users: 4, activities: 41 },
        { period: '2024-01-04', animals: 22, products: 10, users: 4, activities: 58 },
        { period: '2024-01-05', animals: 25, products: 12, users: 5, activities: 67 },
        { period: '2024-01-06', animals: 28, products: 15, users: 5, activities: 78 },
        { period: '2024-01-07', animals: 30, products: 18, users: 6, activities: 89 },
      ];

      setReportData(mockData);
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'overview':
        return 'Visão Geral';
      case 'animals':
        return 'Relatório de Animais';
      case 'products':
        return 'Relatório de Produtos';
      case 'team':
        return 'Relatório da Equipe';
      case 'financial':
        return 'Relatório Financeiro';
      default:
        return 'Relatório';
    }
  };

  const getChartData = () => {
    return reportData.map(item => ({
      ...item,
      date: new Date(item.period).toLocaleDateString('pt-BR')
    }));
  };

  const getPieData = () => {
    const totals = reportData.reduce((acc, item) => ({
      animals: acc.animals + item.animals,
      products: acc.products + item.products,
      users: acc.users + item.users,
      activities: acc.activities + item.activities,
    }), { animals: 0, products: 0, users: 0, activities: 0 });

    return [
      { name: 'Animais', value: totals.animals },
      { name: 'Produtos', value: totals.products },
      { name: 'Usuários', value: totals.users },
      { name: 'Atividades', value: totals.activities },
    ];
  };

  const exportReport = () => {
    // Mock export functionality
    const csvContent = [
      ['Data', 'Animais', 'Produtos', 'Usuários', 'Atividades'],
      ...reportData.map(item => [
        item.period,
        item.animals.toString(),
        item.products.toString(),
        item.users.toString(),
        item.activities.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8" />
            Relatórios e Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Análise detalhada dos dados da sua organização
          </p>
        </div>

        <Button onClick={exportReport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Visão Geral</SelectItem>
                  <SelectItem value="animals">Animais</SelectItem>
                  <SelectItem value="products">Produtos</SelectItem>
                  <SelectItem value="team">Equipe</SelectItem>
                  <SelectItem value="financial">Financeiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                  <SelectItem value="1y">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Animais</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.length > 0 ? reportData[reportData.length - 1].animals : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% vs período anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.length > 0 ? reportData[reportData.length - 1].products : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +8% vs período anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipe</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.length > 0 ? reportData[reportData.length - 1].users : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +5% vs período anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.length > 0 ? reportData[reportData.length - 1].activities : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +15% vs período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{getReportTitle()} - Tendência</CardTitle>
            <CardDescription>
              Evolução ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div>Carregando...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="animals" stroke="#8884d8" name="Animais" />
                  <Line type="monotone" dataKey="products" stroke="#82ca9d" name="Produtos" />
                  <Line type="monotone" dataKey="users" stroke="#ffc658" name="Usuários" />
                  <Line type="monotone" dataKey="activities" stroke="#ff7300" name="Atividades" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
            <CardDescription>
              Proporção de cada categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div>Carregando...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getPieData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getPieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{getReportTitle()} - Comparativo</CardTitle>
            <CardDescription>
              Comparação por período
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div>Carregando...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="animals" fill="#8884d8" name="Animais" />
                  <Bar dataKey="products" fill="#82ca9d" name="Produtos" />
                  <Bar dataKey="users" fill="#ffc658" name="Usuários" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Detalhada</CardTitle>
          <CardDescription>
            Insights e recomendações baseados nos dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-green-600 mb-2">✅ Pontos Positivos</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Crescimento consistente no número de animais cadastrados</li>
                <li>• Aumento na atividade geral do sistema</li>
                <li>• Boa adoção de produtos pelos usuários</li>
              </ul>
            </div>
            
            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <h4 className="font-semibold text-orange-600 mb-2">⚠️ Pontos de Atenção</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Crescimento da equipe está abaixo do esperado</li>
                <li>• Algumas funcionalidades podem estar subutilizadas</li>
                <li>• Considere campanhas para aumentar o engajamento</li>
              </ul>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-semibold text-blue-600 mb-2">💡 Recomendações</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Implementar treinamentos para maximizar o uso do sistema</li>
                <li>• Considerar expansão da equipe para suportar o crescimento</li>
                <li>• Desenvolver estratégias para retenção de usuários</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}