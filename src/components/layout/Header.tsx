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
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  type: 'low_stock' | 'vaccine_due' | 'appointment' | 'prescription';
  title: string;
  message: string;
  created_at: string;
  animal_name?: string;
  product_name?: string;
}

export function Header() {
  const { userProfile, organization, signOut } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);

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

  useEffect(() => {
    if (organization) {
      loadNotifications();
    }
  }, [organization]);

  const loadNotifications = async () => {
    try {
      const notifications: Notification[] = [];

      // Verificar estoque baixo
      const { data: lowStock } = await supabase
        .from('estoque')
        .select('nome, quantidade, alerta_minimo')
        .filter('quantidade', 'lt', 'alerta_minimo')
        .limit(5);

      if (lowStock) {
        lowStock.forEach(item => {
          notifications.push({
            id: `stock-${item.nome}`,
            type: 'low_stock',
            title: 'Estoque baixo',
            message: `${item.nome} está com apenas ${item.quantidade} unidades (mínimo: ${item.alerta_minimo})`,
            product_name: item.nome,
            created_at: new Date().toISOString()
          });
        });
      }

      // Verificar vacinações pendentes (reforços vencidos ou próximos)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const { data: vaccinesDue } = await supabase
        .from('vacinacoes')
        .select('vacina, reforco_previsto, animais(nome)')
        .not('reforco_previsto', 'is', null)
        .lte('reforco_previsto', nextWeek.toISOString().split('T')[0])
        .limit(5);

      if (vaccinesDue) {
        vaccinesDue.forEach(vaccine => {
          notifications.push({
            id: `vaccine-${vaccine.reforco_previsto}`,
            type: 'vaccine_due',
            title: 'Vacinação pendente',
            message: `Reforço de ${vaccine.vacina} vencendo em ${vaccine.reforco_previsto}`,
            animal_name: vaccine.animais?.nome,
            created_at: new Date().toISOString()
          });
        });
      }

      // Verificar diagnósticos recentes (últimos 3 dias)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const { data: recentDiagnostics } = await supabase
        .from('diagnosticos')
        .select('tipo, descricao, animais(nome), created_at')
        .gte('created_at', threeDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentDiagnostics) {
        recentDiagnostics.forEach(diagnostic => {
          notifications.push({
            id: `diagnostic-${diagnostic.created_at}`,
            type: 'prescription',
            title: 'Novo diagnóstico',
            message: `${diagnostic.tipo} para ${diagnostic.animais?.nome}`,
            animal_name: diagnostic.animais?.nome,
            created_at: diagnostic.created_at
          });
        });
      }

      setNotifications(notifications);
      setNotificationCount(notifications.length);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    return `${Math.floor(diffInHours / 24)} dias atrás`;
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
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Nenhuma notificação no momento
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 p-3">
                    <div className="flex items-center justify-between w-full">
                      <div className="font-medium text-sm">{notification.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatNotificationTime(notification.created_at)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">{notification.message}</div>
                  </DropdownMenuItem>
                ))
              )}
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