import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Plan {
  id: string;
  nome: string;
  mensalidade: number;
  limite_animais: number;
  limite_funcionarios: number;
  limite_produtos: number;
  created_at: string;
}

export default function SuperAdminPlans() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    mensalidade: '',
    limite_animais: '',
    limite_funcionarios: '',
    limite_produtos: ''
  });

  const loadPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .order('mensalidade', { ascending: true });

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os planos",
          variant: "destructive",
        });
        return;
      }

      setPlans(data || []);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleCreatePlan = async () => {
    if (!formData.nome || !formData.mensalidade) {
      toast({
        title: "Erro",
        description: "Nome e mensalidade são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('planos')
        .insert({
          nome: formData.nome,
          mensalidade: parseFloat(formData.mensalidade),
          limite_animais: parseInt(formData.limite_animais) || 0,
          limite_funcionarios: parseInt(formData.limite_funcionarios) || 0,
          limite_produtos: parseInt(formData.limite_produtos) || 0,
        });

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível criar o plano",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Plano criado com sucesso",
      });

      setIsCreateDialogOpen(false);
      setFormData({
        nome: '',
        mensalidade: '',
        limite_animais: '',
        limite_funcionarios: '',
        limite_produtos: ''
      });
      loadPlans();
    } catch (error) {
      console.error('Erro ao criar plano:', error);
    }
  };

  const handleEditPlan = async () => {
    if (!editingPlan) return;

    try {
      const { error } = await supabase
        .from('planos')
        .update({
          nome: editingPlan.nome,
          mensalidade: editingPlan.mensalidade,
          limite_animais: editingPlan.limite_animais,
          limite_funcionarios: editingPlan.limite_funcionarios,
          limite_produtos: editingPlan.limite_produtos,
        })
        .eq('id', editingPlan.id);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o plano",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Plano atualizado com sucesso",
      });

      setIsEditDialogOpen(false);
      setEditingPlan(null);
      loadPlans();
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('planos')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o plano",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Plano excluído com sucesso",
      });

      loadPlans();
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Gerenciar Planos
              </CardTitle>
              <CardDescription>
                Crie e gerencie os planos de assinatura do sistema
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Plano
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Plano</DialogTitle>
                  <DialogDescription>
                    Defina os limites e preço do novo plano
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome do Plano *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Profissional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mensalidade">Mensalidade (R$) *</Label>
                    <Input
                      id="mensalidade"
                      type="number"
                      step="0.01"
                      value={formData.mensalidade}
                      onChange={(e) => setFormData({ ...formData, mensalidade: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="limite_animais">Limite Animais</Label>
                      <Input
                        id="limite_animais"
                        type="number"
                        value={formData.limite_animais}
                        onChange={(e) => setFormData({ ...formData, limite_animais: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="limite_funcionarios">Limite Funcionários</Label>
                      <Input
                        id="limite_funcionarios"
                        type="number"
                        value={formData.limite_funcionarios}
                        onChange={(e) => setFormData({ ...formData, limite_funcionarios: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="limite_produtos">Limite Produtos</Label>
                      <Input
                        id="limite_produtos"
                        type="number"
                        value={formData.limite_produtos}
                        onChange={(e) => setFormData({ ...formData, limite_produtos: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreatePlan} className="w-full">
                    Criar Plano
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum plano encontrado</p>
              <p className="text-sm">Crie o primeiro plano do sistema</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plano</TableHead>
                  <TableHead>Mensalidade</TableHead>
                  <TableHead>Limite Animais</TableHead>
                  <TableHead>Limite Funcionários</TableHead>
                  <TableHead>Limite Produtos</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div className="font-medium">{plan.nome}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">
                        {formatCurrency(plan.mensalidade)}
                      </Badge>
                    </TableCell>
                    <TableCell>{plan.limite_animais}</TableCell>
                    <TableCell>{plan.limite_funcionarios}</TableCell>
                    <TableCell>{plan.limite_produtos}</TableCell>
                    <TableCell>
                      {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog open={isEditDialogOpen && editingPlan?.id === plan.id} onOpenChange={(open) => {
                          setIsEditDialogOpen(open);
                          if (!open) setEditingPlan(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingPlan(plan)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Plano</DialogTitle>
                              <DialogDescription>
                                Altere as informações do plano
                              </DialogDescription>
                            </DialogHeader>
                            {editingPlan && (
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="edit_nome">Nome do Plano</Label>
                                  <Input
                                    id="edit_nome"
                                    value={editingPlan.nome}
                                    onChange={(e) => setEditingPlan({
                                      ...editingPlan,
                                      nome: e.target.value
                                    })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit_mensalidade">Mensalidade (R$)</Label>
                                  <Input
                                    id="edit_mensalidade"
                                    type="number"
                                    step="0.01"
                                    value={editingPlan.mensalidade}
                                    onChange={(e) => setEditingPlan({
                                      ...editingPlan,
                                      mensalidade: parseFloat(e.target.value)
                                    })}
                                  />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <Label htmlFor="edit_limite_animais">Limite Animais</Label>
                                    <Input
                                      id="edit_limite_animais"
                                      type="number"
                                      value={editingPlan.limite_animais}
                                      onChange={(e) => setEditingPlan({
                                        ...editingPlan,
                                        limite_animais: parseInt(e.target.value)
                                      })}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit_limite_funcionarios">Limite Funcionários</Label>
                                    <Input
                                      id="edit_limite_funcionarios"
                                      type="number"
                                      value={editingPlan.limite_funcionarios}
                                      onChange={(e) => setEditingPlan({
                                        ...editingPlan,
                                        limite_funcionarios: parseInt(e.target.value)
                                      })}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit_limite_produtos">Limite Produtos</Label>
                                    <Input
                                      id="edit_limite_produtos"
                                      type="number"
                                      value={editingPlan.limite_produtos}
                                      onChange={(e) => setEditingPlan({
                                        ...editingPlan,
                                        limite_produtos: parseInt(e.target.value)
                                      })}
                                    />
                                  </div>
                                </div>
                                <Button onClick={handleEditPlan} className="w-full">
                                  Salvar Alterações
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeletePlan(plan.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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