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
import { Textarea } from '@/components/ui/textarea';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Upload,
  Download,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  nome: string;
  tipo: 'racao' | 'suplemento' | 'medicamento' | 'vacina' | 'equipamento';
  composicao?: string;
  modo_uso?: string;
  preco_kg?: number;
  especie_alvo?: ('canino' | 'felino' | 'bovino' | 'suino' | 'equino' | 'ovino' | 'caprino' | 'aves' | 'outros')[];
  fase_alvo?: string[];
  imagem_url?: string;
  created_at: string;
  updated_at: string;
}

export default function Products() {
  const { userProfile, organization } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Form states
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'racao' as const,
    composicao: '',
    modo_uso: '',
    preco_kg: '',
    especie_alvo: [] as ('canino' | 'felino' | 'bovino' | 'suino' | 'equino' | 'ovino' | 'caprino' | 'aves' | 'outros')[],
    fase_alvo: [] as string[],
  });

  useEffect(() => {
    if (organization) {
      loadProducts();
    }
  }, [organization]);

  const loadProducts = async () => {
    if (!organization) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('org_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os produtos",
          variant: "destructive",
        });
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!organization) return;

    try {
      const { error } = await supabase
        .from('produtos')
        .insert({
          nome: formData.nome,
          tipo: formData.tipo,
          composicao: formData.composicao || null,
          modo_uso: formData.modo_uso || null,
          preco_kg: formData.preco_kg ? parseFloat(formData.preco_kg) : null,
          especie_alvo: formData.especie_alvo.length > 0 ? formData.especie_alvo : null,
          fase_alvo: formData.fase_alvo.length > 0 ? formData.fase_alvo : null,
          org_id: organization.id,
        });

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível criar o produto",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Produto criado com sucesso",
      });

      setIsCreateDialogOpen(false);
      setFormData({
        nome: '', tipo: 'racao', composicao: '', modo_uso: '', 
        preco_kg: '', especie_alvo: [], fase_alvo: []
      });
      loadProducts();
    } catch (error) {
      console.error('Erro ao criar produto:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o produto",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso",
      });

      loadProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels = {
      racao: 'Ração',
      suplemento: 'Suplemento',
      medicamento: 'Medicamento',
      vacina: 'Vacina',
      equipamento: 'Equipamento'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const getTipoBadgeVariant = (tipo: string): "default" | "destructive" | "secondary" | "outline" => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      racao: 'default',
      suplemento: 'secondary',
      medicamento: 'destructive',
      vacina: 'outline',
      equipamento: 'secondary'
    };
    return variants[tipo] || 'default';
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.composicao && product.composicao.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || product.tipo === filterType;
    return matchesSearch && matchesType;
  });

  if (!organization || (organization.type !== 'empresa_alimentos' && organization.type !== 'empresa_medicamentos')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Esta seção é exclusiva para empresas de alimentos e medicamentos.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="h-8 w-8" />
            Gerenciar Produtos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie o catálogo de produtos da sua empresa
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Produto</DialogTitle>
              <DialogDescription>
                Preencha os dados para adicionar um novo produto ao catálogo
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome do produto"
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData({ ...formData, tipo: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="racao">Ração</SelectItem>
                      <SelectItem value="suplemento">Suplemento</SelectItem>
                      <SelectItem value="medicamento">Medicamento</SelectItem>
                      <SelectItem value="vacina">Vacina</SelectItem>
                      <SelectItem value="equipamento">Equipamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="composicao">Composição</Label>
                <Textarea
                  id="composicao"
                  value={formData.composicao}
                  onChange={(e) => setFormData({ ...formData, composicao: e.target.value })}
                  placeholder="Descrição da composição do produto"
                />
              </div>
              
              <div>
                <Label htmlFor="modo_uso">Modo de Uso</Label>
                <Textarea
                  id="modo_uso"
                  value={formData.modo_uso}
                  onChange={(e) => setFormData({ ...formData, modo_uso: e.target.value })}
                  placeholder="Instruções de uso do produto"
                />
              </div>
              
              <div>
                <Label htmlFor="preco_kg">Preço por Kg (R$)</Label>
                <Input
                  id="preco_kg"
                  type="number"
                  step="0.01"
                  value={formData.preco_kg}
                  onChange={(e) => setFormData({ ...formData, preco_kg: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              
              <Button onClick={handleCreateProduct} className="w-full">
                Criar Produto
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
                  placeholder="Buscar produtos..."
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
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="racao">Ração</SelectItem>
                  <SelectItem value="suplemento">Suplemento</SelectItem>
                  <SelectItem value="medicamento">Medicamento</SelectItem>
                  <SelectItem value="vacina">Vacina</SelectItem>
                  <SelectItem value="equipamento">Equipamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              Limite: {organization.limite_produtos}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rações</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.tipo === 'racao').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medicamentos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.tipo === 'medicamento').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suplementos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.tipo === 'suplemento').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos ({filteredProducts.length})</CardTitle>
          <CardDescription>
            Lista de todos os produtos cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum produto encontrado</p>
              <p className="text-sm">Adicione produtos ao seu catálogo</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Preço/Kg</TableHead>
                  <TableHead>Composição</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.nome}</div>
                        {product.especie_alvo && product.especie_alvo.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            Espécies: {product.especie_alvo.join(', ')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTipoBadgeVariant(product.tipo)}>
                        {getTipoLabel(product.tipo)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.preco_kg ? (
                        <span className="font-medium">
                          R$ {product.preco_kg.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.composicao ? (
                        <div className="max-w-xs truncate" title={product.composicao}>
                          {product.composicao}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(product.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteProduct(product.id)}
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