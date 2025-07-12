import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SuperAdminLog {
  id: string;
  admin_user_id: string;
  action: string;
  target_type: string;
  target_id?: string;
  details: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export default function SuperAdminLogs() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<SuperAdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterTargetType, setFilterTargetType] = useState<string>('all');

  const loadLogs = async () => {
    setLoading(true);
    try {
      // First get logs without join to avoid relation issues
      const { data, error } = await supabase
        .from('superadmin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os logs",
          variant: "destructive",
        });
        return;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const getActionLabel = (action: string) => {
    const labels = {
      'create': 'Criar',
      'update': 'Atualizar',
      'delete': 'Excluir',
      'view': 'Visualizar',
      'login': 'Login',
      'logout': 'Logout',
      'config_change': 'Alterar Config',
      'user_impersonate': 'Impersonar',
      'plan_change': 'Alterar Plano'
    };
    return labels[action as keyof typeof labels] || action;
  };

  const getActionBadgeVariant = (action: string): "default" | "destructive" | "secondary" | "outline" => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      'create': 'default',
      'update': 'secondary',
      'delete': 'destructive',
      'view': 'outline',
      'login': 'default',
      'logout': 'outline',
      'config_change': 'destructive',
      'user_impersonate': 'destructive',
      'plan_change': 'secondary'
    };
    return variants[action] || 'outline';
  };

  const getTargetTypeLabel = (targetType: string) => {
    const labels = {
      'organization': 'Organização',
      'user': 'Usuário',
      'config': 'Configuração',
      'plan': 'Plano',
      'integration': 'Integração',
      'system': 'Sistema'
    };
    return labels[targetType as keyof typeof labels] || targetType;
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.admin_user_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesTargetType = filterTargetType === 'all' || log.target_type === filterTargetType;
    
    return matchesSearch && matchesAction && matchesTargetType;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Logs de Auditoria
          </CardTitle>
          <CardDescription>
            Histórico de ações realizadas pelos super administradores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as ações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  <SelectItem value="create">Criar</SelectItem>
                  <SelectItem value="update">Atualizar</SelectItem>
                  <SelectItem value="delete">Excluir</SelectItem>
                  <SelectItem value="view">Visualizar</SelectItem>
                  <SelectItem value="config_change">Alterar Config</SelectItem>
                  <SelectItem value="user_impersonate">Impersonar</SelectItem>
                  <SelectItem value="plan_change">Alterar Plano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select value={filterTargetType} onValueChange={setFilterTargetType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="organization">Organização</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="config">Configuração</SelectItem>
                  <SelectItem value="plan">Plano</SelectItem>
                  <SelectItem value="integration">Integração</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabela */}
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum log encontrado</p>
              <p className="text-sm">Os logs de auditoria aparecerão aqui</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Alvo</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">Admin User</div>
                        <div className="text-sm text-muted-foreground">
                          {log.admin_user_id.substring(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {getActionLabel(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {getTargetTypeLabel(log.target_type)}
                        </div>
                        {log.target_id && (
                          <div className="text-sm text-muted-foreground font-mono">
                            {log.target_id.substring(0, 8)}...
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-mono">
                        {log.ip_address || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {Object.keys(log.details || {}).length > 0 ? (
                        <div className="text-sm">
                          <pre className="text-xs bg-muted p-2 rounded max-w-xs overflow-hidden">
                            {JSON.stringify(log.details, null, 2).substring(0, 100)}
                            {JSON.stringify(log.details, null, 2).length > 100 && '...'}
                          </pre>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
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