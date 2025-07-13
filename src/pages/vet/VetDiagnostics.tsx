import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Stethoscope, Plus, Brain, FileText, Eye, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { toast } from '@/hooks/use-toast';

interface Animal {
  id: string;
  nome: string;
  especie: string;
}

interface Diagnostico {
  id: string;
  descricao: string;
  tipo: string;
  confianca_ia?: number;
  modo?: string;
  recomendacoes?: string;
  created_at: string;
  animal_id?: string;
  animais?: Animal;
}

export default function VetDiagnostics() {
  const { userProfile, organization } = useAuth();
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDiagnostico, setEditingDiagnostico] = useState<Diagnostico | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    animal_id: '',
    descricao: '',
    tipo: '',
    modo: '',
    recomendacoes: '',
    confianca_ia: ''
  });

  const tipos = ['clinico', 'laboratorial', 'imagem', 'ia'];
  const modos = ['Manual', 'IA Assistida', 'Automático'];

  useEffect(() => {
    loadDiagnosticos();
    loadAnimals();
  }, []);

  const loadDiagnosticos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('diagnosticos')
        .select(`
          *,
          animais(id, nome, especie)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiagnosticos(data || []);
    } catch (error) {
      console.error('Erro ao carregar diagnósticos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os diagnósticos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAnimals = async () => {
    try {
      const { data, error } = await supabase
        .from('animais')
        .select('id, nome, especie')
        .order('nome');

      if (error) throw error;
      setAnimals(data || []);
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      animal_id: '',
      descricao: '',
      tipo: '',
      modo: '',
      recomendacoes: '',
      confianca_ia: ''
    });
    setEditingDiagnostico(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const diagnosticoData = {
        animal_id: formData.animal_id || null,
        descricao: formData.descricao,
        tipo: formData.tipo as any,
        modo: formData.modo || null,
        recomendacoes: formData.recomendacoes || null,
        confianca_ia: formData.confianca_ia ? Number(formData.confianca_ia) : null,
        org_id: organization?.id,
        veterinario_id: userProfile?.id
      };

      if (editingDiagnostico) {
        const { error } = await supabase
          .from('diagnosticos')
          .update(diagnosticoData)
          .eq('id', editingDiagnostico.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Diagnóstico atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('diagnosticos')
          .insert([diagnosticoData]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Diagnóstico cadastrado com sucesso!",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadDiagnosticos();
    } catch (error) {
      console.error('Erro ao salvar diagnóstico:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o diagnóstico.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (diagnostico: Diagnostico) => {
    setEditingDiagnostico(diagnostico);
    setFormData({
      animal_id: diagnostico.animal_id || '',
      descricao: diagnostico.descricao,
      tipo: diagnostico.tipo,
      modo: diagnostico.modo || '',
      recomendacoes: diagnostico.recomendacoes || '',
      confianca_ia: diagnostico.confianca_ia?.toString() || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este diagnóstico?')) return;

    try {
      const { error } = await supabase
        .from('diagnosticos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Diagnóstico excluído com sucesso!",
      });
      loadDiagnosticos();
    } catch (error) {
      console.error('Erro ao excluir diagnóstico:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o diagnóstico.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Stethoscope className="h-8 w-8" />
          Diagnósticos
        </h1>
        <p className="text-muted-foreground">Gerencie os diagnósticos realizados</p>
      </div>

      {/* Header com Ações */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Diagnósticos Realizados</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Diagnóstico
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingDiagnostico ? 'Editar Diagnóstico' : 'Novo Diagnóstico'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="animal_id">Animal</Label>
                      <Select value={formData.animal_id} onValueChange={(value) => setFormData({...formData, animal_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o animal" />
                        </SelectTrigger>
                        <SelectContent>
                          {animals.map(animal => (
                            <SelectItem key={animal.id} value={animal.id}>
                              {animal.nome} ({animal.especie})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="tipo">Tipo *</Label>
                      <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {tipos.map(tipo => (
                            <SelectItem key={tipo} value={tipo}>
                              {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="modo">Modo</Label>
                      <Select value={formData.modo} onValueChange={(value) => setFormData({...formData, modo: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o modo" />
                        </SelectTrigger>
                        <SelectContent>
                          {modos.map(modo => (
                            <SelectItem key={modo} value={modo}>
                              {modo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="confianca_ia">Confiança IA (%)</Label>
                      <Input
                        id="confianca_ia"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.confianca_ia}
                        onChange={(e) => setFormData({...formData, confianca_ia: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="descricao">Descrição *</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                      required
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="recomendacoes">Recomendações</Label>
                    <Textarea
                      id="recomendacoes"
                      value={formData.recomendacoes}
                      onChange={(e) => setFormData({...formData, recomendacoes: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingDiagnostico ? 'Atualizar' : 'Cadastrar'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Carregando diagnósticos...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Modo</TableHead>
                  <TableHead>Confiança IA</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diagnosticos.map((diagnostico) => (
                  <TableRow key={diagnostico.id}>
                    <TableCell>
                      {diagnostico.animais?.nome || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {diagnostico.tipo.charAt(0).toUpperCase() + diagnostico.tipo.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {diagnostico.descricao}
                    </TableCell>
                    <TableCell>
                      {diagnostico.modo && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {diagnostico.modo === 'IA Assistida' && <Brain className="w-3 h-3" />}
                          {diagnostico.modo}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {diagnostico.confianca_ia ? `${diagnostico.confianca_ia}%` : '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(diagnostico.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(diagnostico)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(diagnostico.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {diagnosticos.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Nenhum diagnóstico encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}