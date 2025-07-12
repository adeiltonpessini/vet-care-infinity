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
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  PawPrint, 
  Package,
  Stethoscope,
  Factory,
  Wheat,
  Crown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Organization {
  id: string;
  name: string;
  type: 'clinica_veterinaria' | 'empresa_alimentos' | 'empresa_medicamentos' | 'fazenda';
  plano: 'free' | 'pro' | 'enterprise';
  limite_animais: number;
  limite_funcionarios: number;
  limite_produtos: number;
  created_at: string;
  _count?: {
    users: number;
    animais: number;
    produtos: number;
  };
}

export default function AdminOrganizations() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    type: 'clinica_veterinaria' as const,
    plano: 'free' as const,
  });

  useEffect(() => {
    if (userProfile?.role !== 'superadmin') {
      return;
    }
    loadOrganizations();
  }, [userProfile]);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          *,
          users(count),
          animais(count),
          produtos(count)
        `);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar as organizações",
          variant: "destructive",
        });
        return;
      }

      setOrganizations(data || []);
    } catch (error) {
      console.error('Erro ao carregar organizações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    try {
      const planoLimits = {
        free: { animais: 10, funcionarios: 2, produtos: 5 },
        pro: { animais: 100, funcionarios: 10, produtos: 50 },
        enterprise: { animais: 999999, funcionarios: 999999, produtos: 999999 }
      };

      const limits = planoLimits[formData.plano];

      const { error } = await supabase
        .from('organizations')
        .insert({
          name: formData.name,
          type: formData.type,
          plano: formData.plano,
          limite_animais: limits.animais,
          limite_funcionarios: limits.funcionarios,
          limite_produtos: limits.produtos,
        });

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível criar a organização",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Organização criada com sucesso",
      });

      setIsCreateDialogOpen(false);
      setFormData({ name: '', type: 'clinica_veterinaria', plano: 'free' });
      loadOrganizations();
    } catch (error) {
      console.error('Erro ao criar organização:', error);
    }
  };

  const handleDeleteOrganization = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta organização? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir a organização",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Organização excluída com sucesso",
      });

      loadOrganizations();
    } catch (error) {
      console.error('Erro ao excluir organização:', error);
    }
  };

  const getOrgIcon = (type: string) => {
    switch (type) {
      case 'clinica_veterinaria':
        return <Stethoscope className="h-4 w-4" />;
      case 'empresa_alimentos':
      case 'empresa_medicamentos':
        return <Factory className="h-4 w-4" />;
      case 'fazenda':
        return <Wheat className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'clinica_veterinaria':
        return 'Clínica Veterinária';
      case 'empresa_alimentos':
        return 'Empresa de Alimentos';
      case 'empresa_medicamentos':
        return 'Empresa de Medicamentos';
      case 'fazenda':
        return 'Fazenda';
      default:
        return type;
    }
  };

  if (userProfile?.role !== 'superadmin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Crown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você precisa ser um superadmin para acessar esta página.
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
            <Building2 className="h-8 w-8" />
            Gerenciar Organizações
          </h1>
          <p className="text-muted-foreground mt-1">
            Administre todas as organizações do sistema
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Organização
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Organização</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar uma nova organização
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Organização</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome da organização"
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinica_veterinaria">Clínica Veterinária</SelectItem>
                    <SelectItem value="empresa_alimentos">Empresa de Alimentos</SelectItem>
                    <SelectItem value="empresa_medicamentos">Empresa de Medicamentos</SelectItem>
                    <SelectItem value="fazenda">Fazenda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="plano">Plano</Label>
                <Select
                  value={formData.plano}
                  onValueChange={(value) => setFormData({ ...formData, plano: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateOrganization} className="w-full">
                Criar Organização
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Organizações</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clínicas</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.filter(org => org.type === 'clinica_veterinaria').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.filter(org => 
                org.type === 'empresa_alimentos' || org.type === 'empresa_medicamentos'
              ).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fazendas</CardTitle>
            <Wheat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.filter(org => org.type === 'fazenda').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Organizações</CardTitle>
          <CardDescription>
            Lista de todas as organizações registradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organização</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Usuários</TableHead>
                  <TableHead>Animais</TableHead>
                  <TableHead>Produtos</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getOrgIcon(org.type)}
                        <span className="font-medium">{org.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTypeLabel(org.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={org.plano === 'enterprise' ? 'default' : 
                                org.plano === 'pro' ? 'secondary' : 'outline'}
                      >
                        {org.plano.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{org._count?.users || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <PawPrint className="h-4 w-4 text-muted-foreground" />
                        <span>{org._count?.animais || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>{org._count?.produtos || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(org.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteOrganization(org.id)}
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