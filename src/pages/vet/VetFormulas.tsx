import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Activity, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { toast } from '@/hooks/use-toast';

interface Formula {
  id: string;
  nome: string;
  ingredientes_json?: any;
  custo_estimado?: number;
  created_at: string;
}

export default function VetFormulas() {
  const { organization } = useAuth();
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState<Formula | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    ingredientes: '',
    custo_estimado: ''
  });

  useEffect(() => {
    loadFormulas();
  }, []);

  const loadFormulas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('formulas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFormulas(data || []);
    } catch (error) {
      console.error('Erro ao carregar fórmulas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as fórmulas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      ingredientes: '',
      custo_estimado: ''
    });
    setEditingFormula(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Parse ingredientes como JSON
      let ingredientesJson = null;
      if (formData.ingredientes.trim()) {
        try {
          ingredientesJson = JSON.parse(formData.ingredientes);
        } catch {
          // Se não for JSON válido, salvar como array de strings
          ingredientesJson = formData.ingredientes.split('\n').filter(i => i.trim());
        }
      }

      const formulaData = {
        nome: formData.nome,
        ingredientes_json: ingredientesJson,
        custo_estimado: formData.custo_estimado ? Number(formData.custo_estimado) : null,
        org_id: organization?.id
      };

      if (editingFormula) {
        const { error } = await supabase
          .from('formulas')
          .update(formulaData)
          .eq('id', editingFormula.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Fórmula atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('formulas')
          .insert([formulaData]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Fórmula cadastrada com sucesso!",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadFormulas();
    } catch (error) {
      console.error('Erro ao salvar fórmula:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a fórmula.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (formula: Formula) => {
    setEditingFormula(formula);
    
    let ingredientesText = '';
    if (formula.ingredientes_json) {
      if (Array.isArray(formula.ingredientes_json)) {
        ingredientesText = formula.ingredientes_json.join('\n');
      } else {
        ingredientesText = JSON.stringify(formula.ingredientes_json, null, 2);
      }
    }

    setFormData({
      nome: formula.nome,
      ingredientes: ingredientesText,
      custo_estimado: formula.custo_estimado?.toString() || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta fórmula?')) return;

    try {
      const { error } = await supabase
        .from('formulas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Fórmula excluída com sucesso!",
      });
      loadFormulas();
    } catch (error) {
      console.error('Erro ao excluir fórmula:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a fórmula.",
        variant: "destructive",
      });
    }
  };

  const formatIngredientes = (ingredientes: any) => {
    if (!ingredientes) return 'N/A';
    if (Array.isArray(ingredientes)) {
      return ingredientes.join(', ');
    }
    if (typeof ingredientes === 'object') {
      return Object.keys(ingredientes).join(', ');
    }
    return String(ingredientes);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Activity className="h-8 w-8" />
          Fórmulas Manipuladas
        </h1>
        <p className="text-muted-foreground">Gerencie as fórmulas personalizadas da clínica</p>
      </div>

      {/* Header com Ações */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Fórmulas Cadastradas</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Fórmula
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingFormula ? 'Editar Fórmula' : 'Nova Fórmula'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome da Fórmula *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ingredientes">Ingredientes</Label>
                    <Textarea
                      id="ingredientes"
                      value={formData.ingredientes}
                      onChange={(e) => setFormData({...formData, ingredientes: e.target.value})}
                      rows={6}
                      placeholder="Um ingrediente por linha ou JSON válido"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Digite um ingrediente por linha ou um JSON válido
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="custo_estimado">Custo Estimado (R$)</Label>
                    <Input
                      id="custo_estimado"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.custo_estimado}
                      onChange={(e) => setFormData({...formData, custo_estimado: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingFormula ? 'Atualizar' : 'Cadastrar'}
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
              <span className="ml-2">Carregando fórmulas...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Ingredientes</TableHead>
                  <TableHead>Custo Estimado</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formulas.map((formula) => (
                  <TableRow key={formula.id}>
                    <TableCell className="font-medium">
                      {formula.nome}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {formatIngredientes(formula.ingredientes_json)}
                    </TableCell>
                    <TableCell>
                      {formula.custo_estimado ? 
                        `R$ ${formula.custo_estimado.toFixed(2)}` : 
                        'Não informado'
                      }
                    </TableCell>
                    <TableCell>
                      {new Date(formula.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(formula)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(formula.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {formulas.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Nenhuma fórmula encontrada
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