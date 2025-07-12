import { Building2, Menu, User, LogOut, Settings } from 'lucide-react';
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
import { useAuth } from '@/lib/auth-context';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { userProfile, organization, signOut } = useAuth();

  const getOrgTypeLabel = (type: string) => {
    switch (type) {
      case 'clinica':
        return 'Clínica';
      case 'empresa':
        return 'Empresa';
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
        {onMenuClick && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        <Link to="/" className="flex items-center gap-2">
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
        {userProfile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:block">{userProfile.nome}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userProfile.nome}</p>
                  <p className="text-xs text-muted-foreground">{userProfile.email}</p>
                  <Badge variant="outline" className="w-fit text-xs">
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
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}