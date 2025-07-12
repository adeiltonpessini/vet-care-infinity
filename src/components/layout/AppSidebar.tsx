import { 
  Home,
  PawPrint,
  FileText,
  Package,
  Users,
  Stethoscope,
  Activity,
  BarChart3,
  TrendingUp,
  Wheat,
  CalendarDays,
  ClipboardList,
  Settings,
  HelpCircle,
  Crown
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { organization, userProfile } = useAuth();
  
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted/50";

  // Items específicos por tipo de organização
  const getOrgSpecificItems = () => {
    if (!organization) return [];

    switch (organization.type) {
      case 'clinica_veterinaria':
        return [
          { title: 'Animais', url: '/animals', icon: PawPrint },
          { title: 'Diagnósticos', url: '/diagnostics', icon: Stethoscope },
          { title: 'Receitas', url: '/prescriptions', icon: FileText },
          { title: 'Estoque', url: '/inventory', icon: Package },
          { title: 'Fórmulas', url: '/formulas', icon: Activity },
          { title: 'Equipe', url: '/team', icon: Users },
          { title: 'Relatórios', url: '/reports', icon: BarChart3 },
        ];
      case 'empresa_alimentos':
      case 'empresa_medicamentos':
        return [
          { title: 'Produtos', url: '/products', icon: Package },
          { title: 'Indicações', url: '/indicators', icon: TrendingUp },
          { title: 'Métricas', url: '/metrics', icon: BarChart3 },
          { title: 'Equipe', url: '/team', icon: Users },
          { title: 'Relatórios', url: '/reports', icon: FileText },
        ];
      case 'fazenda':
        return [
          { title: 'Lotes', url: '/lotes', icon: Wheat },
          { title: 'Animais', url: '/animals', icon: PawPrint },
          { title: 'Vacinações', url: '/vaccinations', icon: CalendarDays },
          { title: 'Eventos', url: '/events', icon: ClipboardList },
          { title: 'Estoque', url: '/inventory', icon: Package },
          { title: 'Equipe', url: '/team', icon: Users },
          { title: 'Relatórios', url: '/reports', icon: BarChart3 },
        ];
      default:
        return [];
    }
  };

  const orgItems = getOrgSpecificItems();
  const isSuperAdmin = userProfile?.role === 'superadmin';

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        {/* Main navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/dashboard" className={getNavCls}>
                    <Home className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Organization specific items */}
        {organization && orgItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>
              {organization.type === 'clinica_veterinaria' && 'Clínica Veterinária'}
              {organization.type === 'empresa_alimentos' && 'Empresa de Alimentos'}
              {organization.type === 'empresa_medicamentos' && 'Empresa de Medicamentos'}
              {organization.type === 'fazenda' && 'Fazenda'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {orgItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* SuperAdmin items */}
        {isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              {!collapsed && (
                <>
                  <span>SuperAdmin</span>
                  <Badge variant="destructive" className="text-xs">ADMIN</Badge>
                </>
              )}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin/organizations" className={getNavCls}>
                      <Users className="mr-2 h-4 w-4" />
                      {!collapsed && <span>Organizações</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin/users" className={getNavCls}>
                      <Users className="mr-2 h-4 w-4" />
                      {!collapsed && <span>Usuários</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin/analytics" className={getNavCls}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      {!collapsed && <span>Analytics</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Settings and Help */}
        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/settings" className={getNavCls}>
                    <Settings className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Configurações</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/help" className={getNavCls}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Ajuda</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}