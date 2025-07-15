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
import { FileText, Plus, Download, Eye, Edit, Trash2, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface Animal {
  id: string;
  nome: string;
  especie: string;
}

interface Produto {
  id: string;
  nome: string;
  tipo: string;
  org_id: string;
  organizations?: {
    name: string;
  };
}

interface ReceitaItem {
  id: string;
  medicamento_nome: string;
  dosagem: string;
  frequencia?: string;
  duracao_dias?: number;
  observacoes?: string;
  produto_id?: string;
  produtos?: Produto;
}

interface Receita {
  id: string;
  tipo_receita: string;
  status: string;
  observacoes?: string;
  pdf_url?: string;
  created_at: string;
  animal_id?: string;
  animais?: Animal;
  receita_itens?: ReceitaItem[];
}

export default function VetPrescriptions() {
  const { userProfile, organization } = useAuth();
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingReceita, setEditingReceita] = useState<Receita | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    animal_id: '',
    tipo_receita: 'medicamento',
    observacoes: ''
  });

  const [receitaItens, setReceitaItens] = useState<Omit<ReceitaItem, 'id'>[]>([]);
  const [currentItem, setCurrentItem] = useState({
    medicamento_nome: '',
    dosagem: '',
    frequencia: '',
    duracao_dias: '',
    observacoes: '',
    produto_id: ''
  });

  useEffect(() => {
    loadReceitas();
    loadAnimals();
    loadProdutos();
  }, []);

  const loadReceitas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('receitas')
        .select(`
          *,
          animais(id, nome, especie),
          receita_itens(
            id,
            medicamento_nome,
            dosagem,
            frequencia,
            duracao_dias,
            observacoes,
            produto_id,
            produtos(id, nome, tipo, org_id, organizations(name))
          )
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

  const loadProdutos = async () => {
    try {
      // Buscar produtos de empresas de medicamentos
      const { data, error } = await supabase
        .from('produtos')
        .select(`
          id, nome, tipo, org_id,
          organizations(name)
        `)
        .in('tipo', ['medicamento', 'vacina', 'suplemento'])
        .order('nome');

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      animal_id: '',
      tipo_receita: 'medicamento',
      observacoes: ''
    });
    setReceitaItens([]);
    setEditingReceita(null);
  };

  const addItemToReceita = () => {
    if (!currentItem.medicamento_nome || !currentItem.dosagem) {
      toast({
        title: "Erro",
        description: "Medicamento e dosagem são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const newItem = {
      medicamento_nome: currentItem.medicamento_nome,
      dosagem: currentItem.dosagem,
      frequencia: currentItem.frequencia || undefined,
      duracao_dias: currentItem.duracao_dias ? Number(currentItem.duracao_dias) : undefined,
      observacoes: currentItem.observacoes || undefined,
      produto_id: currentItem.produto_id || undefined
    };

    setReceitaItens([...receitaItens, newItem]);
    setCurrentItem({
      medicamento_nome: '',
      dosagem: '',
      frequencia: '',
      duracao_dias: '',
      observacoes: '',
      produto_id: ''
    });
    setIsProductDialogOpen(false);
  };

  const removeItemFromReceita = (index: number) => {
    setReceitaItens(receitaItens.filter((_, i) => i !== index));
  };

  const selectProduto = (produto: Produto) => {
    setCurrentItem({
      ...currentItem,
      medicamento_nome: produto.nome,
      produto_id: produto.id
    });
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
      
      // Informações das prescrições
      doc.setFontSize(14);
      doc.setTextColor(60, 60, 60);
      doc.text('PRESCRIÇÕES', 20, 90);
      
      let currentY = 100;
      receita.receita_itens?.forEach((item, index) => {
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        doc.text(`${index + 1}. ${item.medicamento_nome}`, 20, currentY);
        doc.text(`   Dosagem: ${item.dosagem}`, 20, currentY + 10);
        if (item.frequencia) {
          doc.text(`   Frequência: ${item.frequencia}`, 20, currentY + 20);
          currentY += 10;
        }
        if (item.duracao_dias) {
          doc.text(`   Duração: ${item.duracao_dias} dias`, 20, currentY + 20);
          currentY += 10;
        }
        if (item.observacoes) {
          doc.text(`   Obs: ${item.observacoes}`, 20, currentY + 20);
          currentY += 10;
        }
        currentY += 30;
      });
      
      // Observações gerais
      if (receita.observacoes) {
        doc.setFontSize(14);
        doc.setTextColor(60, 60, 60);
        doc.text('OBSERVAÇÕES GERAIS', 20, currentY + 10);
        
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        const splitText = doc.splitTextToSize(receita.observacoes, 170);
        doc.text(splitText, 20, currentY + 20);
        currentY += 30;
      }
      
      // Rodapé
      const finalY = currentY + 20;
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
    
    if (receitaItens.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item à receita.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const receitaData = {
        animal_id: formData.animal_id || null,
        tipo_receita: formData.tipo_receita,
        observacoes: formData.observacoes || null,
        org_id: organization?.id,
        veterinario_id: userProfile?.id
      };

      let receitaId: string;

      if (editingReceita) {
        const { error } = await supabase
          .from('receitas')
          .update(receitaData)
          .eq('id', editingReceita.id);

        if (error) throw error;

        // Remover itens antigos
        await supabase
          .from('receita_itens')
          .delete()
          .eq('receita_id', editingReceita.id);

        receitaId = editingReceita.id;
      } else {
        const { data, error } = await supabase
          .from('receitas')
          .insert([receitaData])
          .select()
          .single();

        if (error) throw error;
        receitaId = data.id;
      }

      // Inserir itens da receita
      const itensToInsert = receitaItens.map(item => ({
        ...item,
        receita_id: receitaId
      }));

      const { error: itensError } = await supabase
        .from('receita_itens')
        .insert(itensToInsert);

      if (itensError) throw itensError;

      toast({
        title: "Sucesso",
        description: editingReceita ? "Receita atualizada com sucesso!" : "Receita cadastrada com sucesso!",
      });

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
      tipo_receita: receita.tipo_receita,
      observacoes: receita.observacoes || ''
    });
    setReceitaItens(receita.receita_itens || []);
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
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingReceita ? 'Editar Receita' : 'Nova Receita'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
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
                      <Label htmlFor="tipo_receita">Tipo de Receita</Label>
                      <Select value={formData.tipo_receita} onValueChange={(value) => setFormData({...formData, tipo_receita: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medicamento">Medicamento</SelectItem>
                          <SelectItem value="racao">Ração</SelectItem>
                          <SelectItem value="suplemento">Suplemento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Itens da Receita */}
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Itens da Receita</h3>
                      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Item
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Adicionar Item à Receita</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {/* Seleção de Produtos */}
                            <div>
                              <Label>Produtos Disponíveis</Label>
                              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                                {produtos.map(produto => (
                                  <div 
                                    key={produto.id} 
                                    className="flex justify-between items-center p-2 hover:bg-muted cursor-pointer rounded"
                                    onClick={() => selectProduto(produto)}
                                  >
                                    <div>
                                      <span className="font-medium">{produto.nome}</span>
                                      <Badge variant="outline" className="ml-2">{produto.tipo}</Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {produto.organizations?.name}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="medicamento_nome">Medicamento/Produto *</Label>
                              <Input
                                id="medicamento_nome"
                                value={currentItem.medicamento_nome}
                                onChange={(e) => setCurrentItem({...currentItem, medicamento_nome: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="dosagem">Dosagem *</Label>
                              <Input
                                id="dosagem"
                                value={currentItem.dosagem}
                                onChange={(e) => setCurrentItem({...currentItem, dosagem: e.target.value})}
                                required
                                placeholder="Ex: 1 comprimido de 12 em 12 horas"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="frequencia">Frequência</Label>
                                <Input
                                  id="frequencia"
                                  value={currentItem.frequencia}
                                  onChange={(e) => setCurrentItem({...currentItem, frequencia: e.target.value})}
                                  placeholder="Ex: 2x ao dia"
                                />
                              </div>
                              <div>
                                <Label htmlFor="duracao_dias">Duração (dias)</Label>
                                <Input
                                  id="duracao_dias"
                                  type="number"
                                  min="1"
                                  value={currentItem.duracao_dias}
                                  onChange={(e) => setCurrentItem({...currentItem, duracao_dias: e.target.value})}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="observacoes_item">Observações</Label>
                              <Textarea
                                id="observacoes_item"
                                value={currentItem.observacoes}
                                onChange={(e) => setCurrentItem({...currentItem, observacoes: e.target.value})}
                                rows={2}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button type="button" variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                                Cancelar
                              </Button>
                              <Button type="button" onClick={addItemToReceita}>
                                Adicionar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Lista de Itens */}
                    {receitaItens.length > 0 ? (
                      <div className="space-y-2">
                        {receitaItens.map((item, index) => (
                          <div key={index} className="border rounded p-3 bg-muted/50">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-medium">{item.medicamento_nome}</div>
                                <div className="text-sm text-muted-foreground">
                                  Dosagem: {item.dosagem}
                                  {item.frequencia && ` | Frequência: ${item.frequencia}`}
                                  {item.duracao_dias && ` | Duração: ${item.duracao_dias} dias`}
                                </div>
                                {item.observacoes && (
                                  <div className="text-sm text-muted-foreground mt-1">
                                    Obs: {item.observacoes}
                                  </div>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeItemFromReceita(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        Nenhum item adicionado
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="observacoes">Observações Gerais</Label>
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
                  <TableHead>Tipo</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Status</TableHead>
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
                    <TableCell>
                      <Badge variant="outline">{receita.tipo_receita}</Badge>
                    </TableCell>
                    <TableCell>
                      {receita.receita_itens?.length || 0} item(s)
                    </TableCell>
                    <TableCell>
                      <Badge variant={receita.status === 'ativa' ? 'default' : 'secondary'}>
                        {receita.status}
                      </Badge>
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