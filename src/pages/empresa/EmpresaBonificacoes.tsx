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
import { Plus, Gift, Edit, Trash2, Users, Target } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type BonificacaoVeterinario = Tables<'bonificacoes_veterinario'>;
type User = Tables<'users'>;
type Produto = Tables<'produtos'>;

interface BonificacaoWithDetails extends BonificacaoVeterinario {
  veterinario: User;
  produto: Produto;
}

export default function EmpresaBonificacoes() {
  const { organization } = useAuth();
  const [bonificacoes, setBonificacoes] = useState<BonificacaoWithDetails[]>([]);
  const [veterinarios, setVeterinarios] = useState<User[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBonificacao, setEditingBonificacao] = useState<BonificacaoVeterinario | null>(null);

  const [formData, setFormData] = useState({
    veterinario_id: '',
    produto_id: '',
    tipo_bonificacao: 'percentual' as 'percentual' | 'valor_fixo' | 'produto_gratis',
    valor: '',
    percentual: '',
    meta_indicacoes: '1',
    data_inicio: '',
    data_fim: '',
    status: 'ativo' as 'ativo' | 'inativo' | 'expirado'
  });

  useEffect(() => {
    if (organization?.id) {
      fetchData();
    }
  }, [organization?.id]);

  const fetchData = async () => {
    if (!organization?.id) return;

    setLoading(true);
    try {
      const [bonificacoesRes, veterinariosRes, produtosRes] = await Promise.all([
        supabase
          .from('bonificacoes_veterinario')
          .select(`
            *,
            veterinario:users!bonificacoes_veterinario_veterinario_id_fkey(*),
            produto:produtos!bonificacoes_veterinario_produto_id_fkey(*)
          `)
          .eq('empresa_id', organization.id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('users')
          .select('*')
          .eq('role', 'veterinario')
          .order('nome'),
        
        supabase
          .from('produtos')
          .select('*')
          .eq('org_id', organization.id)
          .order('nome')
      ]);

      if (bonificacoesRes.error) throw bonificacoesRes.error;
      if (veterinariosRes.error) throw veterinariosRes.error;
      if (produtosRes.error) throw produtosRes.error;

      setBonificacoes(bonificacoesRes.data || []);
      setVeterinarios(veterinariosRes.data || []);
      setProdutos(produtosRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar bonificações',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;

    try {
      const dataToSubmit = {
        empresa_id: organization.id,
        veterinario_id: formData.veterinario_id,
        produto_id: formData.produto_id,
        tipo_bonificacao: formData.tipo_bonificacao,
        valor: formData.valor ? parseFloat(formData.valor) : null,
        percentual: formData.percentual ? parseFloat(formData.percentual) : null,
        meta_indicacoes: parseInt(formData.meta_indicacoes),
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim || null,
        status: formData.status,
        org_id: organization.id
      };

      if (editingBonificacao) {
        const { error } = await supabase
          .from('bonificacoes_veterinario')
          .update(dataToSubmit)
          .eq('id', editingBonificacao.id);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Bonificação atualizada com sucesso!' });
      } else {
        const { error } = await supabase
          .from('bonificacoes_veterinario')
          .insert(dataToSubmit);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Bonificação criada com sucesso!' });
      }

      setIsDialogOpen(false);
      setEditingBonificacao(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar bonificação:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar bonificação',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      veterinario_id: '',
      produto_id: '',
      tipo_bonificacao: 'percentual',
      valor: '',
      percentual: '',
      meta_indicacoes: '1',
      data_inicio: '',
      data_fim: '',
      status: 'ativo'
    });
  };

  const handleEdit = (bonificacao: BonificacaoVeterinario) => {
    setEditingBonificacao(bonificacao);
    setFormData({
      veterinario_id: bonificacao.veterinario_id,
      produto_id: bonificacao.produto_id,
      tipo_bonificacao: bonificacao.tipo_bonificacao as any,
      valor: bonificacao.valor?.toString() || '',
      percentual: bonificacao.percentual?.toString() || '',
      meta_indicacoes: bonificacao.meta_indicacoes?.toString() || '1',
      data_inicio: bonificacao.data_inicio,
      data_fim: bonificacao.data_fim || '',
      status: bonificacao.status as any || 'ativo'
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta bonificação?')) return;

    try {
      const { error } = await supabase
        .from('bonificacoes_veterinario')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Bonificação excluída com sucesso!' });
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir bonificação:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir bonificação',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: 'default',
      inativo: 'secondary',
      expirado: 'destructive'
    };
    return variants[status as keyof typeof variants] || 'default';
  };

  const getTipoBadge = (tipo: string) => {
    const variants = {
      percentual: 'default',
      valor_fixo: 'secondary',
      produto_gratis: 'outline'
    };
    return variants[tipo as keyof typeof variants] || 'default';
  };

  if (loading) {
    return <div className="p-8">Carregando bonificações...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Gift className="h-8 w-8" />
            Bonificações para Veterinários
          </h1>
          <p className="text-muted-foreground">
            Gerencie bonificações e incentivos para veterinários
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingBonificacao(null); }}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Bonificação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingBonificacao ? 'Editar Bonificação' : 'Nova Bonificação'}
              </DialogTitle>
              <DialogDescription>
                Configure os incentivos para veterinários
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="veterinario_id">Veterinário *</Label>
                  <Select value={formData.veterinario_id} onValueChange={(value) => setFormData({ ...formData, veterinario_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um veterinário" />
                    </SelectTrigger>
                    <SelectContent>
                      {veterinarios.map((vet) => (
                        <SelectItem key={vet.id} value={vet.id}>
                          {vet.nome} - {vet.email}
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
                          {produto.nome} - {produto.tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="tipo_bonificacao">Tipo de Bonificação *</Label>
                  <Select value={formData.tipo_bonificacao} onValueChange={(value: any) => setFormData({ ...formData, tipo_bonificacao: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentual">Percentual</SelectItem>
                      <SelectItem value="valor_fixo">Valor Fixo</SelectItem>
                      <SelectItem value="produto_gratis">Produto Grátis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.tipo_bonificacao === 'percentual' && (
                  <div>
                    <Label htmlFor="percentual">Percentual (%)</Label>
                    <Input
                      id="percentual"
                      type="number"
                      step="0.1"
                      value={formData.percentual}
                      onChange={(e) => setFormData({ ...formData, percentual: e.target.value })}
                      placeholder="Ex: 5.0"
                    />
                  </div>
                )}
                {formData.tipo_bonificacao === 'valor_fixo' && (
                  <div>
                    <Label htmlFor="valor">Valor (R$)</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                      placeholder="Ex: 100.00"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="meta_indicacoes">Meta de Indicações</Label>
                  <Input
                    id="meta_indicacoes"
                    type="number"
                    value={formData.meta_indicacoes}
                    onChange={(e) => setFormData({ ...formData, meta_indicacoes: e.target.value })}
                    placeholder="Ex: 1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="data_inicio">Data Início *</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="data_fim">Data Fim</Label>
                  <Input
                    id="data_fim"
                    type="date"
                    value={formData.data_fim}
                    onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="expirado">Expirado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingBonificacao ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bonificações Ativas</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bonificacoes.filter(b => b.status === 'ativo').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Bonificações em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veterinários Participantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(bonificacoes.filter(b => b.status === 'ativo').map(b => b.veterinario_id)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Veterinários com bonificações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Incentivados</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(bonificacoes.filter(b => b.status === 'ativo').map(b => b.produto_id)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Produtos com bonificações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bonificações Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bonificações Cadastradas</CardTitle>
          <CardDescription>
            Gerencie todas as bonificações para veterinários
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bonificacoes.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma bonificação cadastrada</h3>
              <p className="text-muted-foreground mb-4">
                Crie bonificações para incentivar veterinários a indicar seus produtos
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Bonificação
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Veterinário</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor/Percentual</TableHead>
                  <TableHead>Meta</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bonificacoes.map((bonificacao) => (
                  <TableRow key={bonificacao.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{bonificacao.veterinario.nome}</div>
                        <div className="text-sm text-muted-foreground">{bonificacao.veterinario.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{bonificacao.produto.nome}</div>
                        <div className="text-sm text-muted-foreground">{bonificacao.produto.tipo}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTipoBadge(bonificacao.tipo_bonificacao) as any}>
                        {bonificacao.tipo_bonificacao === 'percentual' ? 'Percentual' : 
                         bonificacao.tipo_bonificacao === 'valor_fixo' ? 'Valor Fixo' : 'Produto Grátis'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {bonificacao.tipo_bonificacao === 'percentual' && bonificacao.percentual
                        ? `${bonificacao.percentual}%`
                        : bonificacao.tipo_bonificacao === 'valor_fixo' && bonificacao.valor
                        ? `R$ ${bonificacao.valor.toFixed(2)}`
                        : 'Produto Grátis'}
                    </TableCell>
                    <TableCell>
                      {bonificacao.meta_indicacoes} indicações
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(bonificacao.data_inicio).toLocaleDateString('pt-BR')}</div>
                        {bonificacao.data_fim && (
                          <div className="text-muted-foreground">
                            até {new Date(bonificacao.data_fim).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(bonificacao.status || 'ativo') as any}>
                        {bonificacao.status || 'ativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(bonificacao)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(bonificacao.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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