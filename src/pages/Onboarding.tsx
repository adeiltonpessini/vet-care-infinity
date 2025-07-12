import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Building2, Stethoscope, Factory, Tractor, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type OrganizationType = 'clinica_veterinaria' | 'empresa_alimentos' | 'empresa_medicamentos' | 'fazenda';
type PlanoType = 'free' | 'pro' | 'enterprise';

interface PlanoInfo {
  nome: string;
  preco: string;
  recursos: string[];
  limite_animais: number;
  limite_funcionarios: number;
  limite_produtos: number;
}

const planos: Record<PlanoType, PlanoInfo> = {
  free: {
    nome: "Gratuito",
    preco: "R$ 0/mês",
    recursos: ["Até 10 animais", "Até 2 funcionários", "Suporte básico"],
    limite_animais: 10,
    limite_funcionarios: 2,
    limite_produtos: 5
  },
  pro: {
    nome: "Profissional",
    preco: "R$ 89/mês", 
    recursos: ["Até 100 animais", "Até 10 funcionários", "Relatórios avançados", "Suporte prioritário"],
    limite_animais: 100,
    limite_funcionarios: 10,
    limite_produtos: 50
  },
  enterprise: {
    nome: "Enterprise",
    preco: "R$ 199/mês",
    recursos: ["Animais ilimitados", "Funcionários ilimitados", "Relatórios personalizados", "Suporte 24/7"],
    limite_animais: 999999,
    limite_funcionarios: 999999,
    limite_produtos: 999999
  }
};

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Dados do formulário
  const [organizationType, setOrganizationType] = useState<OrganizationType>('clinica_veterinaria');
  const [organizationName, setOrganizationName] = useState('');
  const [userRole, setUserRole] = useState<'admin' | 'veterinario' | 'colaborador'>('admin');
  const [selectedPlan, setSelectedPlan] = useState<PlanoType>('free');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const getOrgTypeInfo = (type: OrganizationType) => {
    const info = {
      clinica_veterinaria: {
        title: "Clínica Veterinária",
        description: "Gerencie consultas, pacientes e tratamentos veterinários",
        icon: Stethoscope,
        color: "text-emerald-600"
      },
      empresa_alimentos: {
        title: "Empresa de Alimentos", 
        description: "Controle produtos de nutrição animal e vendas",
        icon: Factory,
        color: "text-blue-600"
      },
      empresa_medicamentos: {
        title: "Empresa de Medicamentos",
        description: "Gerencie medicamentos e produtos veterinários",
        icon: Factory,
        color: "text-purple-600"
      },
      fazenda: {
        title: "Fazenda/Propriedade Rural",
        description: "Monitore rebanhos, lotes e eventos zootécnicos",
        icon: Tractor,
        color: "text-green-600"
      }
    };
    return info[type];
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    
    try {
      // 1. Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) {
        toast({
          title: "Erro ao criar conta",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      if (!authData.user) {
        toast({
          title: "Erro inesperado",
          description: "Não foi possível criar a conta. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      // 2. Criar organização
      const selectedPlanInfo = planos[selectedPlan];
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: organizationName,
          type: organizationType,
          plano: selectedPlan,
          limite_animais: selectedPlanInfo.limite_animais,
          limite_funcionarios: selectedPlanInfo.limite_funcionarios,
          limite_produtos: selectedPlanInfo.limite_produtos,
        })
        .select()
        .single();

      if (orgError) {
        toast({
          title: "Erro ao criar organização",
          description: "Não foi possível criar a organização. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      // 3. Atualizar perfil do usuário com org_id
      const { error: updateError } = await supabase
        .from('users')
        .update({
          org_id: orgData.id,
          role: userRole,
        })
        .eq('auth_user_id', authData.user.id);

      if (updateError) {
        console.error('Erro ao atualizar usuário:', updateError);
      }

      // 4. Criar métricas de uso inicial
      const { error: metricsError } = await supabase
        .from('organizacao_metrica_uso')
        .insert({
          org_id: orgData.id,
          total_animais: 0,
          total_funcionarios: 1,
          total_produtos: 0,
        });

      if (metricsError) {
        console.error('Erro ao criar métricas:', metricsError);
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Sua organização foi configurada. Verifique seu email para confirmar a conta.",
      });

      // Redirecionar para login
      navigate('/auth');

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Algo deu errado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Que tipo de organização você tem?</h2>
              <p className="text-muted-foreground">Escolha o tipo que melhor descreve sua atividade</p>
            </div>

            <RadioGroup 
              value={organizationType} 
              onValueChange={(value) => setOrganizationType(value as OrganizationType)}
              className="space-y-4"
            >
              {(Object.keys(planos) as (keyof typeof planos)[]).map((type) => {
                if (type === 'free' || type === 'pro' || type === 'enterprise') return null;
                return null;
              })}
              
              {(['clinica_veterinaria', 'empresa_alimentos', 'empresa_medicamentos', 'fazenda'] as OrganizationType[]).map((type) => {
                const info = getOrgTypeInfo(type);
                const Icon = info.icon;
                return (
                  <div key={type} className="flex items-center space-x-3">
                    <RadioGroupItem value={type} id={type} />
                    <Label 
                      htmlFor={type}
                      className="flex items-center space-x-4 cursor-pointer p-4 rounded-lg border hover:bg-accent transition-colors flex-1"
                    >
                      <Icon className={`h-8 w-8 ${info.color}`} />
                      <div>
                        <div className="font-semibold">{info.title}</div>
                        <div className="text-sm text-muted-foreground">{info.description}</div>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Detalhes da sua organização</h2>
              <p className="text-muted-foreground">Vamos configurar os dados básicos</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="orgName">Nome da organização</Label>
                <Input
                  id="orgName"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Ex: Clínica São Francisco"
                  required
                />
              </div>

              <div>
                <Label htmlFor="userRole">Seu cargo na organização</Label>
                <RadioGroup value={userRole} onValueChange={(value) => setUserRole(value as 'admin' | 'veterinario' | 'colaborador')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin">Administrador/Proprietário</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="veterinario" id="veterinario" />
                    <Label htmlFor="veterinario">Veterinário</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="colaborador" id="colaborador" />
                    <Label htmlFor="colaborador">Colaborador</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Escolha seu plano</h2>
              <p className="text-muted-foreground">Selecione o plano que melhor atende suas necessidades</p>
            </div>

            <RadioGroup value={selectedPlan} onValueChange={(value) => setSelectedPlan(value as PlanoType)}>
              <div className="grid gap-4">
                {(Object.entries(planos) as [PlanoType, PlanoInfo][]).map(([key, plano]) => (
                  <div key={key} className="flex items-start space-x-3">
                    <RadioGroupItem value={key} id={key} className="mt-1" />
                    <Label 
                      htmlFor={key}
                      className="flex-1 cursor-pointer p-4 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{plano.nome}</h3>
                        <span className="font-bold text-primary">{plano.preco}</span>
                      </div>
                      <ul className="space-y-1">
                        {plano.recursos.map((recurso, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            {recurso}
                          </li>
                        ))}
                      </ul>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Criar sua conta</h2>
              <p className="text-muted-foreground">Por último, vamos criar seu acesso ao sistema</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!organizationType;
      case 2:
        return organizationName.trim() !== '' && !!userRole;
      case 3:
        return !!selectedPlan;
      case 4:
        return fullName.trim() !== '' && email.trim() !== '' && password.length >= 6;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-medium">
              <Building2 className="h-9 w-9 text-infinity-blue" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Bem-vindo ao InfinityVet</h1>
          <p className="text-white/80 text-lg">Vamos configurar sua organização em alguns passos simples</p>
        </div>

        <Card className="shadow-strong border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Configuração inicial</CardTitle>
                <CardDescription>Passo {step} de 4</CardDescription>
              </div>
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i <= step ? 'bg-primary' : 'bg-muted'
                    } transition-colors`}
                  />
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderStep()}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>

              {step < 4 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="flex items-center gap-2"
                >
                  Próximo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleCreateAccount}
                  disabled={!canProceed() || loading}
                  className="flex items-center gap-2"
                >
                  {loading ? 'Criando...' : 'Criar conta'}
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-white/60 text-sm mb-2">
            Já tem uma conta?{' '}
            <button
              onClick={() => navigate('/auth')}
              className="text-white hover:underline font-medium"
            >
              Fazer login
            </button>
          </p>
          <p className="text-white/40 text-xs">© 2024 InfinityVet. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}