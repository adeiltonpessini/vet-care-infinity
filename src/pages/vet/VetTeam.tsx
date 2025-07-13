import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Edit, Trash2, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { toast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export default function VetTeam() {
  const { userProfile, organization } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    role: ''
  });

  const roles = [
    { value: 'veterinario', label: 'Veterinário' },
    { value: 'colaborador', label: 'Colaborador' },
    { value: 'admin', label: 'Administrador' }
  ];

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('org_id', organization?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Erro ao carregar equipe:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a equipe.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      role: ''
    });
    setEditingMember(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const memberData = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone || null,
        role: formData.role as any,
        org_id: organization?.id
      };

      if (editingMember) {
        const { error } = await supabase
          .from('users')
          .update(memberData)
          .eq('id', editingMember.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Membro da equipe atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('users')
          .insert([memberData]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Membro da equipe adicionado com sucesso!",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadMembers();
    } catch (error) {
      console.error('Erro ao salvar membro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o membro da equipe.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      nome: member.nome,
      email: member.email,
      telefone: member.telefone || '',
      role: member.role
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este membro da equipe?')) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Membro removido da equipe com sucesso!",
      });
      loadMembers();
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro da equipe.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      'veterinario': { variant: 'default' as const, label: 'Veterinário' },
      'colaborador': { variant: 'secondary' as const, label: 'Colaborador' },
      'admin': { variant: 'destructive' as const, label: 'Administrador' }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || 
                  { variant: 'outline' as const, label: role };

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="h-8 w-8" />
          Equipe da Clínica
        </h1>
        <p className="text-muted-foreground">Gerencie os membros da equipe veterinária</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veterinários</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.filter(m => m.role === 'veterinario').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colaboradores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.filter(m => m.role === 'colaborador').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Membros */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Membros da Equipe</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Membro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingMember ? 'Editar Membro' : 'Novo Membro'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Função *</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a função" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
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
                      {editingMember ? 'Atualizar' : 'Adicionar'}
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
              <span className="ml-2">Carregando equipe...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Data de Entrada</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.nome}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.telefone || '-'}</TableCell>
                    <TableCell>{getRoleBadge(member.role)}</TableCell>
                    <TableCell>
                      {new Date(member.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(member)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(member.id)}
                          disabled={member.id === userProfile?.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {members.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Nenhum membro encontrado
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