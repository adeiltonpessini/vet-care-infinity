import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Plus, 
  Search,
  Mail,
  Phone,
  User,
  Edit,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FazendaTeam() {
  const { userProfile, organization } = useAuth();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeamMembers();
  }, [userProfile?.org_id]);

  const fetchTeamMembers = async () => {
    if (!userProfile?.org_id) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('org_id', userProfile.org_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching team members:', error);
        return;
      }

      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = teamMembers.filter(member =>
    member.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'veterinario':
        return 'Veterinário';
      case 'colaborador':
        return 'Colaborador';
      case 'vendedor':
        return 'Vendedor';
      case 'gerente_produto':
        return 'Gerente de Produto';
      case 'superadmin':
        return 'Super Admin';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-primary text-primary-foreground';
      case 'veterinario':
        return 'bg-green-100 text-green-800';
      case 'colaborador':
        return 'bg-blue-100 text-blue-800';
      case 'vendedor':
        return 'bg-purple-100 text-purple-800';
      case 'gerente_produto':
        return 'bg-orange-100 text-orange-800';
      case 'superadmin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Carregando equipe...</h2>
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
            <Users className="h-8 w-8 text-primary" />
            Equipe da Fazenda
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os funcionários e suas permissões
          </p>
        </div>
        <Button asChild disabled={teamMembers.length >= (organization?.limite_funcionarios || 0)}>
          <Link to="/team/new">
            <Plus className="h-4 w-4 mr-2" />
            Novo Funcionário
          </Link>
        </Button>
      </div>

      {/* Usage Card */}
      <Card>
        <CardHeader>
          <CardTitle>Limite de Funcionários</CardTitle>
          <CardDescription>
            Utilize funcionários de acordo com seu plano
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {teamMembers.length} / {organization?.limite_funcionarios || 0}
              </div>
              <p className="text-sm text-muted-foreground">
                Funcionários cadastrados
              </p>
            </div>
            <div className="w-32">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min((teamMembers.length / (organization?.limite_funcionarios || 1)) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou função..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{member.nome}</CardTitle>
                    <CardDescription>{member.email}</CardDescription>
                  </div>
                </div>
                <Badge className={getRoleColor(member.role)}>
                  {getRoleLabel(member.role)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{member.email}</span>
                  </div>
                  {member.telefone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{member.telefone}</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  Cadastrado em: {new Date(member.created_at).toLocaleDateString('pt-BR')}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  {member.id !== userProfile?.id && (
                    <Button size="sm" variant="outline" className="text-destructive">
                      Remover
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Nenhum funcionário encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Tente buscar com outros termos' : 'Convide o primeiro funcionário para sua fazenda'}
            </p>
            {teamMembers.length < (organization?.limite_funcionarios || 0) && (
              <Button asChild>
                <Link to="/team/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Convidar Funcionário
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {teamMembers.length >= (organization?.limite_funcionarios || 0) && (
        <Card className="border-warning">
          <CardContent className="text-center py-6">
            <div className="text-warning mb-2">
              <AlertTriangle className="h-8 w-8 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Limite de funcionários atingido</h3>
            <p className="text-muted-foreground">
              Você atingiu o limite de {organization?.limite_funcionarios} funcionários do seu plano.
              Faça upgrade para adicionar mais membros à equipe.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}