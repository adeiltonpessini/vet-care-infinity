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
import { FileText, Plus, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface Animal {
  id: string;
  nome: string;
  especie: string;
}

interface Receita {
  id: string;
  medicamento: string;
  dosagem: string;
  duracao_dias?: number;
  observacoes?: string;
  pdf_url?: string;
  created_at: string;
  animal_id?: string;
  animais?: Animal;
}

export default function VetPrescriptions() {
  const { userProfile, organization } = useAuth();
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReceita, setEditingReceita] = useState<Receita | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    animal_id: '',
    medicamento: '',
    dosagem: '',
    duracao_dias: '',
    observacoes: ''
  });

  useEffect(() => {
    loadReceitas();
    loadAnimals();
  }, []);

  const loadReceitas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('receitas')
        .select(`
          *,
          animais(id, nome, especie)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReceitas(data || []);
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as receitas.",
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
      medicamento: '',
      dosagem: '',
      duracao_dias: '',
      observacoes: ''
    });
    setEditingReceita(null);
  };

  const generatePDF = async (receita: Receita) => {
    try {
      const doc = new jsPDF();
      
      // Configurar fonte
      doc.setFont('helvetica');
      
      // Cabeçalho
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('RECEITA VETERINÁRIA', 20, 30);
      
      // Linha separadora
      doc.setLineWidth(0.5);
      doc.line(20, 35, 190, 35);
      
      // Informações do animal
      doc.setFontSize(14);
      doc.setTextColor(60, 60, 60);
      doc.text('DADOS DO ANIMAL', 20, 50);
      
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text(`Animal: ${receita.animais?.nome || 'N/A'}`, 20, 60);
      doc.text(`Espécie: ${receita.animais?.especie || 'N/A'}`, 20, 70);
      
      // Informações da receita
      doc.setFontSize(14);
      doc.setTextColor(60, 60, 60);
      doc.text('PRESCRIÇÃO', 20, 90);
      
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text(`Medicamento: ${receita.medicamento}`, 20, 100);
      doc.text(`Dosagem: ${receita.dosagem}`, 20, 110);
      doc.text(`Duração: ${receita.duracao_dias ? `${receita.duracao_dias} dias` : 'Conforme orientação'}`, 20, 120);
      
      // Observações
      if (receita.observacoes) {
        doc.setFontSize(14);
        doc.setTextColor(60, 60, 60);
        doc.text('OBSERVAÇÕES', 20, 140);
        
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        const splitText = doc.splitTextToSize(receita.observacoes, 170);
        doc.text(splitText, 20, 150);
      }
      
      // Rodapé
      const finalY = receita.observacoes ? 180 : 150;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Data: ${new Date(receita.created_at).toLocaleDateString('pt-BR')}`, 20, finalY);
      doc.text(`Veterinário: ${userProfile?.nome || 'N/A'}`, 20, finalY + 10);
      doc.text(`Organização: ${organization?.name || 'N/A'}`, 20, finalY + 20);
      
      // Salvar PDF
      const fileName = `receita-${receita.animais?.nome || 'animal'}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "PDF gerado com sucesso!",
        description: "A receita foi baixada em formato PDF.",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF da receita.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const receitaData = {
        animal_id: formData.animal_id || null,
        medicamento: formData.medicamento,
        dosagem: formData.dosagem,
        duracao_dias: formData.duracao_dias ? Number(formData.duracao_dias) : null,
        observacoes: formData.observacoes || null,
        org_id: organization?.id,
        veterinario_id: userProfile?.id
      };

      if (editingReceita) {
        const { error } = await supabase
          .from('receitas')
          .update(receitaData)
          .eq('id', editingReceita.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Receita atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('receitas')
          .insert([receitaData]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Receita cadastrada com sucesso!",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadReceitas();
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a receita.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (receita: Receita) => {
    setEditingReceita(receita);
    setFormData({
      animal_id: receita.animal_id || '',
      medicamento: receita.medicamento,
      dosagem: receita.dosagem,
      duracao_dias: receita.duracao_dias?.toString() || '',
      observacoes: receita.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta receita?')) return;

    try {
      const { error } = await supabase
        .from('receitas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Receita excluída com sucesso!",
      });
      loadReceitas();
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a receita.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FileText className="h-8 w-8" />
          Receitas Veterinárias
        </h1>
        <p className="text-muted-foreground">Gerencie as receitas emitidas pela clínica</p>
      </div>

      {/* Header com Ações */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Receitas Emitidas</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Receita
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingReceita ? 'Editar Receita' : 'Nova Receita'}
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
                      <Label htmlFor="duracao_dias">Duração (dias)</Label>
                      <Input
                        id="duracao_dias"
                        type="number"
                        min="1"
                        value={formData.duracao_dias}
                        onChange={(e) => setFormData({...formData, duracao_dias: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="medicamento">Medicamento *</Label>
                    <Input
                      id="medicamento"
                      value={formData.medicamento}
                      onChange={(e) => setFormData({...formData, medicamento: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dosagem">Dosagem *</Label>
                    <Input
                      id="dosagem"
                      value={formData.dosagem}
                      onChange={(e) => setFormData({...formData, dosagem: e.target.value})}
                      required
                      placeholder="Ex: 1 comprimido de 12 em 12 horas"
                    />
                  </div>
                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingReceita ? 'Atualizar' : 'Cadastrar'}
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
              <span className="ml-2">Carregando receitas...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal</TableHead>
                  <TableHead>Medicamento</TableHead>
                  <TableHead>Dosagem</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receitas.map((receita) => (
                  <TableRow key={receita.id}>
                    <TableCell>
                      {receita.animais?.nome || 'N/A'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {receita.medicamento}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {receita.dosagem}
                    </TableCell>
                    <TableCell>
                      {receita.duracao_dias ? `${receita.duracao_dias} dias` : 'Cont.'}
                    </TableCell>
                    <TableCell>
                      {new Date(receita.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generatePDF(receita)}
                          title="Baixar PDF"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(receita)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(receita.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {receitas.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Nenhuma receita encontrada
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