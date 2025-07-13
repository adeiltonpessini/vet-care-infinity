import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Syringe, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function NovaVacinacao() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [animals, setAnimals] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    animal_id: '',
    vacina: '',
    data_aplicacao: '',
    reforco_previsto: '',
    observacoes: ''
  });

  useEffect(() => {
    fetchAnimals();
  }, [userProfile?.org_id]);

  const fetchAnimals = async () => {
    if (!userProfile?.org_id) return;

    try {
      const { data, error } = await supabase
        .from('animais')
        .select('id, nome, especie')
        .eq('org_id', userProfile.org_id)
        .order('nome');

      if (error) throw error;
      setAnimals(data || []);
    } catch (error) {
      console.error('Error fetching animals:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const vacinacaoData = {
        ...formData,
        org_id: userProfile?.org_id,
        veterinario_id: userProfile?.id
      };

      const { error } = await supabase
        .from('vacinacoes')
        .insert([vacinacaoData]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Vacinação registrada com sucesso!",
      });

      navigate('/fazenda/vacinacao');
    } catch (error) {
      console.error('Error saving vaccination:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a vacinação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/fazenda/vacinacao')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Syringe className="h-8 w-8 text-primary" />
            Nova Vacinação
          </h1>
          <p className="text-muted-foreground">
            Registre uma nova vacinação para os animais
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Vacinação</CardTitle>
          <CardDescription>
            Preencha as informações da vacinação aplicada
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
                  onValueChange={(value) => setFormData({...formData, animal_id: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o animal" />
                  </SelectTrigger>
                  <SelectContent>
                    {animals.map(animal => (
                      <SelectItem key={animal.id} value={animal.id}>
                        {animal.nome} ({animal.especie})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Vacina *
                </label>
                <Input
                  value={formData.vacina}
                  onChange={(e) => setFormData({...formData, vacina: e.target.value})}
                  placeholder="Nome da vacina"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Data de Aplicação *
                </label>
                <Input
                  type="date"
                  value={formData.data_aplicacao}
                  onChange={(e) => setFormData({...formData, data_aplicacao: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Reforço Previsto
                </label>
                <Input
                  type="date"
                  value={formData.reforco_previsto}
                  onChange={(e) => setFormData({...formData, reforco_previsto: e.target.value})}
                  placeholder="Data do próximo reforço"
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
                placeholder="Observações sobre a vacinação"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/fazenda/vacinacao')}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Registrar Vacinação'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}