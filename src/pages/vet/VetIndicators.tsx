import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { toast } from '@/hooks/use-toast';

interface Animal {
  id: string;
  nome: string;
  especie: string;
}

interface Produto {
  id: string;
  nome: string;
  tipo: string;
}

interface Indicacao {
  id: string;
  created_at: string;
  animal_id?: string;
  produto_id?: string;
  animais?: Animal;
  produtos?: Produto;
}

export default function VetIndicators() {
  const { userProfile, organization } = useAuth();
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    animal_id: '',
    produto_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar indicações
      const { data: indicacoesData, error: indicacoesError } = await supabase
        .from('indicacoes_produto')
        .select(`
          *,
          animais(id, nome, especie),
          produtos(id, nome, tipo)
        `)
        .order('created_at', { ascending: false });

      if (indicacoesError) throw indicacoesError;
      setIndicacoes(indicacoesData || []);

      // Carregar animais
      const { data: animalsData, error: animalsError } = await supabase
        .from('animais')
        .select('id, nome, especie')
        .order('nome');

      if (animalsError) throw animalsError;
      setAnimals(animalsData || []);

      // Carregar produtos (todos os produtos disponíveis)
      const { data: produtosData, error: produtosError } = await supabase
        .from('produtos')
        .select('id, nome, tipo')
        .order('nome');

      if (produtosError) throw produtosError;
      setProdutos(produtosData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      animal_id: '',
      produto_id: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const indicacaoData = {
        animal_id: formData.animal_id || null,
        produto_id: formData.produto_id || null,
        org_id: organization?.id,
        veterinario_id: userProfile?.id
      };

      const { error } = await supabase
        .from('indicacoes_produto')
        .insert([indicacaoData]);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Indicação registrada com sucesso!",
      });

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar indicação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a indicação.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta indicação?')) return;

    try {
      const { error } = await supabase
        .from('indicacoes_produto')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Indicação excluída com sucesso!",
      });
      loadData();
    } catch (error) {
      console.error('Erro ao excluir indicação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a indicação.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <TrendingUp className="h-8 w-8" />
          Indicações de Produtos
        </h1>
        <p className="text-muted-foreground">Registre e acompanhe as indicações de produtos para animais</p>
      </div>

      {/* Header com Ações */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Indicações Registradas</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Indicação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Indicação de Produto</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="animal_id" className="block text-sm font-medium mb-2">
                      Animal
                    </label>
                    <Select value={formData.animal_id} onValueChange={(value) => setFormData({...formData, animal_id: value})}>
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
                    <label htmlFor="produto_id" className="block text-sm font-medium mb-2">
                      Produto
                    </label>
                    <Select value={formData.produto_id} onValueChange={(value) => setFormData({...formData, produto_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {produtos.map(produto => (
                          <SelectItem key={produto.id} value={produto.id}>
                            {produto.nome} ({produto.tipo})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Registrar Indicação
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Carregando indicações...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {indicacoes.map((indicacao) => (
                  <TableRow key={indicacao.id}>
                    <TableCell>
                      {indicacao.animais?.nome || 'N/A'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {indicacao.produtos?.nome || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {indicacao.produtos?.tipo || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(indicacao.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(indicacao.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {indicacoes.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Nenhuma indicação encontrada
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