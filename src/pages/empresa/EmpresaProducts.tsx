import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Package, Edit, Trash2, Upload, Camera, Brain, Zap } from 'lucide-react';
import type { Tables, Enums } from '@/integrations/supabase/types';

type Produto = Tables<'produtos'>;
type AnimalEspecie = Enums<'animal_especie'>;
type ProdutoTipo = Enums<'produto_tipo'>;

export default function EmpresaProducts() {
  const { organization } = useAuth();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    tipo: '' as ProdutoTipo,
    composicao: '',
    modo_uso: '',
    preco_kg: '',
    especie_alvo: [] as AnimalEspecie[],
    fase_alvo: [] as string[],
    imagem_url: ''
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [extractingNutrition, setExtractingNutrition] = useState(false);

  useEffect(() => {
    fetchProdutos();
  }, [organization?.id]);

  const fetchProdutos = async () => {
    if (!organization?.id) return;

    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('org_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({ title: 'Erro', description: 'Erro ao carregar produtos', variant: 'destructive' });
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
        preco_kg: formData.preco_kg ? parseFloat(formData.preco_kg) : null,
        tipo: formData.tipo as any
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('produtos')
          .update(dataToSubmit)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Produto atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('produtos')
          .insert(dataToSubmit);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Produto cadastrado com sucesso!' });
      }

      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      fetchProdutos();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast({ title: 'Erro', description: 'Erro ao salvar produto', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: '' as any,
      composicao: '',
      modo_uso: '',
      preco_kg: '',
      especie_alvo: [],
      fase_alvo: [],
      imagem_url: ''
    });
    setImageFile(null);
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `produtos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('produtos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('produtos')
        .getPublicUrl(filePath);

      setFormData({ ...formData, imagem_url: publicUrl });
      toast({ title: 'Sucesso', description: 'Imagem carregada com sucesso!' });
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      toast({ title: 'Erro', description: 'Erro ao fazer upload da imagem', variant: 'destructive' });
    } finally {
      setUploadingImage(false);
    }
  };

  const extractNutritionalData = async () => {
    if (!formData.imagem_url) {
      toast({ title: 'Erro', description: 'Carregue uma imagem primeiro', variant: 'destructive' });
      return;
    }

    setExtractingNutrition(true);
    try {
      // Simular extração de dados nutricionais por IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Dados simulados - em produção, seria uma chamada para API de IA
      const extractedData = {
        proteina_bruta: 28.0,
        gordura_bruta: 15.0,
        fibra_bruta: 4.0,
        umidade: 10.0,
        cinzas: 8.0,
        calcio: 1.2,
        fosforo: 1.0,
        energia_metabolizavel: 3500
      };

      // Inserir dados nutricionais no banco
      const { error } = await supabase
        .from('dados_nutricionais')
        .insert({
          produto_id: editingProduct?.id,
          ...extractedData,
          extraido_por_ia: true,
          confianca_ia: 85.5
        });

      if (error) throw error;

      toast({ 
        title: 'Sucesso', 
        description: 'Dados nutricionais extraídos com sucesso!' 
      });
    } catch (error) {
      console.error('Erro ao extrair dados nutricionais:', error);
      toast({ 
        title: 'Erro', 
        description: 'Erro ao extrair dados nutricionais', 
        variant: 'destructive' 
      });
    } finally {
      setExtractingNutrition(false);
    }
  };

  const handleEdit = (produto: Produto) => {
    setEditingProduct(produto);
    setFormData({
      nome: produto.nome,
      tipo: produto.tipo as any,
      composicao: produto.composicao || '',
      modo_uso: produto.modo_uso || '',
      preco_kg: produto.preco_kg?.toString() || '',
      especie_alvo: produto.especie_alvo || [],
      fase_alvo: produto.fase_alvo || [],
      imagem_url: produto.imagem_url || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Produto excluído com sucesso!' });
      fetchProdutos();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({ title: 'Erro', description: 'Erro ao excluir produto', variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="p-8">Carregando produtos...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie seu catálogo de produtos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingProduct(null); }}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do produto
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select value={formData.tipo} onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="racao">Ração</SelectItem>
                      <SelectItem value="suplemento">Suplemento</SelectItem>
                      <SelectItem value="medicamento">Medicamento</SelectItem>
                      <SelectItem value="vacina">Vacina</SelectItem>
                      <SelectItem value="equipamento">Equipamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="composicao">Composição</Label>
                <Textarea
                  id="composicao"
                  value={formData.composicao}
                  onChange={(e) => setFormData({ ...formData, composicao: e.target.value })}
                  placeholder="Descreva a composição do produto"
                />
              </div>

              <div>
                <Label htmlFor="modo_uso">Modo de Uso</Label>
                <Textarea
                  id="modo_uso"
                  value={formData.modo_uso}
                  onChange={(e) => setFormData({ ...formData, modo_uso: e.target.value })}
                  placeholder="Instruções de uso"
                />
              </div>

              <div>
                <Label htmlFor="preco_kg">Preço por Kg (R$)</Label>
                <Input
                  id="preco_kg"
                  type="number"
                  step="0.01"
                  value={formData.preco_kg}
                  onChange={(e) => setFormData({ ...formData, preco_kg: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="imagem">Imagem do Produto</Label>
                <div className="space-y-2">
                  <Input
                    id="imagem"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        handleImageUpload(file);
                      }
                    }}
                  />
                  {formData.imagem_url && (
                    <div className="flex items-center space-x-2">
                      <img 
                        src={formData.imagem_url} 
                        alt="Preview" 
                        className="w-20 h-20 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={extractNutritionalData}
                        disabled={extractingNutrition}
                      >
                        {extractingNutrition ? (
                          <Zap className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Brain className="mr-2 h-4 w-4" />
                        )}
                        {extractingNutrition ? 'Extraindo...' : 'Extrair Dados Nutricionais'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProduct ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produtos.map((produto) => (
          <Card key={produto.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{produto.nome}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary">{produto.tipo}</Badge>
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(produto)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(produto.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {produto.composicao && (
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Composição:</strong> {produto.composicao}
                </p>
              )}
              {produto.preco_kg && (
                <p className="text-sm font-medium">
                  R$ {produto.preco_kg.toFixed(2)}/kg
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {produtos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum produto cadastrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comece cadastrando seu primeiro produto
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Produto
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}