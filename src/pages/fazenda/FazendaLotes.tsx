import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Wheat, Edit, Trash2, Calendar, Users } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Lote = Tables<'lotes'>;

export default function FazendaLotes() {
  const { organization } = useAuth();
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLote, setEditingLote] = useState<Lote | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    data_inicio: '',
    finalidade: undefined as string | undefined,
    quantidade_animais: '',
    status: 'ativo' as string
  });

  useEffect(() => {
    fetchLotes();
  }, [organization?.id]);

  const fetchLotes = async () => {
    if (!organization?.id) return;

    try {
      const { data, error } = await supabase
        .from('lotes')
        .select('*')
        .eq('org_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLotes(data || []);
    } catch (error) {
      console.error('Erro ao carregar lotes:', error);
      toast({ title: 'Erro', description: 'Erro ao carregar lotes', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;

    try {
      const dataToSubmit = {
        ...formData,
        org_id: organization.id,
        quantidade_animais: formData.quantidade_animais ? parseInt(formData.quantidade_animais) : 0
      };

      if (editingLote) {
        const { error } = await supabase
          .from('lotes')
          .update(dataToSubmit)
          .eq('id', editingLote.id);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Lote atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('lotes')
          .insert(dataToSubmit);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Lote cadastrado com sucesso!' });
      }

      setIsDialogOpen(false);
      setEditingLote(null);
      resetForm();
      fetchLotes();
    } catch (error) {
      console.error('Erro ao salvar lote:', error);
      toast({ title: 'Erro', description: 'Erro ao salvar lote', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      data_inicio: '',
      finalidade: undefined,
      quantidade_animais: '',
      status: 'ativo'
    });
  };

  const handleEdit = (lote: Lote) => {
    setEditingLote(lote);
    setFormData({
      nome: lote.nome,
      data_inicio: lote.data_inicio,
      finalidade: lote.finalidade || undefined,
      quantidade_animais: lote.quantidade_animais?.toString() || '',
      status: lote.status || 'ativo'
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lote?')) return;

    try {
      const { error } = await supabase
        .from('lotes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Lote excluído com sucesso!' });
      fetchLotes();
    } catch (error) {
      console.error('Erro ao excluir lote:', error);
      toast({ title: 'Erro', description: 'Erro ao excluir lote', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'ativo':
        return <Badge variant="default">Ativo</Badge>;
      case 'finalizado':
        return <Badge variant="secondary">Finalizado</Badge>;
      case 'suspenso':
        return <Badge variant="destructive">Suspenso</Badge>;
      default:
        return <Badge variant="outline">Indefinido</Badge>;
    }
  };

  if (loading) {
    return <div className="p-8">Carregando lotes...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lotes de Animais</h1>
          <p className="text-muted-foreground">
            Gerencie os lotes da fazenda
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingLote(null); }}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Lote
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLote ? 'Editar Lote' : 'Novo Lote'}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do lote
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do Lote *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Lote A1, Suínos 2024"
                  required
                />
              </div>

              <div>
                <Label htmlFor="data_inicio">Data de Início *</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="finalidade">Finalidade</Label>
                <Select value={formData.finalidade || ''} onValueChange={(value) => setFormData({ ...formData, finalidade: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a finalidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engorda">Engorda</SelectItem>
                    <SelectItem value="reproducao">Reprodução</SelectItem>
                    <SelectItem value="lactacao">Lactação</SelectItem>
                    <SelectItem value="crescimento">Crescimento</SelectItem>
                    <SelectItem value="terminacao">Terminação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantidade_animais">Quantidade de Animais</Label>
                <Input
                  id="quantidade_animais"
                  type="number"
                  min="0"
                  value={formData.quantidade_animais}
                  onChange={(e) => setFormData({ ...formData, quantidade_animais: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="finalizado">Finalizado</SelectItem>
                    <SelectItem value="suspenso">Suspenso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingLote ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lotes.map((lote) => (
          <Card key={lote.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{lote.nome}</CardTitle>
                  <CardDescription>
                    {getStatusBadge(lote.status)}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(lote)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(lote.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Início: {new Date(lote.data_inicio).toLocaleDateString('pt-BR')}</span>
              </div>
              
              {lote.quantidade_animais && (
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{lote.quantidade_animais} animais</span>
                </div>
              )}

              {lote.finalidade && (
                <div className="text-sm">
                  <span className="font-medium">Finalidade:</span> {lote.finalidade}
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Criado em {new Date(lote.created_at).toLocaleDateString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {lotes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wheat className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum lote cadastrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comece criando seu primeiro lote de animais
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Lote
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}