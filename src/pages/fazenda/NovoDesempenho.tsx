import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TrendingUp, ArrowLeft, Calculator, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function NovoDesempenho() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [animals, setAnimals] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    animal_id: '',
    produto_id: '',
    peso_inicial: '',
    peso_atual: '',
    consumo_racao_kg: '',
    data_inicio: '',
    periodo_dias: '',
    observacoes: ''
  });

  const [calculatedData, setCalculatedData] = useState({
    ganho_peso_dia: 0,
    conversao_alimentar: 0
  });

  useEffect(() => {
    fetchAnimals();
    fetchProdutos();
  }, [userProfile?.org_id]);

  useEffect(() => {
    calculatePerformance();
  }, [formData.peso_inicial, formData.peso_atual, formData.consumo_racao_kg, formData.periodo_dias]);

  const fetchAnimals = async () => {
    if (!userProfile?.org_id) return;

    try {
      const { data, error } = await supabase
        .from('animais')
        .select('id, nome, especie, peso')
        .eq('org_id', userProfile.org_id)
        .order('nome');

      if (error) throw error;
      setAnimals(data || []);
    } catch (error) {
      console.error('Error fetching animals:', error);
    }
  };

  const fetchProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('id, nome, tipo')
        .eq('tipo', 'racao')
        .order('nome');

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const calculatePerformance = () => {
    const pesoInicial = parseFloat(formData.peso_inicial);
    const pesoAtual = parseFloat(formData.peso_atual);
    const consumo = parseFloat(formData.consumo_racao_kg);
    const periodo = parseInt(formData.periodo_dias);

    if (pesoInicial && pesoAtual && consumo && periodo) {
      const ganhoPeso = pesoAtual - pesoInicial;
      const ganhoPesoDia = ganhoPeso / periodo;
      const conversaoAlimentar = consumo / ganhoPeso;

      setCalculatedData({
        ganho_peso_dia: Number(ganhoPesoDia.toFixed(3)),
        conversao_alimentar: Number(conversaoAlimentar.toFixed(2))
      });
    } else {
      setCalculatedData({
        ganho_peso_dia: 0,
        conversao_alimentar: 0
      });
    }
  };

  const handleAnimalSelect = (animalId: string) => {
    const animal = animals.find(a => a.id === animalId);
    if (animal && animal.peso) {
      setFormData(prev => ({
        ...prev,
        animal_id: animalId,
        peso_inicial: animal.peso.toString()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        animal_id: animalId
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const desempenhoData = {
        ...formData,
        fazenda_id: userProfile?.org_id,
        peso_inicial: parseFloat(formData.peso_inicial),
        peso_atual: parseFloat(formData.peso_atual),
        consumo_racao_kg: parseFloat(formData.consumo_racao_kg),
        periodo_dias: parseInt(formData.periodo_dias),
        ganho_peso_dia: calculatedData.ganho_peso_dia,
        conversao_alimentar: calculatedData.conversao_alimentar
      };

      const { error } = await supabase
        .from('desempenho_alimentos')
        .insert([desempenhoData]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Teste de desempenho registrado com sucesso!",
      });

      navigate('/fazenda/desempenho');
    } catch (error) {
      console.error('Error saving performance test:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar o teste de desempenho.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getConversaoStatus = (conversao: number) => {
    if (conversao === 0) return { color: 'text-muted-foreground', text: 'Não calculado' };
    if (conversao <= 2.5) return { color: 'text-green-600', text: 'Excelente' };
    if (conversao <= 3.5) return { color: 'text-yellow-600', text: 'Bom' };
    return { color: 'text-red-600', text: 'Pode melhorar' };
  };

  const getGanhoStatus = (ganho: number) => {
    if (ganho === 0) return { color: 'text-muted-foreground', text: 'Não calculado' };
    if (ganho >= 0.8) return { color: 'text-green-600', text: 'Excelente' };
    if (ganho >= 0.5) return { color: 'text-yellow-600', text: 'Bom' };
    return { color: 'text-red-600', text: 'Baixo' };
  };

  const conversaoStatus = getConversaoStatus(calculatedData.conversao_alimentar);
  const ganhoStatus = getGanhoStatus(calculatedData.ganho_peso_dia);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/fazenda/desempenho')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            Novo Teste de Desempenho
          </h1>
          <p className="text-muted-foreground">
            Registre o desempenho de um animal com determinado alimento
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Teste</CardTitle>
              <CardDescription>
                Preencha as informações do teste de desempenho
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Animal *
                    </label>
                    <Select 
                      value={formData.animal_id} 
                      onValueChange={handleAnimalSelect}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o animal" />
                      </SelectTrigger>
                      <SelectContent>
                        {animals.map(animal => (
                          <SelectItem key={animal.id} value={animal.id}>
                            {animal.nome} ({animal.especie}) {animal.peso && `- ${animal.peso}kg`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Produto/Ração *
                    </label>
                    <Select 
                      value={formData.produto_id} 
                      onValueChange={(value) => setFormData({...formData, produto_id: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {produtos.map(produto => (
                          <SelectItem key={produto.id} value={produto.id}>
                            {produto.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Peso Inicial (kg) *
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.peso_inicial}
                      onChange={(e) => setFormData({...formData, peso_inicial: e.target.value})}
                      placeholder="Ex: 250.5"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Peso Atual (kg) *
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.peso_atual}
                      onChange={(e) => setFormData({...formData, peso_atual: e.target.value})}
                      placeholder="Ex: 280.2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Data de Início *
                    </label>
                    <Input
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Período (dias) *
                    </label>
                    <Input
                      type="number"
                      value={formData.periodo_dias}
                      onChange={(e) => setFormData({...formData, periodo_dias: e.target.value})}
                      placeholder="Ex: 60"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Consumo Total de Ração (kg) *
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.consumo_racao_kg}
                      onChange={(e) => setFormData({...formData, consumo_racao_kg: e.target.value})}
                      placeholder="Ex: 180.5"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Observações
                  </label>
                  <Textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    placeholder="Observações sobre o teste de desempenho"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => navigate('/fazenda/desempenho')}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : 'Registrar Teste'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Calculations */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Cálculos Automáticos
              </CardTitle>
              <CardDescription>
                Resultados baseados nos dados informados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${ganhoStatus.color}`}>
                    {calculatedData.ganho_peso_dia} kg
                  </div>
                  <div className="text-sm text-muted-foreground">Ganho de peso/dia</div>
                  <div className={`text-xs font-medium ${ganhoStatus.color}`}>
                    {ganhoStatus.text}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${conversaoStatus.color}`}>
                    {calculatedData.conversao_alimentar > 0 ? `${calculatedData.conversao_alimentar}:1` : '0:1'}
                  </div>
                  <div className="text-sm text-muted-foreground">Conversão alimentar</div>
                  <div className={`text-xs font-medium ${conversaoStatus.color}`}>
                    {conversaoStatus.text}
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Conversão alimentar:</strong> quantidade de ração (kg) necessária para ganhar 1kg de peso. Quanto menor, melhor.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}