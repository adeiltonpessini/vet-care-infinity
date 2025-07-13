import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function NovoEvento() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [animals, setAnimals] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    animal_id: '',
    tipo_evento: '' as 'parto' | 'inseminacao' | 'doenca' | 'morte' | 'vacinacao' | 'tratamento' | '',
    data_evento: '',
    observacoes: '',
    dados_json: {}
  });

  const tiposEvento = [
    { value: 'parto', label: 'Parto' },
    { value: 'inseminacao', label: 'Inseminação' },
    { value: 'doenca', label: 'Doença' },
    { value: 'morte', label: 'Morte' },
    { value: 'vacinacao', label: 'Vacinação' },
    { value: 'tratamento', label: 'Tratamento' }
  ];

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
      if (!formData.tipo_evento || !formData.data_evento) {
        throw new Error('Tipo de evento e data são obrigatórios');
      }

      const eventoData = {
        animal_id: formData.animal_id || null,
        tipo_evento: formData.tipo_evento as 'parto' | 'inseminacao' | 'doenca' | 'morte' | 'vacinacao' | 'tratamento',
        data_evento: formData.data_evento,
        observacoes: formData.observacoes || null,
        org_id: userProfile?.org_id,
        dados_json: formData.dados_json || {}
      };

      const { error } = await supabase
        .from('eventos_zootecnicos')
        .insert([eventoData]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Evento registrado com sucesso!",
      });

      navigate('/fazenda/eventos');
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar o evento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/fazenda/eventos')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            Novo Evento Zootécnico
          </h1>
          <p className="text-muted-foreground">
            Registre um novo evento zootécnico
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Evento</CardTitle>
          <CardDescription>
            Preencha as informações do evento zootécnico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Animal
                </label>
                <Select 
                  value={formData.animal_id} 
                  onValueChange={(value) => setFormData({...formData, animal_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o animal (opcional)" />
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
                  Tipo de Evento *
                </label>
                <Select 
                  value={formData.tipo_evento} 
                  onValueChange={(value) => setFormData({...formData, tipo_evento: value as 'parto' | 'inseminacao' | 'doenca' | 'morte' | 'vacinacao' | 'tratamento'})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposEvento.map(tipo => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Data do Evento *
                </label>
                <Input
                  type="date"
                  value={formData.data_evento}
                  onChange={(e) => setFormData({...formData, data_evento: e.target.value})}
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
                placeholder="Observações sobre o evento"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/fazenda/eventos')}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Registrar Evento'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}