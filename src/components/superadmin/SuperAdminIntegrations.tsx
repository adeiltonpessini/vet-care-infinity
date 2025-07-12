import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Zap, Settings, Eye, TestTube, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Integration {
  id: string;
  name: string;
  type: string;
  status: boolean;
  api_key?: string;
  endpoint_url?: string;
  config: any;
  last_sync?: string;
  created_at: string;
  updated_at: string;
}

export default function SuperAdminIntegrations() {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    api_key: '',
    endpoint_url: '',
    config: '{}'
  });

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('external_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar as integrações",
          variant: "destructive",
        });
        return;
      }

      setIntegrations(data || []);
    } catch (error) {
      console.error('Erro ao carregar integrações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('external_integrations')
        .update({ status: !currentStatus })
        .eq('id', id);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível alterar o status da integração",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: `Integração ${!currentStatus ? 'ativada' : 'desativada'} com sucesso`,
      });

      loadIntegrations();
    } catch (error) {
      console.error('Erro ao alterar status da integração:', error);
    }
  };

  const handleCreateIntegration = async () => {
    if (!formData.name || !formData.type) {
      toast({
        title: "Erro",
        description: "Nome e tipo são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      let config = {};
      if (formData.config) {
        try {
          config = JSON.parse(formData.config);
        } catch {
          toast({
            title: "Erro",
            description: "Configuração deve ser um JSON válido",
            variant: "destructive",
          });
          return;
        }
      }

      const { error } = await supabase
        .from('external_integrations')
        .insert({
          name: formData.name,
          type: formData.type,
          api_key: formData.api_key || null,
          endpoint_url: formData.endpoint_url || null,
          config,
          status: false
        });

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível criar a integração",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Integração criada com sucesso",
      });

      setIsCreateDialogOpen(false);
      setFormData({
        name: '',
        type: '',
        api_key: '',
        endpoint_url: '',
        config: '{}'
      });
      loadIntegrations();
    } catch (error) {
      console.error('Erro ao criar integração:', error);
    }
  };

  const handleEditIntegration = async () => {
    if (!editingIntegration) return;

    try {
      let config = editingIntegration.config;
      if (typeof config === 'string') {
        try {
          config = JSON.parse(config);
        } catch {
          toast({
            title: "Erro",
            description: "Configuração deve ser um JSON válido",
            variant: "destructive",
          });
          return;
        }
      }

      const { error } = await supabase
        .from('external_integrations')
        .update({
          name: editingIntegration.name,
          type: editingIntegration.type,
          api_key: editingIntegration.api_key,
          endpoint_url: editingIntegration.endpoint_url,
          config
        })
        .eq('id', editingIntegration.id);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a integração",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Integração atualizada com sucesso",
      });

      setIsEditDialogOpen(false);
      setEditingIntegration(null);
      loadIntegrations();
    } catch (error) {
      console.error('Erro ao atualizar integração:', error);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      diagnostico_ia: 'IA Diagnóstico',
      whatsapp: 'WhatsApp Business',
      pagamento: 'Gateway de Pagamento',
      email: 'E-mail Service',
      sms: 'SMS Service'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeBadgeVariant = (type: string): "default" | "destructive" | "secondary" | "outline" => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      diagnostico_ia: 'destructive',
      whatsapp: 'default',
      pagamento: 'secondary',
      email: 'outline',
      sms: 'outline'
    };
    return variants[type] || 'outline';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Integrações Externas
              </CardTitle>
              <CardDescription>
                Gerencie APIs e serviços externos conectados ao sistema
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Integração
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Integração</DialogTitle>
                  <DialogDescription>
                    Configure uma nova integração externa
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: OpenAI GPT-4"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo *</Label>
                    <Input
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      placeholder="Ex: diagnostico_ia"
                    />
                  </div>
                  <div>
                    <Label htmlFor="api_key">API Key</Label>
                    <Input
                      id="api_key"
                      type="password"
                      value={formData.api_key}
                      onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                      placeholder="Chave da API"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endpoint_url">Endpoint URL</Label>
                    <Input
                      id="endpoint_url"
                      value={formData.endpoint_url}
                      onChange={(e) => setFormData({ ...formData, endpoint_url: e.target.value })}
                      placeholder="https://api.exemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="config">Configuração (JSON)</Label>
                    <Textarea
                      id="config"
                      value={formData.config}
                      onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                      placeholder='{"model": "gpt-4", "temperature": 0.7}'
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleCreateIntegration} className="w-full">
                    Criar Integração
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : integrations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma integração encontrada</p>
              <p className="text-sm">Configure a primeira integração externa</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Sync</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {integrations.map((integration) => (
                  <TableRow key={integration.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{integration.name}</div>
                        {integration.endpoint_url && (
                          <div className="text-sm text-muted-foreground">
                            {integration.endpoint_url}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(integration.type)}>
                        {getTypeLabel(integration.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={integration.status}
                          onCheckedChange={() => handleToggleStatus(integration.id, integration.status)}
                        />
                        <Badge variant={integration.status ? 'default' : 'secondary'}>
                          {integration.status ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {integration.last_sync ? (
                        new Date(integration.last_sync).toLocaleString('pt-BR')
                      ) : (
                        <span className="text-muted-foreground">Nunca</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" title="Ver detalhes">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Dialog open={isEditDialogOpen && editingIntegration?.id === integration.id} onOpenChange={(open) => {
                          setIsEditDialogOpen(open);
                          if (!open) setEditingIntegration(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingIntegration({
                                ...integration,
                                config: JSON.stringify(integration.config, null, 2)
                              })}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Configurar Integração</DialogTitle>
                              <DialogDescription>
                                Altere as configurações da integração
                              </DialogDescription>
                            </DialogHeader>
                            {editingIntegration && (
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="edit_name">Nome</Label>
                                  <Input
                                    id="edit_name"
                                    value={editingIntegration.name}
                                    onChange={(e) => setEditingIntegration({
                                      ...editingIntegration,
                                      name: e.target.value
                                    })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit_api_key">API Key</Label>
                                  <Input
                                    id="edit_api_key"
                                    type="password"
                                    value={editingIntegration.api_key || ''}
                                    onChange={(e) => setEditingIntegration({
                                      ...editingIntegration,
                                      api_key: e.target.value
                                    })}
                                    placeholder="Chave da API"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit_endpoint_url">Endpoint URL</Label>
                                  <Input
                                    id="edit_endpoint_url"
                                    value={editingIntegration.endpoint_url || ''}
                                    onChange={(e) => setEditingIntegration({
                                      ...editingIntegration,
                                      endpoint_url: e.target.value
                                    })}
                                    placeholder="https://api.exemplo.com"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit_config">Configuração (JSON)</Label>
                                  <Textarea
                                    id="edit_config"
                                    value={editingIntegration.config as string}
                                    onChange={(e) => setEditingIntegration({
                                      ...editingIntegration,
                                      config: e.target.value
                                    })}
                                    rows={5}
                                  />
                                </div>
                                <Button onClick={handleEditIntegration} className="w-full">
                                  Salvar Configurações
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="outline" title="Testar conexão">
                          <TestTube className="h-4 w-4" />
                        </Button>
                      </div>
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