import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Edit, Trash2, Search, Eye, Lock, Unlock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Organization {
  id: string;
  name: string;
  type: string;
  plano: string;
  limite_animais: number;
  limite_funcionarios: number;
  limite_produtos: number;
  created_at: string;
  updated_at: string;
}

export default function SuperAdminOrganizations() {
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

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

  useEffect(() => {
    loadOrganizations();
  }, []);

  const handleEditOrganization = async () => {
    if (!editingOrg) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: editingOrg.name,
          type: editingOrg.type,
          plano: editingOrg.plano,
          limite_animais: editingOrg.limite_animais,
          limite_funcionarios: editingOrg.limite_funcionarios,
          limite_produtos: editingOrg.limite_produtos,
        })
        .eq('id', editingOrg.id);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a organização",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Organização atualizada com sucesso",
      });

      setIsEditDialogOpen(false);
      setEditingOrg(null);
      loadOrganizations();
    } catch (error) {
      console.error('Erro ao atualizar organização:', error);
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

  const getTypeLabel = (type: string) => {
    const labels = {
      clinica_veterinaria: 'Clínica Veterinária',
      empresa_alimentos: 'Empresa de Alimentos',
      empresa_medicamentos: 'Empresa de Medicamentos',
      fazenda: 'Fazenda'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getPlanoLabel = (plano: string) => {
    const labels = {
      free: 'Gratuito',
      pro: 'Profissional',
      enterprise: 'Empresarial'
    };
    return labels[plano as keyof typeof labels] || plano;
  };

  const getPlanoBadgeVariant = (plano: string): "default" | "destructive" | "secondary" | "outline" => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      free: 'outline',
      pro: 'default',
      enterprise: 'destructive'
    };
    return variants[plano] || 'default';
  };

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || org.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Gerenciar Organizações
          </CardTitle>
          <CardDescription>
            Visualize e gerencie todas as organizações do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar organizações..."
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
                  <SelectItem value="clinica_veterinaria">Clínica Veterinária</SelectItem>
                  <SelectItem value="empresa_alimentos">Empresa de Alimentos</SelectItem>
                  <SelectItem value="empresa_medicamentos">Empresa de Medicamentos</SelectItem>
                  <SelectItem value="fazenda">Fazenda</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabela */}
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : filteredOrganizations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma organização encontrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Limites</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div className="font-medium">{org.name}</div>
                      <div className="text-sm text-muted-foreground">{org.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getTypeLabel(org.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPlanoBadgeVariant(org.plano)}>
                        {getPlanoLabel(org.plano)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Animais: {org.limite_animais}</div>
                        <div>Funcionários: {org.limite_funcionarios}</div>
                        <div>Produtos: {org.limite_produtos}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(org.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Dialog open={isEditDialogOpen && editingOrg?.id === org.id} onOpenChange={(open) => {
                          setIsEditDialogOpen(open);
                          if (!open) setEditingOrg(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingOrg(org)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Organização</DialogTitle>
                              <DialogDescription>
                                Altere as informações da organização
                              </DialogDescription>
                            </DialogHeader>
                            {editingOrg && (
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="name">Nome</Label>
                                  <Input
                                    id="name"
                                    value={editingOrg.name}
                                    onChange={(e) => setEditingOrg({
                                      ...editingOrg,
                                      name: e.target.value
                                    })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="type">Tipo</Label>
                                  <Select
                                    value={editingOrg.type}
                                    onValueChange={(value) => setEditingOrg({
                                      ...editingOrg,
                                      type: value
                                    })}
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
                                    value={editingOrg.plano}
                                    onValueChange={(value) => setEditingOrg({
                                      ...editingOrg,
                                      plano: value
                                    })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="free">Gratuito</SelectItem>
                                      <SelectItem value="pro">Profissional</SelectItem>
                                      <SelectItem value="enterprise">Empresarial</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <Label htmlFor="limite_animais">Limite Animais</Label>
                                    <Input
                                      id="limite_animais"
                                      type="number"
                                      value={editingOrg.limite_animais}
                                      onChange={(e) => setEditingOrg({
                                        ...editingOrg,
                                        limite_animais: parseInt(e.target.value)
                                      })}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="limite_funcionarios">Limite Funcionários</Label>
                                    <Input
                                      id="limite_funcionarios"
                                      type="number"
                                      value={editingOrg.limite_funcionarios}
                                      onChange={(e) => setEditingOrg({
                                        ...editingOrg,
                                        limite_funcionarios: parseInt(e.target.value)
                                      })}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="limite_produtos">Limite Produtos</Label>
                                    <Input
                                      id="limite_produtos"
                                      type="number"
                                      value={editingOrg.limite_produtos}
                                      onChange={(e) => setEditingOrg({
                                        ...editingOrg,
                                        limite_produtos: parseInt(e.target.value)
                                      })}
                                    />
                                  </div>
                                </div>
                                <Button onClick={handleEditOrganization} className="w-full">
                                  Salvar Alterações
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
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