import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  TrendingUp, 
  Plus, 
  Search,
  BarChart3,
  Calendar,
  Package
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DesempenhoAlimento {
  id: string;
  animal_id: string;
  produto_id: string;
  data_inicio: string;
  data_fim: string | null;
  peso_inicial: number;
  peso_atual: number;
  ganho_peso_dia: number;
  consumo_racao_kg: number;
  conversao_alimentar: number;
  periodo_dias: number;
  observacoes: string | null;
  animais: {
    nome: string;
    especie: string;
  };
  produtos: {
    nome: string;
    tipo: string;
  };
}

export default function FazendaDesempenho() {
  const { userProfile } = useAuth();
  const [desempenhos, setDesempenhos] = useState<DesempenhoAlimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDesempenhos();
  }, [userProfile?.org_id]);

  const fetchDesempenhos = async () => {
    if (!userProfile?.org_id) return;

    try {
      const { data, error } = await supabase
        .from('desempenho_alimentos')
        .select(`
          *,
          animais(nome, especie),
          produtos(nome, tipo)
        `)
        .eq('fazenda_id', userProfile.org_id)
        .order('data_inicio', { ascending: false });

      if (error) {
        console.error('Error fetching performance data:', error);
        return;
      }

      setDesempenhos(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDesempenhos = desempenhos.filter(desempenho =>
    desempenho.animais?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    desempenho.produtos?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getConversaoColor = (conversao: number) => {
    if (conversao <= 2.5) return 'text-green-600';
    if (conversao <= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGanhoPesoColor = (ganho: number) => {
    if (ganho >= 0.8) return 'text-green-600';
    if (ganho >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calcularEstatisticas = () => {
    if (desempenhos.length === 0) return {
      ganhoMedio: 0,
      conversaoMedia: 0,
      ativo: 0,
      concluido: 0
    };

    const ativo = desempenhos.filter(d => !d.data_fim).length;
    const concluido = desempenhos.filter(d => d.data_fim).length;
    const ganhoMedio = desempenhos.reduce((acc, d) => acc + d.ganho_peso_dia, 0) / desempenhos.length;
    const conversaoMedia = desempenhos.reduce((acc, d) => acc + d.conversao_alimentar, 0) / desempenhos.length;

    return {
      ganhoMedio: Number(ganhoMedio.toFixed(2)),
      conversaoMedia: Number(conversaoMedia.toFixed(2)),
      ativo,
      concluido
    };
  };

  const stats = calcularEstatisticas();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Carregando dados de desempenho...</h2>
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
            <TrendingUp className="h-8 w-8 text-primary" />
            Desempenho de Alimentos
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitore o ganho de peso e conversão alimentar dos animais
          </p>
        </div>
        <Button asChild>
          <Link to="/fazenda/desempenho/new">
            <Plus className="h-4 w-4 mr-2" />
            Novo Teste
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ganho Médio/Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getGanhoPesoColor(stats.ganhoMedio)}`}>
              {stats.ganhoMedio} kg
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversão Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getConversaoColor(stats.conversaoMedia)}`}>
              {stats.conversaoMedia}:1
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Testes Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.ativo}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Testes Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.concluido}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por animal ou produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDesempenhos.map((desempenho) => (
          <Card key={desempenho.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{desempenho.animais?.nome}</CardTitle>
                  <CardDescription>
                    Produto: {desempenho.produtos?.nome}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge variant={desempenho.data_fim ? "secondary" : "default"}>
                    {desempenho.data_fim ? "Concluído" : "Em andamento"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className={`text-xl font-bold ${getGanhoPesoColor(desempenho.ganho_peso_dia)}`}>
                      {desempenho.ganho_peso_dia} kg
                    </div>
                    <div className="text-xs text-muted-foreground">Ganho/dia</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className={`text-xl font-bold ${getConversaoColor(desempenho.conversao_alimentar)}`}>
                      {desempenho.conversao_alimentar}:1
                    </div>
                    <div className="text-xs text-muted-foreground">Conversão</div>
                  </div>
                </div>

                {/* Weight Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Peso inicial: {desempenho.peso_inicial} kg</span>
                    <span>Peso atual: {desempenho.peso_atual} kg</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((desempenho.peso_atual / (desempenho.peso_inicial * 1.5)) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    Ganho total: {(desempenho.peso_atual - desempenho.peso_inicial).toFixed(1)} kg em {desempenho.periodo_dias} dias
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Início:</span>
                    <p className="font-medium">
                      {new Date(desempenho.data_inicio).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Consumo total:</span>
                    <p className="font-medium">{desempenho.consumo_racao_kg} kg</p>
                  </div>
                </div>

                {desempenho.observacoes && (
                  <div>
                    <span className="text-muted-foreground text-sm">Observações:</span>
                    <p className="text-sm mt-1">{desempenho.observacoes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Ver Detalhes
                  </Button>
                  {!desempenho.data_fim && (
                    <Button size="sm" variant="outline">
                      <Package className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDesempenhos.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Nenhum teste de desempenho encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Tente buscar com outros termos' : 'Inicie o primeiro teste de desempenho'}
            </p>
            <Button asChild>
              <Link to="/fazenda/desempenho/new">
                <Plus className="h-4 w-4 mr-2" />
                Novo Teste
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}