import { useState } from 'react';
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
import { CalendarIcon, Upload, Sparkles, ArrowLeft, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function NewAnimal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState<Date>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { organization } = useAuth();

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
        cpf_tutor: organization?.type === 'clinica_veterinaria' ? formData.get('cpf_tutor') as string : null,
        nome_tutor: organization?.type === 'clinica_veterinaria' ? formData.get('nome_tutor') as string : null,
        lote_id: organization?.type === 'fazenda' ? formData.get('lote_id') as string || null : null,
        observacoes: formData.get('observacoes') as string || null,
      };

      const { data, error } = await supabase
        .from('animais')
        .insert(animalData)
        .select()
        .single();

      if (error) throw error;

      // Simular geração de QR Code (implementar depois)
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=animal-${data.id}`;
      
      await supabase
        .from('animais')
        .update({ qr_code_url: qrCodeUrl })
        .eq('id', data.id);

      toast({
        title: '🎉 Animal cadastrado com sucesso!',
        description: `${animalData.nome} foi adicionado ao sistema com QR Code.`,
      });

      navigate('/animals');
    } catch (err: any) {
      console.error('Error creating animal:', err);
      setError(err.message || 'Erro ao cadastrar animal');
    } finally {
      setLoading(false);
    }
  };

  if (!organization) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header com animação */}
        <div className="flex items-center gap-4 animate-fade-in">
          <Button variant="outline" size="icon" asChild className="hover:scale-105 transition-all duration-300">
            <Link to="/animals">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Novo Animal
            </h1>
            <p className="text-muted-foreground">
              Adicione um novo animal à sua {organization.type === 'clinica_veterinaria' ? 'clínica' : organization.type === 'fazenda' ? 'fazenda' : 'empresa'}
            </p>
          </div>
        </div>

        {/* Formulário Ultra Moderno */}
        <Card className="backdrop-blur-sm bg-gradient-card border-0 shadow-glass animate-slide-up">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-glow">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
              Informações do Animal
            </CardTitle>
            <CardDescription>
              Preencha os dados do animal com cuidado
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
                    placeholder="Ex: Rex, Miau, Bessie..."
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
                      <SelectItem value="canino">🐕 Canino</SelectItem>
                      <SelectItem value="felino">🐱 Felino</SelectItem>
                      <SelectItem value="bovino">🐄 Bovino</SelectItem>
                      <SelectItem value="suino">🐷 Suíno</SelectItem>
                      <SelectItem value="equino">🐴 Equino</SelectItem>
                      <SelectItem value="ovino">🐑 Ovino</SelectItem>
                      <SelectItem value="caprino">🐐 Caprino</SelectItem>
                      <SelectItem value="aves">🐔 Aves</SelectItem>
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
                    placeholder="Ex: Labrador, Siamês, Nelore..."
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
                    placeholder="Ex: 25.5"
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

              {/* Campos específicos por tipo de organização */}
              {organization.type === 'clinica_veterinaria' && (
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-lg border border-primary/20">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    👨‍⚕️ Informações do Tutor
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome_tutor" className="text-sm font-semibold">
                        Nome do Tutor
                      </Label>
                      <Input
                        id="nome_tutor"
                        name="nome_tutor"
                        placeholder="Nome completo do tutor"
                        className="transition-all duration-300 focus:scale-[1.02] focus:shadow-glow"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf_tutor" className="text-sm font-semibold">
                        CPF do Tutor
                      </Label>
                      <Input
                        id="cpf_tutor"
                        name="cpf_tutor"
                        placeholder="000.000.000-00"
                        className="transition-all duration-300 focus:scale-[1.02] focus:shadow-glow"
                      />
                    </div>
                  </div>
                </div>
              )}

              {organization.type === 'fazenda' && (
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
                        <SelectItem value="">Sem lote</SelectItem>
                        {/* TODO: Carregar lotes da fazenda */}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

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

              {/* Upload de foto (placeholder) */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Foto do Animal</Label>
                <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center bg-gradient-to-br from-primary/5 to-secondary/5 hover:border-primary/40 transition-all duration-300 group cursor-pointer">
                  <Upload className="h-12 w-12 text-primary/40 mx-auto mb-4 group-hover:text-primary/60 transition-colors" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Clique para fazer upload da foto
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG até 5MB (Em breve)
                  </p>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 hover:scale-105 transition-all duration-300"
                  asChild
                >
                  <Link to="/animals">Cancelar</Link>
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
              ✨ Recursos Inclusos
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
                <div className="text-2xl">📊</div>
                <h4 className="font-semibold">Histórico Completo</h4>
                <p className="text-sm text-muted-foreground">
                  Acompanhe toda a vida do animal
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl">🔒</div>
                <h4 className="font-semibold">Dados Seguros</h4>
                <p className="text-sm text-muted-foreground">
                  Informações protegidas e privadas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}