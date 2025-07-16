import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Target, Search, Eye, Award, Building } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Animal = Tables<'animais'>;
type Produto = Tables<'produtos'>;
type Organization = Tables<'organizations'>;
type Indicacao = Tables<'indicacoes_produto'>;

interface IndicacaoWithDetails extends Indicacao {
  animal: Animal;
  produto: Produto & { organization: Organization };
}

export default function VetIndicacoes() {
  const { userProfile } = useAuth();
  const [indicacoes, setIndicacoes] = useState<IndicacaoWithDetails[]>([]);
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [produtos, setProdutos] = useState<(Produto & { organization: Organization })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('all');

  const [formData, setFormData] = useState({
    animal_id: '',
    produto_id: '',
    observacoes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [indicacoesRes, animaisRes, produtosRes] = await Promise.all([
        supabase
          .from('indicacoes_produto')
          .select(`
            *,
            animal:animais(*),
            produto:produtos(*, organization:organizations(*))
          `)
          .eq('veterinario_id', userProfile?.id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('animais')
          .select('*')
          .eq('org_id', userProfile?.org_id)
          .order('nome'),
        
        supabase
          .from('produtos')
          .select('*, organization:organizations(*)')
          .in('tipo', ['medicamento', 'suplemento', 'vacina', 'racao'])
          .order('nome')
      ]);

      if (indicacoesRes.error) throw indicacoesRes.error;
      if (animaisRes.error) throw animaisRes.error;
      if (produtosRes.error) throw produtosRes.error;

      setIndicacoes(indicacoesRes.data || []);
      setAnimais(animaisRes.data || []);
      setProdutos(produtosRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar indicações',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.id) return;

    try {
      const { error } = await supabase
        .from('indicacoes_produto')
        .insert({
          veterinario_id: userProfile.id,
          animal_id: formData.animal_id,
          produto_id: formData.produto_id,
          org_id: userProfile.org_id
        });

      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Indicação registrada com sucesso!' });
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Erro ao registrar indicação:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao registrar indicação',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      animal_id: '',
      produto_id: '',
      observacoes: ''
    });
  };

  const filteredIndicacoes = indicacoes.filter(indicacao => {
    const matchesSearch = indicacao.animal.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         indicacao.produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         indicacao.produto.organization.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = filterTipo === 'all' || indicacao.produto.tipo === filterTipo;
    
    return matchesSearch && matchesTipo;
  });

  const getTipoBadge = (tipo: string) => {
    const variants = {
      medicamento: 'destructive',
      suplemento: 'secondary',
      vacina: 'outline',
      racao: 'default'
    };
    return variants[tipo as keyof typeof variants] || 'default';
  };

  if (loading) {
    return <div className="p-8">Carregando indicações...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target className="h-8 w-8" />
            Indicações de Produtos
          </h1>
          <p className="text-muted-foreground">
            Registre e acompanhe suas indicações de produtos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); }}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Indicação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Indicação</DialogTitle>
              <DialogDescription>
                Registre uma nova indicação de produto
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="animal_id">Animal *</Label>
                  <Select value={formData.animal_id} onValueChange={(value) => setFormData({ ...formData, animal_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um animal" />
                    </SelectTrigger>
                    <SelectContent>
                      {animais.map((animal) => (
                        <SelectItem key={animal.id} value={animal.id}>
                          {animal.nome} - {animal.especie}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="produto_id">Produto *</Label>
                  <Select value={formData.produto_id} onValueChange={(value) => setFormData({ ...formData, produto_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {produtos.map((produto) => (
                        <SelectItem key={produto.id} value={produto.id}>
                          {produto.nome} - {produto.organization.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Registrar Indicação
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por animal, produto ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="medicamento">Medicamentos</SelectItem>
                  <SelectItem value="suplemento">Suplementos</SelectItem>
                  <SelectItem value="vacina">Vacinas</SelectItem>
                  <SelectItem value="racao">Rações</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Indicações</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{indicacoes.length}</div>
            <p className="text-xs text-muted-foreground">
              Indicações registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medicamentos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {indicacoes.filter(i => i.produto.tipo === 'medicamento').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Medicamentos indicados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Atendidas</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(indicacoes.map(i => i.produto.organization.id)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Empresas diferentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {indicacoes.filter(i => {
                const created = new Date(i.created_at);
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Indicações este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Indicações */}
      <Card>
        <CardHeader>
          <CardTitle>Minhas Indicações ({filteredIndicacoes.length})</CardTitle>
          <CardDescription>
            Histórico de todas as indicações registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredIndicacoes.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma indicação encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Registre sua primeira indicação de produto
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Indicação
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIndicacoes.map((indicacao) => (
                  <TableRow key={indicacao.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{indicacao.animal.nome}</div>
                        <div className="text-sm text-muted-foreground">{indicacao.animal.especie}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{indicacao.produto.nome}</div>
                        {indicacao.produto.preco_kg && (
                          <div className="text-sm text-muted-foreground">
                            R$ {indicacao.produto.preco_kg.toFixed(2)}/kg
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{indicacao.produto.organization.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {indicacao.produto.organization.type}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTipoBadge(indicacao.produto.tipo) as any}>
                        {indicacao.produto.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(indicacao.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}