import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, User, Building2, Shield, Key, Mail, Phone, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function Settings() {
  const { userProfile, organization } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    nome: '',
    email: '',
    telefone: ''
  });

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        nome: userProfile.nome || '',
        email: userProfile.email || '',
        telefone: userProfile.telefone || ''
      });
    }
  }, [userProfile]);

  const handleSaveProfile = async () => {
    if (!userProfile) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('users')
        .update({
          nome: profileData.nome,
          telefone: profileData.telefone || null
        })
        .eq('id', userProfile.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'Super Administrador';
      case 'admin':
        return 'Administrador';
      case 'veterinario':
        return 'Veterinário';
      case 'colaborador':
        return 'Colaborador';
      case 'vendedor':
        return 'Vendedor';
      case 'gerente_produto':
        return 'Gerente de Produto';
      default:
        return role;
    }
  };

  const getOrgTypeLabel = (type: string) => {
    switch (type) {
      case 'clinica_veterinaria':
        return 'Clínica Veterinária';
      case 'empresa_alimentos':
        return 'Empresa de Alimentos';
      case 'empresa_medicamentos':
        return 'Empresa de Medicamentos';
      case 'fazenda':
        return 'Fazenda';
      default:
        return type;
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'free':
        return 'Gratuito';
      case 'pro':
        return 'Profissional';
      case 'enterprise':
        return 'Empresarial';
      default:
        return plan;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <SettingsIcon className="h-8 w-8" />
          Configurações
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas informações pessoais e configurações da conta
        </p>
      </div>

      {/* Informações do Perfil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil Pessoal
          </CardTitle>
          <CardDescription>
            Atualize suas informações pessoais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={profileData.nome}
                onChange={(e) => setProfileData({...profileData, nome: e.target.value})}
                placeholder="Seu nome completo"
              />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={profileData.telefone}
                onChange={(e) => setProfileData({...profileData, telefone: e.target.value})}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              value={profileData.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-1">
              O e-mail não pode ser alterado por questões de segurança
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {getRoleLabel(userProfile?.role || '')}
            </Badge>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informações da Organização */}
      {organization && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organização
            </CardTitle>
            <CardDescription>
              Informações da sua organização
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome da Organização</Label>
                <Input value={organization.name} disabled className="bg-muted" />
              </div>
              <div>
                <Label>Tipo</Label>
                <Input value={getOrgTypeLabel(organization.type)} disabled className="bg-muted" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <Label>Plano Atual</Label>
                <div className="mt-1">
                  <Badge className={organization.plano === 'enterprise' ? 'bg-vital-green' : organization.plano === 'pro' ? 'bg-infinity-blue' : 'bg-muted'}>
                    {getPlanLabel(organization.plano)}
                  </Badge>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{organization.limite_animais}</div>
                <div className="text-sm text-muted-foreground">Limite de Animais</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{organization.limite_funcionarios}</div>
                <div className="text-sm text-muted-foreground">Limite de Funcionários</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{organization.limite_produtos}</div>
                <div className="text-sm text-muted-foreground">Limite de Produtos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configurações de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Segurança
          </CardTitle>
          <CardDescription>
            Configurações de segurança da conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">Alterar Senha</div>
              <div className="text-sm text-muted-foreground">
                Atualize sua senha para manter sua conta segura
              </div>
            </div>
            <Button variant="outline" disabled>
              Em Breve
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">Autenticação de Dois Fatores</div>
              <div className="text-sm text-muted-foreground">
                Adicione uma camada extra de segurança à sua conta
              </div>
            </div>
            <Button variant="outline" disabled>
              Em Breve
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Notificações
          </CardTitle>
          <CardDescription>
            Configure como você recebe notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">Alertas de Estoque</div>
              <div className="text-sm text-muted-foreground">
                Receba notificações quando o estoque estiver baixo
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Ativo
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">Lembretes de Vacinação</div>
              <div className="text-sm text-muted-foreground">
                Alertas para vacinações e reforços pendentes
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Ativo
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">Novos Diagnósticos</div>
              <div className="text-sm text-muted-foreground">
                Notificações sobre novos resultados de diagnósticos
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Ativo
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}