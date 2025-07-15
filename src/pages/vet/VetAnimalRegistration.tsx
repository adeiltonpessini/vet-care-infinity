import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PawPrint, Plus, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Tutor {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
}

export default function VetAnimalRegistration() {
  const { organization } = useAuth();
  const navigate = useNavigate();
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [isNewTutorDialogOpen, setIsNewTutorDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [animalData, setAnimalData] = useState({
    nome: '',
    especie: '',
    raca: '',
    data_nascimento: '',
    peso: '',
    foto_url: '',
    tutor_id: '',
    observacoes: ''
  });

  const [tutorData, setTutorData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    observacoes: ''
  });

  useEffect(() => {
    loadTutores();
  }, []);

  const loadTutores = async () => {
    try {
      const { data, error } = await supabase
        .from('tutores')
        .select('id, nome, telefone, email')
        .order('nome');

      if (error) throw error;
      setTutores(data || []);
    } catch (error) {
      console.error('Erro ao carregar tutores:', error);
    }
  };

  const handleAnimalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const animalInsertData = {
        nome: animalData.nome,
        especie: animalData.especie as any,
        raca: animalData.raca || null,
        data_nascimento: animalData.data_nascimento || null,
        peso: animalData.peso ? parseFloat(animalData.peso) : null,
        foto_url: animalData.foto_url || null,
        tutor_id: animalData.tutor_id || null,
        observacoes: animalData.observacoes || null,
        org_id: organization?.id
      };

      const { error } = await supabase
        .from('animais')
        .insert([animalInsertData]);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Animal cadastrado com sucesso!",
      });

      // Reset form
      setAnimalData({
        nome: '',
        especie: '',
        raca: '',
        data_nascimento: '',
        peso: '',
        foto_url: '',
        tutor_id: '',
        observacoes: ''
      });

      // Redirect to animals list
      navigate('/vet/animals');
    } catch (error) {
      console.error('Erro ao cadastrar animal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o animal.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const tutorInsertData = {
        ...tutorData,
        org_id: organization?.id
      };

      const { data, error } = await supabase
        .from('tutores')
        .insert([tutorInsertData])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Tutor cadastrado com sucesso!",
      });

      // Add new tutor to list and select it
      setTutores([...tutores, data]);
      setAnimalData({...animalData, tutor_id: data.id});
      
      // Reset tutor form
      setTutorData({
        nome: '',
        cpf: '',
        telefone: '',
        email: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        observacoes: ''
      });
      
      setIsNewTutorDialogOpen(false);
    } catch (error) {
      console.error('Erro ao cadastrar tutor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o tutor.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <PawPrint className="h-8 w-8" />
          Cadastro de Animal - Veterinário
        </h1>
        <p className="text-muted-foreground">Cadastre um novo animal e seus dados completos</p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Dados do Animal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnimalSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome do Animal *</Label>
                <Input
                  id="nome"
                  value={animalData.nome}
                  onChange={(e) => setAnimalData({...animalData, nome: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="especie">Espécie *</Label>
                <Select value={animalData.especie} onValueChange={(value) => setAnimalData({...animalData, especie: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a espécie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="canino">Canino</SelectItem>
                    <SelectItem value="felino">Felino</SelectItem>
                    <SelectItem value="bovino">Bovino</SelectItem>
                    <SelectItem value="suino">Suíno</SelectItem>
                    <SelectItem value="equino">Equino</SelectItem>
                    <SelectItem value="ovino">Ovino</SelectItem>
                    <SelectItem value="caprino">Caprino</SelectItem>
                    <SelectItem value="ave">Ave</SelectItem>
                    <SelectItem value="peixe">Peixe</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="raca">Raça</Label>
                <Input
                  id="raca"
                  value={animalData.raca}
                  onChange={(e) => setAnimalData({...animalData, raca: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  value={animalData.data_nascimento}
                  onChange={(e) => setAnimalData({...animalData, data_nascimento: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.01"
                  value={animalData.peso}
                  onChange={(e) => setAnimalData({...animalData, peso: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="foto_url">URL da Foto</Label>
                <Input
                  id="foto_url"
                  value={animalData.foto_url}
                  onChange={(e) => setAnimalData({...animalData, foto_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Seleção do Tutor */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <Label>Tutor do Animal</Label>
                <Dialog open={isNewTutorDialogOpen} onOpenChange={setIsNewTutorDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Tutor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Cadastrar Novo Tutor</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleTutorSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="tutor_nome">Nome *</Label>
                          <Input
                            id="tutor_nome"
                            value={tutorData.nome}
                            onChange={(e) => setTutorData({...tutorData, nome: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="tutor_cpf">CPF</Label>
                          <Input
                            id="tutor_cpf"
                            value={tutorData.cpf}
                            onChange={(e) => setTutorData({...tutorData, cpf: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="tutor_telefone">Telefone</Label>
                          <Input
                            id="tutor_telefone"
                            value={tutorData.telefone}
                            onChange={(e) => setTutorData({...tutorData, telefone: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="tutor_email">E-mail</Label>
                          <Input
                            id="tutor_email"
                            type="email"
                            value={tutorData.email}
                            onChange={(e) => setTutorData({...tutorData, email: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="tutor_endereco">Endereço</Label>
                        <Input
                          id="tutor_endereco"
                          value={tutorData.endereco}
                          onChange={(e) => setTutorData({...tutorData, endereco: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="tutor_cidade">Cidade</Label>
                          <Input
                            id="tutor_cidade"
                            value={tutorData.cidade}
                            onChange={(e) => setTutorData({...tutorData, cidade: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="tutor_estado">Estado</Label>
                          <Input
                            id="tutor_estado"
                            value={tutorData.estado}
                            onChange={(e) => setTutorData({...tutorData, estado: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="tutor_cep">CEP</Label>
                          <Input
                            id="tutor_cep"
                            value={tutorData.cep}
                            onChange={(e) => setTutorData({...tutorData, cep: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsNewTutorDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">
                          Cadastrar Tutor
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <Select value={animalData.tutor_id} onValueChange={(value) => setAnimalData({...animalData, tutor_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tutor" />
                </SelectTrigger>
                <SelectContent>
                  {tutores.map(tutor => (
                    <SelectItem key={tutor.id} value={tutor.id}>
                      {tutor.nome} {tutor.telefone && `- ${tutor.telefone}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={animalData.observacoes}
                onChange={(e) => setAnimalData({...animalData, observacoes: e.target.value})}
                rows={4}
                placeholder="Informações médicas, comportamentais ou outras observações relevantes..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/vet/animals')}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Cadastrando...' : 'Cadastrar Animal'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}