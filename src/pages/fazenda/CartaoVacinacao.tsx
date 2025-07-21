import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  ArrowLeft, 
  Calendar,
  Syringe,
  User,
  Clipboard,
  Download
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Animal {
  id: string;
  nome: string;
  especie: string;
  raca?: string;
  data_nascimento?: string;
  peso?: number;
}

interface Vacinacao {
  id: string;
  vacina: string;
  data_aplicacao: string;
  reforco_previsto?: string;
  observacoes?: string;
  users?: {
    nome: string;
  };
}

interface CartaoVacinacao {
  id: string;
  animal_id: string;
  data_criacao: string;
  observacoes_gerais?: string;
  veterinario_responsavel_id?: string;
  animais: Animal;
  users?: {
    nome: string;
  };
}

export default function CartaoVacinacao() {
  const { animalId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [cartao, setCartao] = useState<CartaoVacinacao | null>(null);
  const [vacinacoes, setVacinacoes] = useState<Vacinacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (animalId) {
      fetchCartaoVacinacao();
    }
  }, [animalId, userProfile?.org_id]);

  const fetchCartaoVacinacao = async () => {
    if (!userProfile?.org_id || !animalId) return;

    try {
      // Buscar ou criar cartão de vacinação
      let { data: cartaoData, error: cartaoError } = await supabase
        .from('cartao_vacinacao')
        .select(`
          *,
          animais(id, nome, especie, raca, data_nascimento, peso),
          users(nome)
        `)
        .eq('animal_id', animalId)
        .eq('org_id', userProfile.org_id)
        .single();

      if (cartaoError && cartaoError.code === 'PGRST116') {
        // Cartão não existe, criar um novo
        const { data: newCartao, error: createError } = await supabase
          .from('cartao_vacinacao')
          .insert([{
            animal_id: animalId,
            org_id: userProfile.org_id,
            veterinario_responsavel_id: userProfile.id
          }])
          .select(`
            *,
            animais(id, nome, especie, raca, data_nascimento, peso),
            users(nome)
          `)
          .single();

        if (createError) throw createError;
        cartaoData = newCartao;
      } else if (cartaoError) {
        throw cartaoError;
      }

      setCartao(cartaoData);

      // Buscar vacinações do animal
      const { data: vacinacoesData, error: vacinacoesError } = await supabase
        .from('vacinacoes')
        .select(`
          *,
          users(nome)
        `)
        .eq('animal_id', animalId)
        .eq('org_id', userProfile.org_id)
        .order('data_aplicacao', { ascending: false });

      if (vacinacoesError) throw vacinacoesError;
      setVacinacoes(vacinacoesData || []);

    } catch (error) {
      console.error('Error fetching vaccination card:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o cartão de vacinação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  const isBoosterDue = (reforcoDate: string) => {
    if (!reforcoDate) return false;
    const today = new Date();
    const boosterDate = new Date(reforcoDate);
    return boosterDate <= today;
  };

  const getIdadeAnimal = (dataNascimento?: string) => {
    if (!dataNascimento) return 'Idade não informada';
    
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    const diffMs = hoje.getTime() - nascimento.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} dias`;
    } else if (diffDays < 365) {
      const meses = Math.floor(diffDays / 30);
      return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
    } else {
      const anos = Math.floor(diffDays / 365);
      const mesesRestantes = Math.floor((diffDays % 365) / 30);
      if (mesesRestantes === 0) {
        return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
      }
      return `${anos}a ${mesesRestantes}m`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Carregando cartão de vacinação...</h2>
        </div>
      </div>
    );
  }

  if (!cartao) {
    return (
      <div className="p-6 text-center">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Cartão não encontrado</h3>
        <Button onClick={() => navigate('/fazenda/vacinacao')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/fazenda/vacinacao')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              Cartão de Vacinação
            </h1>
            <p className="text-muted-foreground">
              Registro completo das vacinações do animal
            </p>
          </div>
        </div>
        <Button onClick={handlePrintCard}>
          <Download className="h-4 w-4 mr-2" />
          Imprimir Cartão
        </Button>
      </div>

      {/* Animal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações do Animal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">{cartao.animais.nome}</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Espécie:</span> {cartao.animais.especie}</p>
                {cartao.animais.raca && (
                  <p><span className="text-muted-foreground">Raça:</span> {cartao.animais.raca}</p>
                )}
                {cartao.animais.data_nascimento && (
                  <p><span className="text-muted-foreground">Idade:</span> {getIdadeAnimal(cartao.animais.data_nascimento)}</p>
                )}
                {cartao.animais.peso && (
                  <p><span className="text-muted-foreground">Peso:</span> {cartao.animais.peso} kg</p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Cartão Criado</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(cartao.data_criacao).toLocaleDateString('pt-BR')}
              </p>
              {cartao.users && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Veterinário:</span> {cartao.users.nome}
                </p>
              )}
            </div>

            <div>
              <h4 className="font-medium mb-2">Resumo</h4>
              <div className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Total de vacinas:</span> {vacinacoes.length}</p>
                <p>
                  <span className="text-muted-foreground">Reforços pendentes:</span> {' '}
                  <span className={vacinacoes.filter(v => v.reforco_previsto && isBoosterDue(v.reforco_previsto)).length > 0 ? 'text-warning font-medium' : ''}>
                    {vacinacoes.filter(v => v.reforco_previsto && isBoosterDue(v.reforco_previsto)).length}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {cartao.observacoes_gerais && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="font-medium mb-2">Observações Gerais</h4>
                <p className="text-sm text-muted-foreground">{cartao.observacoes_gerais}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Vaccination History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Syringe className="h-5 w-5" />
            Histórico de Vacinações
          </CardTitle>
          <CardDescription>
            Registro cronológico de todas as vacinas aplicadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vacinacoes.length === 0 ? (
            <div className="text-center py-8">
              <Syringe className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma vacinação registrada</h3>
              <p className="text-muted-foreground">Este animal ainda não possui registros de vacinação.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vacinacoes.map((vacinacao, index) => (
                <div key={vacinacao.id} className={`border rounded-lg p-4 ${index === 0 ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{vacinacao.vacina}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Aplicada em {new Date(vacinacao.data_aplicacao).toLocaleDateString('pt-BR')}
                        </span>
                        {vacinacao.users && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {vacinacao.users.nome}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {index === 0 && (
                        <Badge variant="outline" className="text-xs">Mais recente</Badge>
                      )}
                      {vacinacao.reforco_previsto && isBoosterDue(vacinacao.reforco_previsto) && (
                        <Badge variant="destructive" className="text-xs">Reforço devido</Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vacinacao.reforco_previsto && (
                      <div>
                        <span className="text-sm text-muted-foreground">Próximo reforço:</span>
                        <p className={`text-sm font-medium ${isBoosterDue(vacinacao.reforco_previsto) ? 'text-destructive' : ''}`}>
                          {new Date(vacinacao.reforco_previsto).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                  </div>

                  {vacinacao.observacoes && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <span className="text-sm text-muted-foreground">Observações:</span>
                      <p className="text-sm mt-1">{vacinacao.observacoes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}