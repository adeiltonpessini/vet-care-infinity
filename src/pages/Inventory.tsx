import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InventoryItem {
  id: string;
  nome: string;
  tipo: string;
  categoria?: string;
  quantidade: number;
  unidade: string;
  entrada?: number;
  saida?: number;
  alerta_minimo?: number;
  validade?: string;
  created_at: string;
  updated_at: string;
}

export default function Inventory() {
  const { organization } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Form states
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    categoria: '',
    quantidade: '',
    unidade: 'kg',
    alerta_minimo: '',
    validade: '',
  });

  useEffect(() => {
    if (organization) {
      loadInventory();
    }
  }, [organization]);

  const loadInventory = async () => {
    if (!organization) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('estoque')
        .select('*')
        .eq('org_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar o estoque",
          variant: "destructive",
        });
        return;
      }

      setItems(data || []);
    } catch (error) {
      console.error('Erro ao carregar estoque:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async () => {
    if (!organization) return;

    try {
      const { error } = await supabase
        .from('estoque')
        .insert({
          nome: formData.nome,
          tipo: formData.tipo,
          categoria: formData.categoria || null,
          quantidade: parseFloat(formData.quantidade),
          unidade: formData.unidade,
          alerta_minimo: formData.alerta_minimo ? parseFloat(formData.alerta_minimo) : null,
          validade: formData.validade || null,
          org_id: organization.id,
        });

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível adicionar o item",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Item adicionado ao estoque",
      });

      setIsCreateDialogOpen(false);
      setFormData({
        nome: '', tipo: '', categoria: '', quantidade: '', 
        unidade: 'kg', alerta_minimo: '', validade: ''
      });
      loadInventory();
    } catch (error) {
      console.error('Erro ao criar item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('estoque')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o item",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Item excluído do estoque",
      });

      loadInventory();
    } catch (error) {
      console.error('Erro ao excluir item:', error);
    }
  };

  const isLowStock = (item: InventoryItem) => {
    return item.alerta_minimo ? item.quantidade <= item.alerta_minimo : false;
  };

  const isExpiringSoon = (item: InventoryItem) => {
    if (!item.validade) return false;
    const validadeDate = new Date(item.validade);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((validadeDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (item: InventoryItem) => {
    if (!item.validade) return false;
    const validadeDate = new Date(item.validade);
    const today = new Date();
    return validadeDate < today;
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.categoria && item.categoria.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || 
                       (filterType === 'low_stock' && isLowStock(item)) ||
                       (filterType === 'expiring' && isExpiringSoon(item)) ||
                       (filterType === 'expired' && isExpired(item)) ||
                       item.tipo === filterType;
    return matchesSearch && matchesType;
  });

  const lowStockItems = items.filter(isLowStock);
  const expiringItems = items.filter(isExpiringSoon);
  const expiredItems = items.filter(isExpired);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="h-8 w-8" />
            Controle de Estoque
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie o estoque de produtos e suprimentos
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Item ao Estoque</DialogTitle>
              <DialogDescription>
                Preencha os dados para adicionar um novo item ao estoque
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Item *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome do item"
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Input
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    placeholder="Ex: Medicamento, Ração"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  placeholder="Categoria do produto"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantidade">Quantidade *</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="unidade">Unidade</Label>
                  <Select
                    value={formData.unidade}
                    onValueChange={(value) => setFormData({ ...formData, unidade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="g">Gramas</SelectItem>
                      <SelectItem value="L">Litros</SelectItem>
                      <SelectItem value="ml">Ml</SelectItem>
                      <SelectItem value="unidade">Unidade</SelectItem>
                      <SelectItem value="caixa">Caixa</SelectItem>
                      <SelectItem value="saco">Saco</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="alerta_minimo">Alerta Mínimo</Label>
                  <Input
                    id="alerta_minimo"
                    type="number"
                    value={formData.alerta_minimo}
                    onChange={(e) => setFormData({ ...formData, alerta_minimo: e.target.value })}
                    placeholder="Quantidade mínima"
                  />
                </div>
                <div>
                  <Label htmlFor="validade">Validade</Label>
                  <Input
                    id="validade"
                    type="date"
                    value={formData.validade}
                    onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
                  />
                </div>
              </div>
              
              <Button onClick={handleCreateItem} className="w-full">
                Adicionar Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
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
                  placeholder="Buscar itens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os itens</SelectItem>
                  <SelectItem value="low_stock">Estoque baixo</SelectItem>
                  <SelectItem value="expiring">Vencendo</SelectItem>
                  <SelectItem value="expired">Vencidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{lowStockItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencendo em 30 dias</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{expiringItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{expiredItems.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Estoque ({filteredItems.length})</CardTitle>
          <CardDescription>
            Lista de todos os itens em estoque
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum item encontrado</p>
              <p className="text-sm">Adicione itens ao seu estoque</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Tipo/Categoria</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Última Atualização</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.nome}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.tipo}</div>
                        {item.categoria && (
                          <div className="text-sm text-muted-foreground">{item.categoria}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {item.quantidade} {item.unidade}
                      </div>
                      {item.alerta_minimo && (
                        <div className="text-xs text-muted-foreground">
                          Min: {item.alerta_minimo} {item.unidade}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {isExpired(item) && (
                          <Badge variant="destructive">Vencido</Badge>
                        )}
                        {!isExpired(item) && isExpiringSoon(item) && (
                          <Badge variant="outline" className="text-orange-500 border-orange-500">
                            Vencendo
                          </Badge>
                        )}
                        {isLowStock(item) && (
                          <Badge variant="outline" className="text-warning border-warning">
                            Estoque Baixo
                          </Badge>
                        )}
                        {!isExpired(item) && !isExpiringSoon(item) && !isLowStock(item) && (
                          <Badge variant="secondary">OK</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.validade ? (
                        <span className={isExpired(item) ? 'text-destructive' : isExpiringSoon(item) ? 'text-orange-500' : ''}>
                          {new Date(item.validade).toLocaleDateString('pt-BR')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(item.updated_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteItem(item.id)}
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