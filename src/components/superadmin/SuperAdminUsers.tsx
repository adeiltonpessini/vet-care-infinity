import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Search, Eye, UserX, UserCheck, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  nome: string;
  email: string;
  role: string;
  telefone?: string;
  org_id?: string;
  created_at: string;
  updated_at: string;
  organization?: {
    name: string;
    type: string;
  };
}

export default function SuperAdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          organization:organizations(name, type)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os usuários",
          variant: "destructive",
        });
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChangeUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole as 'superadmin' | 'admin' | 'veterinario' | 'colaborador' | 'vendedor' | 'gerente_produto' })
        .eq('id', userId);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível alterar o papel do usuário",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Papel do usuário alterado com sucesso",
      });

      loadUsers();
    } catch (error) {
      console.error('Erro ao alterar papel do usuário:', error);
    }
  };

  const handleImpersonateUser = async (userId: string, userEmail: string) => {
    if (!confirm(`⚠️ ATENÇÃO: Você está prestes a impersonar o usuário ${userEmail}.\n\nEsta ação será registrada nos logs de auditoria.\n\nDeseja continuar?`)) {
      return;
    }

    try {
      // Log da ação de impersonação
      const { data: currentUser } = await supabase.auth.getUser();
      
      await supabase
        .from('superadmin_logs')
        .insert({
          admin_user_id: currentUser.user?.id || '',
          action: 'impersonate_user',
          target_type: 'user',
          target_id: userId,
          details: {
            target_email: userEmail,
            timestamp: new Date().toISOString(),
            ip_address: 'system'
          }
        });

      toast({
        title: "🔐 Impersonação Simulada",
        description: `Ação registrada nos logs. Em produção, você seria redirecionado para a conta de ${userEmail}.`,
      });

    } catch (error) {
      console.error('Erro ao registrar impersonação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar a impersonação",
        variant: "destructive",
      });
    }
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      superadmin: 'Super Admin',
      admin: 'Administrador',
      veterinario: 'Veterinário',
      colaborador: 'Colaborador',
      vendedor: 'Vendedor',
      gerente_produto: 'Gerente de Produto'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleBadgeVariant = (role: string): "default" | "destructive" | "secondary" | "outline" => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      superadmin: 'destructive',
      admin: 'default',
      veterinario: 'secondary',
      colaborador: 'outline',
      vendedor: 'secondary',
      gerente_produto: 'default'
    };
    return variants[role] || 'outline';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciar Usuários
          </CardTitle>
          <CardDescription>
            Visualize e gerencie todos os usuários do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os papéis</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="veterinario">Veterinário</SelectItem>
                  <SelectItem value="colaborador">Colaborador</SelectItem>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                  <SelectItem value="gerente_produto">Gerente de Produto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabela */}
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum usuário encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Organização</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.nome}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        {user.telefone && (
                          <div className="text-sm text-muted-foreground">{user.telefone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.organization ? (
                        <div>
                          <div className="font-medium">{user.organization.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.organization.type}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Sem organização</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" title="Ver detalhes">
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          title="Impersonar usuário"
                          onClick={() => handleImpersonateUser(user.id, user.email)}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                        
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleChangeUserRole(user.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="superadmin">Super Admin</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="veterinario">Veterinário</SelectItem>
                            <SelectItem value="colaborador">Colaborador</SelectItem>
                            <SelectItem value="vendedor">Vendedor</SelectItem>
                            <SelectItem value="gerente_produto">Gerente</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button size="sm" variant="outline" title="Resetar senha">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        
                        <Button size="sm" variant="outline" title="Desativar usuário">
                          <UserX className="h-4 w-4" />
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