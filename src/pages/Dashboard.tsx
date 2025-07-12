import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  PawPrint, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Building2,
  Stethoscope,
  Factory,
  Wheat
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { userProfile, organization } = useAuth();

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Carregando...</h2>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Bem-vindo ao InfinityVet!</CardTitle>
            <CardDescription>
              Você precisa criar ou entrar em uma organização para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/setup-organization">Criar Organização</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/join-organization">Entrar em Organização</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getOrgIcon = () => {
    switch (organization.type) {
      case 'clinica_veterinaria':
        return <Stethoscope className="h-6 w-6" />;
      case 'empresa_alimentos':
      case 'empresa_medicamentos':
        return <Factory className="h-6 w-6" />;
      case 'fazenda':
        return <Wheat className="h-6 w-6" />;
      default:
        return <Building2 className="h-6 w-6" />;
    }
  };

  const getQuickActions = () => {
    switch (organization.type) {
      case 'clinica_veterinaria':
        return [
          { label: 'Novo Animal', href: '/animals/new', icon: PawPrint },
          { label: 'Nova Receita', href: '/prescriptions/new', icon: Plus },
          { label: 'Diagnóstico', href: '/diagnostics/new', icon: Stethoscope },
        ];
      case 'empresa_alimentos':
      case 'empresa_medicamentos':
        return [
          { label: 'Novo Produto', href: '/products/new', icon: Package },
          { label: 'Ver Indicações', href: '/indicators', icon: TrendingUp },
          { label: 'Relatórios', href: '/reports', icon: Plus },
        ];
      case 'fazenda':
        return [
          { label: 'Novo Lote', href: '/lotes/new', icon: Plus },
          { label: 'Novo Animal', href: '/animals/new', icon: PawPrint },
          { label: 'Vacinação', href: '/vaccinations/new', icon: Plus },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {getOrgIcon()}
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo(a), {userProfile.nome}! Aqui está um resumo da sua {organization.type}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{organization.name}</Badge>
          <Badge className="bg-infinity-blue text-white">
            {organization.plano.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Animais</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Limite: {organization.limite_animais}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Limite: {organization.limite_funcionarios}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {(organization.type === 'empresa_alimentos' || organization.type === 'empresa_medicamentos') ? 'Produtos' : 'Estoque'}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {(organization.type === 'empresa_alimentos' || organization.type === 'empresa_medicamentos')
                ? `Limite: ${organization.limite_produtos}`
                : 'Itens em estoque'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Ações hoje
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as funcionalidades mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getQuickActions().map((action) => (
              <Button
                key={action.href}
                variant="outline"
                asChild
                className="h-20 flex flex-col items-center justify-center gap-2"
              >
                <Link to={action.href}>
                  <action.icon className="h-6 w-6" />
                  {action.label}
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts/Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Alertas e Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum alerta no momento</p>
            <p className="text-sm">
              Configurações de estoque e lembretes aparecerão aqui
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}