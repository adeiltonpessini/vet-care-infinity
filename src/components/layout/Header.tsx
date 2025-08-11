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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth-context';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  kind: 'estoque' | 'vacinacao';
  severity: 'critical' | 'warning';
  title: string;
  message: string;
  created_at: string;
  due_date?: string;
  meta?: {
    animal_name?: string;
    product_name?: string;
  };
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
      const items: Notification[] = [];

      const today = new Date();
      const in7 = new Date(); in7.setDate(in7.getDate() + 7);
      const in30 = new Date(); in30.setDate(in30.getDate() + 30);

      // Estoque: baixo e perto da validade
      const { data: stockData } = await supabase
        .from('estoque')
        .select('id, nome, quantidade, alerta_minimo, validade')
        .limit(100);

      stockData?.forEach((s: any) => {
        const qtyLow = Number(s.quantidade) <= Number(s.alerta_minimo);
        const validade = s.validade ? new Date(s.validade) : null;
        const nearExpiry = validade ? validade <= in30 : false;
        if (qtyLow) {
          items.push({
            id: `stock-low-${s.id}`,
            kind: 'estoque',
            severity: 'critical',
            title: 'Estoque baixo',
            message: `${s.nome}: ${s.quantidade} (mínimo ${s.alerta_minimo})`,
            created_at: new Date().toISOString(),
            due_date: s.validade || undefined,
            meta: { product_name: s.nome },
          });
        }
        if (nearExpiry) {
          items.push({
            id: `stock-expiry-${s.id}`,
            kind: 'estoque',
            severity: validade && validade < today ? 'critical' : 'warning',
            title: 'Validade próxima',
            message: `${s.nome} ${validade && validade < today ? 'vencido' : 'vence em'} ${s.validade}`,
            created_at: new Date().toISOString(),
            due_date: s.validade || undefined,
            meta: { product_name: s.nome },
          });
        }
      });

      // Vacinas: reforços vencidos ou próximos 7 dias
      const { data: vacs } = await supabase
        .from('vacinacoes')
        .select('id, vacina, reforco_previsto, animal_id')
        .not('reforco_previsto', 'is', null)
        .lte('reforco_previsto', in7.toISOString().split('T')[0])
        .limit(100);

      const animalIds = Array.from(new Set((vacs || []).map((v: any) => v.animal_id).filter(Boolean)));
      let animalMap: Record<string, string> = {};
      if (animalIds.length > 0) {
        const { data: animals } = await supabase
          .from('animais')
          .select('id, nome')
          .in('id', animalIds as string[]);
        animals?.forEach((a: any) => { animalMap[a.id] = a.nome; });
      }

      vacs?.forEach((v: any) => {
        const due = v.reforco_previsto;
        const dueDate = due ? new Date(due) : null;
        const severity: 'critical' | 'warning' = dueDate && dueDate < today ? 'critical' : 'warning';
        items.push({
          id: `vac-${v.id}`,
          kind: 'vacinacao',
          severity,
          title: 'Reforço de vacina',
          message: `${v.vacina} ${severity === 'critical' ? 'atrasado' : 'previsto'} para ${v.reforco_previsto}${v.animal_id ? ` • Animal: ${animalMap[v.animal_id] || ''}` : ''}`,
          created_at: new Date().toISOString(),
          due_date: v.reforco_previsto || undefined,
          meta: { animal_name: v.animal_id ? animalMap[v.animal_id] : undefined },
        });
      });

      setNotifications(items);
      setNotificationCount(items.length);
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