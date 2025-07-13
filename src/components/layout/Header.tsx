import { Building2, User, LogOut, Settings, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/lib/auth-context';
import { Link } from 'react-router-dom';

export function Header() {
  const { userProfile, organization, signOut } = useAuth();

  const getOrgTypeLabel = (type: string) => {
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

  const getPlanoColor = (plano: string) => {
    switch (plano) {
      case 'free':
        return 'bg-muted';
      case 'pro':
        return 'bg-infinity-blue';
      case 'enterprise':
        return 'bg-vital-green';
      default:
        return 'bg-muted';
    }
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-foreground hidden sm:block">
            InfinityVet
          </span>
        </Link>

        {organization && (
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-muted-foreground">|</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{organization.name}</span>
              <Badge variant="secondary" className="text-xs">
                {getOrgTypeLabel(organization.type)}
              </Badge>
              <Badge className={`text-xs text-white ${getPlanoColor(organization.plano)}`}>
                {organization.plano.toUpperCase()}
              </Badge>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Notificações */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-64 overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <div className="font-medium text-sm">Estoque baixo</div>
                <div className="text-xs text-muted-foreground">Ração Premium está com apenas 2 unidades</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <div className="font-medium text-sm">Vacinação pendente</div>
                <div className="text-xs text-muted-foreground">5 animais precisam de reforço esta semana</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <div className="font-medium text-sm">Diagnóstico IA</div>
                <div className="text-xs text-muted-foreground">Novo resultado disponível para animal ID #123</div>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Perfil do usuário */}
        {userProfile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{userProfile.nome}</span>
                  <span className="text-xs text-muted-foreground capitalize">{userProfile.role}</span>
                </div>
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userProfile.nome}</p>
                  <p className="text-xs text-muted-foreground">{userProfile.email}</p>
                  <Badge variant="outline" className="w-fit text-xs capitalize">
                    {userProfile.role}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 text-destructive">
                <LogOut className="h-4 w-4" />
                Sair da Conta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}