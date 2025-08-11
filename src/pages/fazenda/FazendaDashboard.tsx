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

interface RecentEvent {
  id: string;
  tipo_evento: string;
  data_evento: string;
  animal_id: string | null;
}

interface StockAlert {
  id: string;
  nome: string;
  tipo: string;
  quantidade: number;
  validade: string | null;
  motivo: 'quantidade_baixa' | 'validade_proxima';
}

interface PerformanceLot {
  lote_id: string;
  lote_nome: string;
  media_conversao: number;
  media_ganho: number;
  total_tests: number;
}

export default function FazendaDashboard() {
  const { organization } = useAuth();
  const [data, setData] = useState<DashboardData>({
    totalLotes: 0,
    totalAnimais: 0,
    vacinacoesVencendo: 0,
    eventosRecentes: 0,
    loteMaisProblemas: 'Nenhum',
    conversaoAlimentar: 0,
  });
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [perfByLot, setPerfByLot] = useState<PerformanceLot[]>([]);
  const [loading, setLoading] = useState(true);

  // SEO: title, description, canonical
  useEffect(() => {
    document.title = 'Dashboard da Fazenda - InfinityVet';
    const metaDescId = 'meta-desc-fazenda-dashboard';
    let meta = document.querySelector(`meta[name="description"]#${metaDescId}`) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      meta.id = metaDescId;
      document.head.appendChild(meta);
    }
    meta.content = 'Dashboard da fazenda: lotes, animais, vacinas e eventos em tempo real.';

    const linkId = 'canonical-fazenda-dashboard';
    let link = document.querySelector(`link[rel="canonical"]#${linkId}`) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      link.id = linkId;
      document.head.appendChild(link);
    }
    link.href = window.location.origin + '/fazenda';
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [organization?.id]);

  // Realtime refresh on changes
  useEffect(() => {
    if (!organization?.id) return;
    const channel = supabase
      .channel('fazenda-dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lotes' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'animais' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vacinacoes' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eventos_zootecnicos' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estoque' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'desempenho_alimentos' }, fetchDashboardData)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [organization?.id]);

const fetchDashboardData = async () => {
    if (!organization?.id) return;

    setLoading(true);
    try {
      const hoje = new Date();
      const seteDiasAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
      const em30Dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);

      const [lotesRes, animaisRes, vacinacoesRes, eventosRes, estoqueRes, desempenhoRes, lotesInfoRes] = await Promise.all([
        supabase.from('lotes').select('id').eq('org_id', organization.id),
        supabase.from('animais').select('id').eq('org_id', organization.id),
        supabase.from('vacinacoes').select('id, reforco_previsto').eq('org_id', organization.id),
        supabase
          .from('eventos_zootecnicos')
          .select('id, tipo_evento, data_evento, animal_id')
          .eq('org_id', organization.id)
          .gte('data_evento', seteDiasAtras.toISOString())
          .order('data_evento', { ascending: false }),
        supabase.from('estoque').select('id, nome, tipo, quantidade, alerta_minimo, validade').eq('org_id', organization.id),
        supabase.from('desempenho_alimentos').select('id, lote_id, conversao_alimentar, ganho_peso_dia, data_fim, fazenda_id').eq('fazenda_id', organization.id),
        supabase.from('lotes').select('id, nome').eq('org_id', organization.id),
      ]);

      // Vacinas com reforço nos próximos 30 dias
      const vacinacoesVencendo = (vacinacoesRes.data || []).filter((vacina: any) => {
        if (!vacina.reforco_previsto) return false;
        const dataReforco = new Date(vacina.reforco_previsto);
        return dataReforco >= hoje && dataReforco <= em30Dias;
      }).length;

      // Eventos recentes (últimos 7 dias)
      const eventos = (eventosRes.data || []) as RecentEvent[];
      setRecentEvents(eventos.slice(0, 5));

      // Alertas de estoque
      const alerts: StockAlert[] = [];
      (estoqueRes.data || []).forEach((item: any) => {
        if (item.alerta_minimo != null && Number(item.quantidade) <= Number(item.alerta_minimo)) {
          alerts.push({ id: item.id, nome: item.nome, tipo: item.tipo, quantidade: Number(item.quantidade), validade: item.validade, motivo: 'quantidade_baixa' });
        }
        if (item.validade) {
          const dv = new Date(item.validade);
          if (dv <= em30Dias && dv >= hoje) {
            alerts.push({ id: item.id, nome: item.nome, tipo: item.tipo, quantidade: Number(item.quantidade), validade: item.validade, motivo: 'validade_proxima' });
          }
        }
      });
      setStockAlerts(alerts);

      // Performance por lote (média)
      const lotesMap = new Map<string, string>();
      (lotesInfoRes.data || []).forEach((l: any) => lotesMap.set(l.id, l.nome));

      const perfMap = new Map<string, { somaConv: number; somaGanho: number; count: number }>();
      (desempenhoRes.data || []).forEach((d: any) => {
        if (!d.lote_id) return;
        const key = d.lote_id as string;
        const acc = perfMap.get(key) || { somaConv: 0, somaGanho: 0, count: 0 };
        if (d.conversao_alimentar != null) acc.somaConv += Number(d.conversao_alimentar);
        if (d.ganho_peso_dia != null) acc.somaGanho += Number(d.ganho_peso_dia);
        acc.count += 1;
        perfMap.set(key, acc);
      });
      const perfArray: PerformanceLot[] = Array.from(perfMap.entries())
        .map(([lote_id, v]) => ({
          lote_id,
          lote_nome: lotesMap.get(lote_id) || 'Lote',
          media_conversao: v.count ? Number((v.somaConv / v.count).toFixed(2)) : 0,
          media_ganho: v.count ? Number((v.somaGanho / v.count).toFixed(2)) : 0,
          total_tests: v.count,
        }))
        .sort((a, b) => a.media_conversao - b.media_conversao)
        .slice(0, 3);
      setPerfByLot(perfArray);

      const mediaConversaoGeral = perfArray.length
        ? Number((perfArray.reduce((acc, cur) => acc + cur.media_conversao, 0) / perfArray.length).toFixed(2))
        : 0;

      setData({
        totalLotes: lotesRes.data?.length || 0,
        totalAnimais: animaisRes.data?.length || 0,
        vacinacoesVencendo,
        eventosRecentes: eventos.length,
        loteMaisProblemas: perfArray[0]?.lote_nome || 'Nenhum',
        conversaoAlimentar: mediaConversaoGeral,
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (s: string | null) => {
    if (!s) return '-';
    const d = new Date(s);
    return d.toLocaleDateString();
  };

  const getRelativeLabel = (s: string) => {
    const d = new Date(s);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    return `${diffDays}d`;
  };

  if (loading) {
    return <div className="p-8">Carregando dashboard...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard da Fazenda</h1>
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
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{data.vacinacoesVencendo}</div>
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
            <TrendingUp className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.conversaoAlimentar}</div>
            <p className="text-xs text-muted-foreground">
              kg ração/kg ganho
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mortalidade</CardTitle>
            <Calendar className="h-4 w-4 text-destructive" />
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
            {data.vacinacoesVencendo === 0 && stockAlerts.length === 0 ? (
              <div className="text-sm text-muted-foreground">Sem alertas no momento.</div>
            ) : (
              <>
                {data.vacinacoesVencendo > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      <div>
                        <p className="font-medium">Vacinas com reforço em 30 dias</p>
                        <p className="text-sm text-muted-foreground">
                          {data.vacinacoesVencendo} animais precisam de atenção
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Vacinação</Badge>
                  </div>
                )}

                {stockAlerts.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-card border">
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-warning" />
                      <div>
                        <p className="font-medium">{item.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.motivo === 'quantidade_baixa'
                            ? `Quantidade baixa (${item.quantidade})`
                            : `Validade próxima (${formatDate(item.validade)})`}
                        </p>
                      </div>
                    </div>
                    <Badge variant={item.motivo === 'quantidade_baixa' ? 'outline' : 'secondary'}>
                      {item.motivo === 'quantidade_baixa' ? 'Estoque' : 'Validade'}
                    </Badge>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eventos Recentes</CardTitle>
            <CardDescription>Últimas atividades registradas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentEvents.length === 0 ? (
              <div className="text-sm text-muted-foreground">Sem eventos nos últimos 7 dias.</div>
            ) : (
              recentEvents.slice(0, 5).map((ev) => (
                <div key={ev.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{ev.tipo_evento}</p>
                    <p className="text-sm text-muted-foreground">{new Date(ev.data_evento).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="secondary">{getRelativeLabel(ev.data_evento)}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance por Lote</CardTitle>
          <CardDescription>Indicadores de desempenho dos lotes</CardDescription>
        </CardHeader>
        <CardContent>
          {perfByLot.length === 0 ? (
            <div className="text-sm text-muted-foreground">Sem dados de desempenho ainda.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {perfByLot.map((lote) => (
                <div key={lote.lote_id} className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">{lote.lote_nome}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Testes:</span>
                      <span className="font-medium">{lote.total_tests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conversão:</span>
                      <span className="font-medium">{lote.media_conversao}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ganho diário:</span>
                      <span className="font-medium">{lote.media_ganho} kg/d</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}