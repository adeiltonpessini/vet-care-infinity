import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { PawPrint, Plus, Search, Eye, Edit, Trash2, QrCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { toast } from '@/hooks/use-toast';

interface Animal {
  id: string;
  nome: string;
  especie: string;
  raca?: string;
  data_nascimento?: string;
  peso?: number;
  nome_tutor?: string;
  cpf_tutor?: string;
  observacoes?: string;
  foto_url?: string;
  qr_code_url?: string;
  created_at: string;
}

export default function VetAnimals() {
  const { userProfile, organization } = useAuth();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    especie: '',
    raca: '',
    data_nascimento: '',
    peso: '',
    nome_tutor: '',
    cpf_tutor: '',
    observacoes: ''
  });

  const especies = [
    'canino', 'felino', 'bovino', 'suino', 'equino', 'ovino', 'caprino', 'aves', 'outros'
  ];

  useEffect(() => {
    loadAnimals();
  }, []);

  const loadAnimals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('animais')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnimals(data || []);
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os animais.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      especie: '',
      raca: '',
      data_nascimento: '',
      peso: '',
      nome_tutor: '',
      cpf_tutor: '',
      observacoes: ''
    });
    setEditingAnimal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const animalData = {
        nome: formData.nome,
        especie: formData.especie as any,
        raca: formData.raca || null,
        data_nascimento: formData.data_nascimento || null,
        peso: formData.peso ? Number(formData.peso) : null,
        nome_tutor: formData.nome_tutor || null,
        cpf_tutor: formData.cpf_tutor || null,
        observacoes: formData.observacoes || null,
        org_id: organization?.id
      };

      if (editingAnimal) {
        const { error } = await supabase
          .from('animais')
          .update(animalData)
          .eq('id', editingAnimal.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Animal atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('animais')
          .insert([animalData]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Animal cadastrado com sucesso!",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadAnimals();
    } catch (error) {
      console.error('Erro ao salvar animal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o animal.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (animal: Animal) => {
    setEditingAnimal(animal);
    setFormData({
      nome: animal.nome,
      especie: animal.especie,
      raca: animal.raca || '',
      data_nascimento: animal.data_nascimento || '',
      peso: animal.peso?.toString() || '',
      nome_tutor: animal.nome_tutor || '',
      cpf_tutor: animal.cpf_tutor || '',
      observacoes: animal.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este animal?')) return;

    try {
      const { error } = await supabase
        .from('animais')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Animal excluído com sucesso!",
      });
      loadAnimals();
    } catch (error) {
      console.error('Erro ao excluir animal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o animal.",
        variant: "destructive",
      });
    }
  };

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.nome_tutor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.cpf_tutor?.includes(searchTerm);
    const matchesSpecies = !speciesFilter || animal.especie === speciesFilter;
    return matchesSearch && matchesSpecies;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <PawPrint className="h-8 w-8" />
          Animais da Clínica
        </h1>
        <p className="text-muted-foreground">Gerencie os animais cadastrados na clínica</p>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Buscar Animais</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Animal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingAnimal ? 'Editar Animal' : 'Novo Animal'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="especie">Espécie *</Label>
                      <Select value={formData.especie} onValueChange={(value) => setFormData({...formData, especie: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a espécie" />
                        </SelectTrigger>
                        <SelectContent>
                          {especies.map(especie => (
                            <SelectItem key={especie} value={especie}>
                              {especie.charAt(0).toUpperCase() + especie.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="raca">Raça</Label>
                      <Input
                        id="raca"
                        value={formData.raca}
                        onChange={(e) => setFormData({...formData, raca: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                      <Input
                        id="data_nascimento"
                        type="date"
                        value={formData.data_nascimento}
                        onChange={(e) => setFormData({...formData, data_nascimento: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="peso">Peso (kg)</Label>
                      <Input
                        id="peso"
                        type="number"
                        step="0.1"
                        value={formData.peso}
                        onChange={(e) => setFormData({...formData, peso: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cpf_tutor">CPF do Tutor</Label>
                      <Input
                        id="cpf_tutor"
                        value={formData.cpf_tutor}
                        onChange={(e) => setFormData({...formData, cpf_tutor: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="nome_tutor">Nome do Tutor</Label>
                    <Input
                      id="nome_tutor"
                      value={formData.nome_tutor}
                      onChange={(e) => setFormData({...formData, nome_tutor: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingAnimal ? 'Atualizar' : 'Cadastrar'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome, tutor ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por espécie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as espécies</SelectItem>
                {especies.map(especie => (
                  <SelectItem key={especie} value={especie}>
                    {especie.charAt(0).toUpperCase() + especie.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Animais */}
      <Card>
        <CardHeader>
          <CardTitle>Animais Cadastrados ({filteredAnimals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Carregando animais...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Espécie</TableHead>
                  <TableHead>Raça</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnimals.map((animal) => (
                  <TableRow key={animal.id}>
                    <TableCell className="font-medium">{animal.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {animal.especie.charAt(0).toUpperCase() + animal.especie.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{animal.raca || '-'}</TableCell>
                    <TableCell>{animal.nome_tutor || '-'}</TableCell>
                    <TableCell>{animal.cpf_tutor || '-'}</TableCell>
                    <TableCell>{animal.peso ? `${animal.peso} kg` : '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(animal)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(animal.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredAnimals.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Nenhum animal encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}