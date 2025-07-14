import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, ArrowLeft, Save, TreePine } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Lote {
  id: string;
  nome: string;
}

export default function FazendaCadastroAnimal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState<Date>();
  const [lotes, setLotes] = useState<Lote[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile } = useAuth();

  useEffect(() => {
    fetchLotes();
  }, [userProfile?.org_id]);

  const fetchLotes = async () => {
    if (!userProfile?.org_id) return;

    try {
      const { data, error } = await supabase
        .from('lotes')
        .select('id, nome')
        .eq('org_id', userProfile.org_id)
        .eq('status', 'ativo')
        .order('nome');

      if (error) throw error;
      setLotes(data || []);
    } catch (error) {
      console.error('Error fetching lotes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      const animalData = {
        nome: formData.get('nome') as string,
        especie: formData.get('especie') as any,
        raca: formData.get('raca') as string || null,
        peso: formData.get('peso') ? parseFloat(formData.get('peso') as string) : null,
        data_nascimento: birthDate ? format(birthDate, 'yyyy-MM-dd') : null,
        lote_id: formData.get('lote_id') === 'sem-lote' ? null : formData.get('lote_id') as string || null,
        observacoes: formData.get('observacoes') as string || null,
        org_id: userProfile?.org_id,
      };

      const { data, error } = await supabase
        .from('animais')
        .insert(animalData)
        .select()
        .single();

      if (error) throw error;

      // Gerar QR Code
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=animal-${data.id}`;
      
      await supabase
        .from('animais')
        .update({ qr_code_url: qrCodeUrl })
        .eq('id', data.id);

      toast({
        title: '🎉 Animal cadastrado com sucesso!',
        description: `${animalData.nome} foi adicionado à fazenda com QR Code.`,
      });

      navigate('/fazenda/animais');
    } catch (err: any) {
      console.error('Error creating animal:', err);
      setError(err.message || 'Erro ao cadastrar animal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 animate-fade-in">
          <Button variant="outline" size="icon" asChild className="hover:scale-105 transition-all duration-300">
            <Link to="/fazenda/animais">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Cadastro de Animal
            </h1>
            <p className="text-muted-foreground">
              Adicione um novo animal à sua fazenda
            </p>
          </div>
        </div>

        {/* Formulário */}
        <Card className="backdrop-blur-sm bg-gradient-card border-0 shadow-glass animate-slide-up">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-glow">
              <TreePine className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
              Informações do Animal
            </CardTitle>
            <CardDescription>
              Preencha os dados do animal da fazenda
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6 animate-zoom-in">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informações Básicas */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-sm font-semibold">
                    Nome do Animal *
                  </Label>
                  <Input
                    id="nome"
                    name="nome"
                    placeholder="Ex: Estrela, Touro, Vaquinha..."
                    required
                    className="transition-all duration-300 focus:scale-[1.02] focus:shadow-glow"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="especie" className="text-sm font-semibold">
                    Espécie *
                  </Label>
                  <Select name="especie" required>
                    <SelectTrigger className="transition-all duration-300 focus:scale-[1.02] focus:shadow-glow">
                      <SelectValue placeholder="Selecione a espécie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bovino">🐄 Bovino</SelectItem>
                      <SelectItem value="suino">🐷 Suíno</SelectItem>
                      <SelectItem value="equino">🐴 Equino</SelectItem>
                      <SelectItem value="ovino">🐑 Ovino</SelectItem>
                      <SelectItem value="caprino">🐐 Caprino</SelectItem>
                      <SelectItem value="aves">🐔 Aves</SelectItem>
                      <SelectItem value="canino">🐕 Canino</SelectItem>
                      <SelectItem value="felino">🐱 Felino</SelectItem>
                      <SelectItem value="outros">🦎 Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="raca" className="text-sm font-semibold">
                    Raça
                  </Label>
                  <Input
                    id="raca"
                    name="raca"
                    placeholder="Ex: Nelore, Brahman, Angus..."
                    className="transition-all duration-300 focus:scale-[1.02] focus:shadow-glow"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="peso" className="text-sm font-semibold">
                    Peso (kg)
                  </Label>
                  <Input
                    id="peso"
                    name="peso"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 450.5"
                    className="transition-all duration-300 focus:scale-[1.02] focus:shadow-glow"
                  />
                </div>
              </div>

              {/* Data de Nascimento */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Data de Nascimento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal transition-all duration-300 hover:scale-[1.02] hover:shadow-glow",
                        !birthDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {birthDate ? format(birthDate, "PPP", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={birthDate}
                      onSelect={setBirthDate}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Lote da Fazenda */}
              <div className="bg-gradient-to-r from-secondary/5 to-warning/5 p-6 rounded-lg border border-secondary/20">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  🚜 Informações da Fazenda
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="lote_id" className="text-sm font-semibold">
                    Lote (Opcional)
                  </Label>
                  <Select name="lote_id">
                    <SelectTrigger className="transition-all duration-300 focus:scale-[1.02] focus:shadow-glow">
                      <SelectValue placeholder="Selecione um lote ou deixe vazio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sem-lote">Sem lote</SelectItem>
                      {lotes.map((lote) => (
                        <SelectItem key={lote.id} value={lote.id}>
                          {lote.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes" className="text-sm font-semibold">
                  Observações
                </Label>
                <Textarea
                  id="observacoes"
                  name="observacoes"
                  placeholder="Informações adicionais sobre o animal..."
                  rows={4}
                  className="transition-all duration-300 focus:scale-[1.02] focus:shadow-glow resize-none"
                />
              </div>

              {/* Botões de ação */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 hover:scale-105 transition-all duration-300"
                  asChild
                >
                  <Link to="/fazenda/animais">Cancelar</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-glow"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Cadastrar Animal
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              ✨ Recursos da Fazenda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl">📱</div>
                <h4 className="font-semibold">QR Code Automático</h4>
                <p className="text-sm text-muted-foreground">
                  Código QR gerado automaticamente
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl">🚜</div>
                <h4 className="font-semibold">Gestão por Lotes</h4>
                <p className="text-sm text-muted-foreground">
                  Organize animais por lotes
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl">📊</div>
                <h4 className="font-semibold">Controle Completo</h4>
                <p className="text-sm text-muted-foreground">
                  Histórico e acompanhamento
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}