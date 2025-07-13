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
  Crown,
  Building2,
  Factory,
  UserCheck,
  Palette,
  Banknote,
  Plug,
  FileSearch
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
  const { organization, userProfile, user } = useAuth();
  
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
          { title: 'Animais', url: '/vet/animals', icon: PawPrint },
          { title: 'Diagnósticos', url: '/vet/diagnostics', icon: Stethoscope },
          { title: 'Receitas', url: '/vet/prescriptions', icon: FileText },
          { title: 'Indicações', url: '/vet/indicators', icon: TrendingUp },
          { title: 'Fórmulas', url: '/vet/formulas', icon: Activity },
          { title: 'Estoque', url: '/vet/inventory', icon: Package },
          { title: 'Equipe', url: '/vet/team', icon: Users },
        ];
      case 'empresa_alimentos':
      case 'empresa_medicamentos':
        return [
          { title: 'Produtos', url: '/empresa/products', icon: Package },
          { title: 'Indicações', url: '/empresa/indicators', icon: TrendingUp },
          { title: 'Métricas', url: '/empresa/metrics', icon: BarChart3 },
          { title: 'Equipe', url: '/empresa/team', icon: Users },
        ];
      case 'fazenda':
        return [
          { title: 'Lotes', url: '/fazenda/lotes', icon: Wheat },
          { title: 'Animais', url: '/fazenda/animals', icon: PawPrint },
          { title: 'Vacinações', url: '/fazenda/vaccinations', icon: CalendarDays },
          { title: 'Eventos', url: '/fazenda/events', icon: ClipboardList },
          { title: 'Estoque', url: '/fazenda/inventory', icon: Package },
          { title: 'Equipe', url: '/fazenda/team', icon: Users },
        ];
      default:
        return [];
    }
  };

  const orgItems = getOrgSpecificItems();
  const isSuperAdmin = user?.email === 'adeilton.ata@gmail.com';

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
                    <NavLink to="/superadmin" className={getNavCls}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      {!collapsed && <span>Dashboard</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/superadmin/organizations" className={getNavCls}>
                      <Building2 className="mr-2 h-4 w-4" />
                      {!collapsed && <span>Organizações</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/superadmin/users" className={getNavCls}>
                      <Users className="mr-2 h-4 w-4" />
                      {!collapsed && <span>Usuários</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/superadmin/plans" className={getNavCls}>
                      <Banknote className="mr-2 h-4 w-4" />
                      {!collapsed && <span>Planos</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/superadmin/design" className={getNavCls}>
                      <Palette className="mr-2 h-4 w-4" />
                      {!collapsed && <span>Design</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/superadmin/integrations" className={getNavCls}>
                      <Plug className="mr-2 h-4 w-4" />
                      {!collapsed && <span>Integrações</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/superadmin/logs" className={getNavCls}>
                      <FileSearch className="mr-2 h-4 w-4" />
                      {!collapsed && <span>Logs</span>}
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