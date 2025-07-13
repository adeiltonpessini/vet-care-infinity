import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  Plus, 
  Search,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FazendaEstoque() {
  const { userProfile } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInventory();
  }, [userProfile?.org_id]);

  const fetchInventory = async () => {
    if (!userProfile?.org_id) return;

    try {
      const { data, error } = await supabase
        .from('estoque')
        .select('*')
        .eq('org_id', userProfile.org_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching inventory:', error);
        return;
      }

      setInventory(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLowStock = (item: any) => {
    return item.quantidade <= (item.alerta_minimo || 0);
  };

  const isExpiringSoon = (validade: string) => {
    if (!validade) return false;
    const today = new Date();
    const expDate = new Date(validade);
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return diffDays <= 30; // 30 dias para vencer
  };

  const lowStockItems = inventory.filter(isLowStock);
  const expiringSoonItems = inventory.filter(item => item.validade && isExpiringSoon(item.validade));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Carregando estoque...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            Estoque da Fazenda
          </h1>
          <p className="text-muted-foreground mt-1">
            Controle de ração, medicamentos e insumos
          </p>
        </div>
        <Button asChild>
          <Link to="/inventory/new">
            <Plus className="h-4 w-4 mr-2" />
            Novo Item
          </Link>
        </Button>
      </div>

      {/* Alert Cards */}
      {(lowStockItems.length > 0 || expiringSoonItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockItems.length > 0 && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Estoque Baixo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{lowStockItems.length}</div>
                <p className="text-sm text-muted-foreground">
                  {lowStockItems.length === 1 ? 'item precisa' : 'itens precisam'} de reposição
                </p>
              </CardContent>
            </Card>
          )}
          
          {expiringSoonItems.length > 0 && (
            <Card className="border-warning">
              <CardHeader>
                <CardTitle className="text-warning flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Vencimento Próximo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{expiringSoonItems.length}</div>
                <p className="text-sm text-muted-foreground">
                  {expiringSoonItems.length === 1 ? 'item vence' : 'itens vencem'} em 30 dias
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Medicamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory.filter(item => item.tipo === 'medicamento').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory.filter(item => item.tipo === 'racao').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vacinas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory.filter(item => item.tipo === 'vacina').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, categoria ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInventory.map((item) => (
          <Card key={item.id} className={`hover:shadow-md transition-shadow ${isLowStock(item) ? 'border-destructive' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{item.nome}</CardTitle>
                  <CardDescription>
                    {item.categoria} - {item.tipo}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge variant="outline" className="capitalize">
                    {item.tipo}
                  </Badge>
                  {isLowStock(item) && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Estoque Baixo
                    </Badge>
                  )}
                  {item.validade && isExpiringSoon(item.validade) && (
                    <Badge variant="destructive" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      Vence em Breve
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Quantidade:</span>
                    <p className={`font-medium ${isLowStock(item) ? 'text-destructive' : ''}`}>
                      {item.quantidade} {item.unidade}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Alerta Min:</span>
                    <p className="font-medium">{item.alerta_minimo || 'N/A'} {item.unidade}</p>
                  </div>
                </div>

                {item.validade && (
                  <div>
                    <span className="text-muted-foreground text-sm">Validade:</span>
                    <p className={`font-medium ${isExpiringSoon(item.validade) ? 'text-warning' : ''}`}>
                      {new Date(item.validade).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Entrada:</span>
                    <p className="font-medium text-green-600">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      {item.entrada || 0}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Saída:</span>
                    <p className="font-medium text-red-600">
                      <TrendingDown className="h-3 w-3 inline mr-1" />
                      {item.saida || 0}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Editar
                  </Button>
                  <Button size="sm" variant="outline">
                    Movimentar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInventory.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Nenhum item encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Tente buscar com outros termos' : 'Cadastre o primeiro item do estoque'}
            </p>
            <Button asChild>
              <Link to="/inventory/new">
                <Plus className="h-4 w-4 mr-2" />
                Novo Item
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}