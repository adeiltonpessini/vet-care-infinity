import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wheat, PawPrint, Activity, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';

interface DashboardData {
  totalLotes: number;
  totalAnimais: number;
  vacinacoesVencendo: number;
  eventosRecentes: number;
  loteMaisProblemas: string;
  conversaoAlimentar: number;
}

export default function FazendaDashboard() {
  const { organization } = useAuth();
  const [data, setData] = useState<DashboardData>({
    totalLotes: 0,
    totalAnimais: 0,
    vacinacoesVencendo: 0,
    eventosRecentes: 0,
    loteMaisProblemas: 'Nenhum',
    conversaoAlimentar: 2.5,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [organization?.id]);

  const fetchDashboardData = async () => {
    if (!organization?.id) return;

    try {
      const [lotesRes, animaisRes, vacinacoesRes, eventosRes] = await Promise.all([
        supabase.from('lotes').select('id').eq('org_id', organization.id),
        supabase.from('animais').select('id').eq('org_id', organization.id),
        supabase.from('vacinacoes').select('id, reforco_previsto').eq('org_id', organization.id),
        supabase.from('eventos_zootecnicos').select('id').eq('org_id', organization.id),
      ]);

      // Calcular vacinas vencendo (próximos 30 dias)
      const hoje = new Date();
      const em30Dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);
      const vacinacoesVencendo = vacinacoesRes.data?.filter(vacina => {
        if (!vacina.reforco_previsto) return false;
        const dataReforco = new Date(vacina.reforco_previsto);
        return dataReforco >= hoje && dataReforco <= em30Dias;
      }).length || 0;

      setData({
        totalLotes: lotesRes.data?.length || 0,
        totalAnimais: animaisRes.data?.length || 0,
        vacinacoesVencendo,
        eventosRecentes: eventosRes.data?.length || 0,
        loteMaisProblemas: 'Lote A1',
        conversaoAlimentar: 2.3,
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
        <h1 className="text-3xl font-bold">Dashboard Fazenda</h1>
        <p className="text-muted-foreground">
          Visão geral da produção e manejo da {organization?.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Lotes</CardTitle>
            <Wheat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalLotes}</div>
            <p className="text-xs text-muted-foreground">
              Lotes ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Animais</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalAnimais}</div>
            <p className="text-xs text-muted-foreground">
              Rebanho total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vacinas Vencendo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{data.vacinacoesVencendo}</div>
            <p className="text-xs text-muted-foreground">
              Próximos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Recentes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.eventosRecentes}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 7 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversão Alimentar</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.conversaoAlimentar}</div>
            <p className="text-xs text-muted-foreground">
              kg ração/kg ganho
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mortalidade</CardTitle>
            <Calendar className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.1%</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Alertas Importantes</CardTitle>
            <CardDescription>Situações que requerem atenção</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.vacinacoesVencendo > 0 && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Vacinas Vencendo</p>
                    <p className="text-sm text-muted-foreground">
                      {data.vacinacoesVencendo} animais precisam de reforço
                    </p>
                  </div>
                </div>
                <Badge variant="outline">Urgente</Badge>
              </div>
            )}
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Estoque Baixo</p>
                  <p className="text-sm text-muted-foreground">
                    Ração para suínos acabando em 5 dias
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Atenção</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eventos Recentes</CardTitle>
            <CardDescription>Últimas atividades registradas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Parto - Lote B2</p>
                <p className="text-sm text-muted-foreground">Vaca #124 - 2 bezerros</p>
              </div>
              <Badge>Hoje</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Vacinação - Lote A1</p>
                <p className="text-sm text-muted-foreground">50 suínos vacinados</p>
              </div>
              <Badge variant="secondary">Ontem</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Inseminação - Lote C1</p>
                <p className="text-sm text-muted-foreground">15 matrizes inseminadas</p>
              </div>
              <Badge variant="outline">2 dias</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance por Lote</CardTitle>
          <CardDescription>Indicadores de desempenho dos lotes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Lote A1 - Suínos</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Animais:</span>
                  <span className="font-medium">150</span>
                </div>
                <div className="flex justify-between">
                  <span>Conversão:</span>
                  <span className="font-medium text-green-600">2.1</span>
                </div>
                <div className="flex justify-between">
                  <span>Mortalidade:</span>
                  <span className="font-medium">1.2%</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Lote B2 - Bovinos</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Animais:</span>
                  <span className="font-medium">80</span>
                </div>
                <div className="flex justify-between">
                  <span>Peso médio:</span>
                  <span className="font-medium">450kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Nascimentos:</span>
                  <span className="font-medium text-green-600">8 este mês</span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Lote C1 - Aves</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Animais:</span>
                  <span className="font-medium">5,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Produção ovos:</span>
                  <span className="font-medium">89%</span>
                </div>
                <div className="flex justify-between">
                  <span>Conversão:</span>
                  <span className="font-medium text-green-600">1.8</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}