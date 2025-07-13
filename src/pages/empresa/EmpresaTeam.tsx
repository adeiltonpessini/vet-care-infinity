import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Users, Edit, Trash2, Mail, Phone } from 'lucide-react';
import type { Tables, Enums } from '@/integrations/supabase/types';

type User = Tables<'users'>;
type UserRole = Enums<'user_role'>;

export default function EmpresaTeam() {
  const { organization } = useAuth();
  const [funcionarios, setFuncionarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    role: '' as UserRole
  });

  useEffect(() => {
    fetchFuncionarios();
  }, [organization?.id]);

  const fetchFuncionarios = async () => {
    if (!organization?.id) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('org_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFuncionarios(data || []);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      toast({ title: 'Erro', description: 'Erro ao carregar funcionários', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;

    try {
      const dataToSubmit = {
        ...formData,
        org_id: organization.id
      };

      if (editingUser) {
        const { error } = await supabase
          .from('users')
          .update(dataToSubmit)
          .eq('id', editingUser.id);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Funcionário atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('users')
          .insert(dataToSubmit);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Funcionário cadastrado com sucesso!' });
      }

      setIsDialogOpen(false);
      setEditingUser(null);
      resetForm();
      fetchFuncionarios();
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
      toast({ title: 'Erro', description: 'Erro ao salvar funcionário', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      role: '' as UserRole
    });
  };

  const handleEdit = (funcionario: User) => {
    setEditingUser(funcionario);
    setFormData({
      nome: funcionario.nome,
      email: funcionario.email,
      telefone: funcionario.telefone || '',
      role: funcionario.role
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este funcionário?')) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Funcionário excluído com sucesso!' });
      fetchFuncionarios();
    } catch (error) {
      console.error('Erro ao excluir funcionário:', error);
      toast({ title: 'Erro', description: 'Erro ao excluir funcionário', variant: 'destructive' });
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'gerente_produto': return 'default';
      case 'vendedor': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'gerente_produto': return 'Gerente de Produto';
      case 'vendedor': return 'Vendedor';
      case 'colaborador': return 'Colaborador';
      default: return role;
    }
  };

  if (loading) {
    return <div className="p-8">Carregando equipe...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Equipe</h1>
          <p className="text-muted-foreground">
            Gerencie os funcionários da empresa
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingUser(null); }}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Funcionário' : 'Novo Funcionário'}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do funcionário
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <Label htmlFor="role">Cargo *</Label>
                <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="gerente_produto">Gerente de Produto</SelectItem>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                    <SelectItem value="colaborador">Colaborador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingUser ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {funcionarios.map((funcionario) => (
          <Card key={funcionario.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{funcionario.nome}</CardTitle>
                  <CardDescription>
                    <Badge variant={getRoleBadgeVariant(funcionario.role)}>
                      {getRoleLabel(funcionario.role)}
                    </Badge>
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(funcionario)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(funcionario.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mr-2" />
                {funcionario.email}
              </div>
              {funcionario.telefone && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 mr-2" />
                  {funcionario.telefone}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Cadastrado em {new Date(funcionario.created_at).toLocaleDateString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {funcionarios.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum funcionário cadastrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comece adicionando membros à sua equipe
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Funcionário
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}