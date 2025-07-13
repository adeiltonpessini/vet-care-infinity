import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, AlertTriangle, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { toast } from '@/hooks/use-toast';

interface EstoqueItem {
  id: string;
  nome: string;
  tipo: string;
  categoria?: string;
  quantidade: number;
  unidade?: string;
  alerta_minimo?: number;
  validade?: string;
  entrada?: number;
  saida?: number;
  created_at: string;
  updated_at: string;
}

export default function VetInventory() {
  const { organization } = useAuth();
  const [items, setItems] = useState<EstoqueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EstoqueItem | null>(null);
  const [filterType, setFilterType] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    categoria: '',
    quantidade: '',
    unidade: '',
    alerta_minimo: '',
    validade: '',
    entrada: '',
    saida: ''
  });

  const tipos = ['medicamento', 'vacina', 'equipamento', 'material', 'outros'];
  const unidades = ['kg', 'g', 'l', 'ml', 'unidade', 'caixa', 'frasco'];

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('estoque')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Erro ao carregar estoque:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o estoque.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: '',
      categoria: '',
      quantidade: '',
      unidade: '',
      alerta_minimo: '',
      validade: '',
      entrada: '',
      saida: ''
    });
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const itemData = {
        nome: formData.nome,
        tipo: formData.tipo,
        categoria: formData.categoria || null,
        quantidade: Number(formData.quantidade),
        unidade: formData.unidade || 'unidade',
        alerta_minimo: formData.alerta_minimo ? Number(formData.alerta_minimo) : 0,
        validade: formData.validade || null,
        entrada: formData.entrada ? Number(formData.entrada) : 0,
        saida: formData.saida ? Number(formData.saida) : 0,
        org_id: organization?.id
      };

      if (editingItem) {
        const { error } = await supabase
          .from('estoque')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Item atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('estoque')
          .insert([itemData]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Item adicionado ao estoque com sucesso!",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadItems();
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o item.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: EstoqueItem) => {
    setEditingItem(item);
    setFormData({
      nome: item.nome,
      tipo: item.tipo,
      categoria: item.categoria || '',
      quantidade: item.quantidade.toString(),
      unidade: item.unidade || '',
      alerta_minimo: item.alerta_minimo?.toString() || '',
      validade: item.validade || '',
      entrada: item.entrada?.toString() || '',
      saida: item.saida?.toString() || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      const { error } = await supabase
        .from('estoque')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Item excluído com sucesso!",
      });
      loadItems();
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o item.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (item: EstoqueItem) => {
    const isExpiringSoon = item.validade && 
      new Date(item.validade) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const isLowStock = item.alerta_minimo && item.quantidade <= item.alerta_minimo;

    if (isExpiringSoon && isLowStock) {
      return <Badge variant="destructive">Crítico</Badge>;
    }
    if (isExpiringSoon) {
      return <Badge variant="destructive">Vencendo</Badge>;
    }
    if (isLowStock) {
      return <Badge variant="secondary">Estoque Baixo</Badge>;
    }
    return <Badge variant="outline">OK</Badge>;
  };

  const filteredItems = items.filter(item => 
    !filterType || item.tipo === filterType
  );

  const alertItems = items.filter(item => {
    const isExpiringSoon = item.validade && 
      new Date(item.validade) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const isLowStock = item.alerta_minimo && item.quantidade <= item.alerta_minimo;
    return isExpiringSoon || isLowStock;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Package className="h-8 w-8" />
          Estoque da Clínica
        </h1>
        <p className="text-muted-foreground">Gerencie o estoque de medicamentos, vacinas e equipamentos</p>
      </div>

      {/* Alertas */}
      {alertItems.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Estoque ({alertItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alertItems.slice(0, 5).map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="font-medium">{item.nome}</span>
                  {getStatusBadge(item)}
                </div>
              ))}
              {alertItems.length > 5 && (
                <p className="text-sm text-muted-foreground">
                  E mais {alertItems.length - 5} itens com alertas...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros e Ações */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Itens em Estoque</CardTitle>
            <div className="flex gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  {tipos.map(tipo => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? 'Editar Item' : 'Novo Item'}
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
                        <Label htmlFor="tipo">Tipo *</Label>
                        <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {tipos.map(tipo => (
                              <SelectItem key={tipo} value={tipo}>
                                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="categoria">Categoria</Label>
                        <Input
                          id="categoria"
                          value={formData.categoria}
                          onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="quantidade">Quantidade *</Label>
                        <Input
                          id="quantidade"
                          type="number"
                          min="0"
                          value={formData.quantidade}
                          onChange={(e) => setFormData({...formData, quantidade: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="unidade">Unidade</Label>
                        <Select value={formData.unidade} onValueChange={(value) => setFormData({...formData, unidade: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a unidade" />
                          </SelectTrigger>
                          <SelectContent>
                            {unidades.map(unidade => (
                              <SelectItem key={unidade} value={unidade}>
                                {unidade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="alerta_minimo">Alerta Mínimo</Label>
                        <Input
                          id="alerta_minimo"
                          type="number"
                          min="0"
                          value={formData.alerta_minimo}
                          onChange={(e) => setFormData({...formData, alerta_minimo: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="validade">Validade</Label>
                        <Input
                          id="validade"
                          type="date"
                          value={formData.validade}
                          onChange={(e) => setFormData({...formData, validade: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="entrada">Entrada</Label>
                        <Input
                          id="entrada"
                          type="number"
                          min="0"
                          value={formData.entrada}
                          onChange={(e) => setFormData({...formData, entrada: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="saida">Saída</Label>
                        <Input
                          id="saida"
                          type="number"
                          min="0"
                          value={formData.saida}
                          onChange={(e) => setFormData({...formData, saida: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingItem ? 'Atualizar' : 'Cadastrar'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Carregando estoque...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.quantidade}
                        {item.entrada && item.entrada > 0 && (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        )}
                        {item.saida && item.saida > 0 && (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.unidade || 'unidade'}</TableCell>
                    <TableCell>
                      {item.validade ? 
                        new Date(item.validade).toLocaleDateString('pt-BR') : 
                        'N/A'
                      }
                    </TableCell>
                    <TableCell>{getStatusBadge(item)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredItems.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Nenhum item encontrado
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