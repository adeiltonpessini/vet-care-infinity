import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Syringe, 
  Plus, 
  Search,
  Calendar,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FazendaVacinacao() {
  const { userProfile } = useAuth();
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVaccinations();
  }, [userProfile?.org_id]);

  const fetchVaccinations = async () => {
    if (!userProfile?.org_id) return;

    try {
      const { data, error } = await supabase
        .from('vacinacoes')
        .select(`
          *,
          animais(nome, especie),
          users(nome)
        `)
        .eq('org_id', userProfile.org_id)
        .order('data_aplicacao', { ascending: false });

      if (error) {
        console.error('Error fetching vaccinations:', error);
        return;
      }

      setVaccinations(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVaccinations = vaccinations.filter(vacc =>
    vacc.vacina.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vacc.animais?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isBoosterDue = (reforcoDate: string) => {
    if (!reforcoDate) return false;
    const today = new Date();
    const boosterDate = new Date(reforcoDate);
    return boosterDate <= today;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Carregando vacinações...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Syringe className="h-8 w-8 text-primary" />
            Controle de Vacinação
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as vacinas dos animais da fazenda
          </p>
        </div>
        <Button asChild>
          <Link to="/fazenda/vacinacao/new">
            <Plus className="h-4 w-4 mr-2" />
            Nova Vacinação
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vacinações Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vaccinations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reforços Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {vaccinations.filter(v => v.reforco_previsto && isBoosterDue(v.reforco_previsto)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vaccinations.filter(v => {
                const vaccDate = new Date(v.data_aplicacao);
                const now = new Date();
                return vaccDate.getMonth() === now.getMonth() && vaccDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por vacina ou animal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vaccinations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredVaccinations.map((vaccination) => (
          <Card key={vaccination.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{vaccination.vacina}</CardTitle>
                  <CardDescription>
                    Animal: {vaccination.animais?.nome} ({vaccination.animais?.especie})
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2">
                  {vaccination.reforco_previsto && isBoosterDue(vaccination.reforco_previsto) && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Reforço Devido
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Data Aplicação:</span>
                    <p className="font-medium">
                      {new Date(vaccination.data_aplicacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  {vaccination.reforco_previsto && (
                    <div>
                      <span className="text-muted-foreground">Reforço Previsto:</span>
                      <p className={`font-medium ${isBoosterDue(vaccination.reforco_previsto) ? 'text-destructive' : ''}`}>
                        {new Date(vaccination.reforco_previsto).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                </div>

                {vaccination.users && (
                  <div>
                    <span className="text-muted-foreground text-sm">Veterinário:</span>
                    <p className="font-medium">{vaccination.users.nome}</p>
                  </div>
                )}

                {vaccination.observacoes && (
                  <div>
                    <span className="text-muted-foreground text-sm">Observações:</span>
                    <p className="text-sm">{vaccination.observacoes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    Agendar Reforço
                  </Button>
                  <Button size="sm" variant="outline">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVaccinations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Syringe className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma vacinação encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Tente buscar com outros termos' : 'Registre a primeira vacinação'}
            </p>
            <Button asChild>
              <Link to="/fazenda/vacinacao/new">
                <Plus className="h-4 w-4 mr-2" />
                Nova Vacinação
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}