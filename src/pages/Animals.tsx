import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, QrCode, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface Animal {
  id: string;
  nome: string;
  especie: string;
  raca?: string;
  peso?: number;
  data_nascimento?: string;
  cpf_tutor?: string;
  nome_tutor?: string;
  qr_code_url?: string;
  foto_url?: string;
  observacoes?: string;
  created_at: string;
  lote_id?: string;
  lotes?: {
    nome: string;
  };
}

function Animals() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [especieFilter, setEspecieFilter] = useState('all');
  const { organization, userProfile } = useAuth();
  const { toast } = useToast();

  const loadAnimals = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('animais')
        .select(`
          *,
          lotes (
            nome
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,nome_tutor.ilike.%${searchTerm}%,cpf_tutor.ilike.%${searchTerm}%`);
      }

      if (especieFilter !== 'all') {
        query = query.eq('especie', especieFilter as any);
      }

      const { data, error } = await query;

      if (error) throw error;

      setAnimals(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar animais',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnimals();
  }, [searchTerm, especieFilter]);

  const deleteAnimal = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este animal?')) return;

    try {
      const { error } = await supabase
        .from('animais')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Animal excluído com sucesso!'
      });

      loadAnimals();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir animal',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getSpecieIcon = (especie: string) => {
    const especieIcons: Record<string, string> = {
      canino: '🐕',
      felino: '🐱',
      bovino: '🐄',
      suino: '🐷',
      equino: '🐴',
      ovino: '🐑',
      caprino: '🐐',
      aves: '🐔',
      outros: '🦎'
    };
    return especieIcons[especie] || '🐾';
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} dias`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses`;
    return `${Math.floor(diffDays / 365)} anos`;
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const exportData = () => {
    // Simple CSV export
    const csvData = animals.map(animal => ({
      Nome: animal.nome,
      Espécie: animal.especie,
      Raça: animal.raca || '',
      Peso: animal.peso || '',
      'Data Nascimento': animal.data_nascimento || '',
      'CPF Tutor': animal.cpf_tutor || '',
      'Nome Tutor': animal.nome_tutor || '',
      Lote: animal.lotes?.nome || '',
      'Data Cadastro': new Date(animal.created_at).toLocaleDateString('pt-BR')
    }));

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `animais_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Dados exportados com sucesso!'
    });
  };

  if (!organization) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Animais</h1>
          <p className="text-muted-foreground">
            Gerencie os animais da sua {organization.type === 'clinica_veterinaria' ? 'clínica' : organization.type === 'fazenda' ? 'fazenda' : 'empresa'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button asChild>
            <Link to="/animals/new">
              <Plus className="h-4 w-4 mr-2" />
              Novo Animal
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Animais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{animals.length}</div>
            <p className="text-xs text-muted-foreground">
              Limite: {organization.limite_animais}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Caninos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {animals.filter(a => a.especie === 'canino').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Felinos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {animals.filter(a => a.especie === 'felino').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {animals.filter(a => !['canino', 'felino'].includes(a.especie)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, tutor ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={especieFilter} onValueChange={setEspecieFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por espécie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as espécies</SelectItem>
                <SelectItem value="canino">Canino</SelectItem>
                <SelectItem value="felino">Felino</SelectItem>
                <SelectItem value="bovino">Bovino</SelectItem>
                <SelectItem value="suino">Suíno</SelectItem>
                <SelectItem value="equino">Equino</SelectItem>
                <SelectItem value="ovino">Ovino</SelectItem>
                <SelectItem value="caprino">Caprino</SelectItem>
                <SelectItem value="aves">Aves</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Animals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Animais</CardTitle>
          <CardDescription>
            {animals.length} animal(is) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : animals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum animal encontrado</p>
              <Button asChild className="mt-4">
                <Link to="/animals/new">Cadastrar primeiro animal</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Animal</TableHead>
                    <TableHead>Espécie</TableHead>
                    {organization.type === 'clinica_veterinaria' && (
                      <>
                        <TableHead>Tutor</TableHead>
                        <TableHead>CPF</TableHead>
                      </>
                    )}
                    {organization.type === 'fazenda' && <TableHead>Lote</TableHead>}
                    <TableHead>Peso</TableHead>
                    <TableHead>Idade</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {animals.map((animal) => (
                    <TableRow key={animal.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{getSpecieIcon(animal.especie)}</div>
                          <div>
                            <div className="font-semibold">{animal.nome}</div>
                            {animal.raca && (
                              <div className="text-sm text-muted-foreground">{animal.raca}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {animal.especie}
                        </Badge>
                      </TableCell>
                      {organization.type === 'clinica_veterinaria' && (
                        <>
                          <TableCell>
                            <div>{animal.nome_tutor || '-'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-sm">
                              {animal.cpf_tutor ? formatCPF(animal.cpf_tutor) : '-'}
                            </div>
                          </TableCell>
                        </>
                      )}
                      {organization.type === 'fazenda' && (
                        <TableCell>
                          {animal.lotes?.nome ? (
                            <Badge variant="outline">{animal.lotes.nome}</Badge>
                          ) : (
                            <span className="text-muted-foreground">Sem lote</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        {animal.peso ? `${animal.peso} kg` : '-'}
                      </TableCell>
                      <TableCell>
                        {animal.data_nascimento ? calculateAge(animal.data_nascimento) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {animal.qr_code_url && (
                            <Button size="sm" variant="ghost">
                              <QrCode className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" asChild>
                            <Link to={`/animals/${animal.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => deleteAnimal(animal.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Animals;