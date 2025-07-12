import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Building2, Stethoscope, Factory, Wheat, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';

type OrganizationType = 'clinica' | 'empresa' | 'fazenda';
type PlanoType = 'free' | 'pro' | 'enterprise';

interface PlanoInfo {
  nome: string;
  limite_animais: number;
  limite_funcionarios: number;
  limite_produtos: number;
  mensalidade: number;
  features: string[];
}

const planos: Record<PlanoType, PlanoInfo> = {
  free: {
    nome: 'Gratuito',
    limite_animais: 10,
    limite_funcionarios: 2,
    limite_produtos: 5,
    mensalidade: 0,
    features: ['Funcionalidades básicas', 'Suporte por email', 'Dashboard simples']
  },
  pro: {
    nome: 'Profissional',
    limite_animais: 100,
    limite_funcionarios: 10,
    limite_produtos: 50,
    mensalidade: 99.90,
    features: ['Todas as funcionalidades', 'Relatórios avançados', 'QR Codes', 'Suporte prioritário']
  },
  enterprise: {
    nome: 'Empresarial',
    limite_animais: 1000,
    limite_funcionarios: 50,
    limite_produtos: 500,
    mensalidade: 299.90,
    features: ['Recursos ilimitados', 'API personalizada', 'Suporte 24/7', 'Integrações avançadas']
  }
};

export default function SetupOrganization() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshProfile } = useAuth();

  // Form data
  const [orgType, setOrgType] = useState<OrganizationType>('clinica');
  const [orgName, setOrgName] = useState('');
  const [selectedPlano, setSelectedPlano] = useState<PlanoType>('free');
  const [userRole, setUserRole] = useState<string>('admin');

  const getOrgTypeInfo = (type: OrganizationType) => {
    switch (type) {
      case 'clinica':
        return {
          title: 'Clínica Veterinária',
          description: 'Gestão completa para veterinários e clínicas',
          icon: Stethoscope,
          color: 'text-primary'
        };
      case 'empresa':
        return {
          title: 'Empresa do Agronegócio',
          description: 'Rastreamento e métricas de produtos',
          icon: Factory,
          color: 'text-secondary'
        };
      case 'fazenda':
        return {
          title: 'Fazenda/Agropecuária',
          description: 'Gestão zootécnica completa',
          icon: Wheat,
          color: 'text-warning'
        };
    }
  };

  const handleCreateOrganization = async () => {
    if (!orgName.trim()) {
      setError('Nome da organização é obrigatório');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create organization
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert([{
          name: orgName,
          type: orgType,
          plano: selectedPlano,
          limite_animais: planos[selectedPlano].limite_animais,
          limite_funcionarios: planos[selectedPlano].limite_funcionarios,
          limite_produtos: planos[selectedPlano].limite_produtos,
        }])
        .select()
        .single();

      if (orgError) throw orgError;

      // Update user with organization
      const { error: userError } = await supabase
        .from('users')
        .update({
          org_id: organization.id,
          role: userRole as any
        })
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id);

      if (userError) throw userError;

      // Create usage metrics
      await supabase
        .from('organizacao_metrica_uso')
        .insert([{
          org_id: organization.id,
          total_animais: 0,
          total_funcionarios: 1,
          total_produtos: 0
        }]);

      toast({
        title: 'Organização criada com sucesso!',
        description: `${orgName} foi configurada e está pronta para uso.`
      });

      // Refresh user profile to get new org data
      await refreshProfile();
      
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error creating organization:', err);
      setError(err.message || 'Erro ao criar organização');
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-strong">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Criar Organização</CardTitle>
            <CardDescription>
              Escolha o tipo de organização que melhor representa seu negócio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={orgType}
              onValueChange={(value) => setOrgType(value as OrganizationType)}
              className="space-y-4"
            >
              {(['clinica', 'empresa', 'fazenda'] as OrganizationType[]).map((type) => {
                const info = getOrgTypeInfo(type);
                const Icon = info.icon;
                return (
                  <div key={type} className="flex items-center space-x-2">
                    <RadioGroupItem value={type} id={type} />
                    <Label htmlFor={type} className="flex-1 cursor-pointer">
                      <Card className={`p-4 hover:border-primary/50 transition-colors ${
                        orgType === type ? 'border-primary bg-primary/5' : ''
                      }`}>
                        <div className="flex items-center gap-3">
                          <Icon className={`h-6 w-6 ${info.color}`} />
                          <div>
                            <h3 className="font-semibold">{info.title}</h3>
                            <p className="text-sm text-muted-foreground">{info.description}</p>
                          </div>
                        </div>
                      </Card>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>

            <Button onClick={() => setStep(2)} className="w-full" size="lg">
              Continuar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-strong">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Informações da Organização</CardTitle>
            <CardDescription>
              Complete os dados da sua {getOrgTypeInfo(orgType).title.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="orgName">Nome da Organização</Label>
              <Input
                id="orgName"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder={`Ex: ${orgType === 'clinica' ? 'Clínica PetCare' : orgType === 'empresa' ? 'AgroTech Solutions' : 'Fazenda Santa Maria'}`}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userRole">Seu papel na organização</Label>
              <Select value={userRole} onValueChange={setUserRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  {orgType === 'clinica' && <SelectItem value="vet">Veterinário</SelectItem>}
                  {orgType === 'empresa' && <SelectItem value="empresa">Gestor</SelectItem>}
                  {orgType === 'fazenda' && <SelectItem value="fazendeiro">Fazendeiro</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                Voltar
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-strong">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Escolha seu Plano</CardTitle>
          <CardDescription>
            Selecione o plano que melhor atende às suas necessidades
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {(Object.keys(planos) as PlanoType[]).map((plano) => {
              const info = planos[plano];
              const isSelected = selectedPlano === plano;
              return (
                <Card
                  key={plano}
                  className={`cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/5 shadow-medium' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPlano(plano)}
                >
                  <CardHeader className="text-center">
                    {plano === 'pro' && (
                      <Badge className="w-fit mx-auto mb-2">Mais Popular</Badge>
                    )}
                    <CardTitle>{info.nome}</CardTitle>
                    <div className="text-3xl font-bold">
                      {info.mensalidade === 0 ? 'Grátis' : `R$ ${info.mensalidade.toFixed(2)}`}
                    </div>
                    <CardDescription>
                      {info.mensalidade > 0 && 'por mês'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        <span>Até {info.limite_animais} animais</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        <span>Até {info.limite_funcionarios} funcionários</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        <span>Até {info.limite_produtos} produtos</span>
                      </div>
                      {info.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-secondary" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-4">
            <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
              Voltar
            </Button>
            <Button 
              onClick={handleCreateOrganization} 
              className="flex-1" 
              disabled={loading}
              size="lg"
            >
              {loading ? 'Criando...' : 'Criar Organização'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}