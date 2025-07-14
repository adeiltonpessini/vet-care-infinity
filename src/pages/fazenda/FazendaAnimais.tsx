import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  PawPrint, 
  Plus, 
  Search,
  Edit,
  QrCode,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FazendaAnimais() {
  const { userProfile } = useAuth();
  const [animals, setAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAnimals();
  }, [userProfile?.org_id]);

  const fetchAnimals = async () => {
    if (!userProfile?.org_id) return;

    try {
      const { data, error } = await supabase
        .from('animais')
        .select(`
          *,
          lotes(nome)
        `)
        .eq('org_id', userProfile.org_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching animals:', error);
        return;
      }

      setAnimals(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnimals = animals.filter(animal =>
    animal.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.raca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.lotes?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Carregando animais...</h2>
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
            <PawPrint className="h-8 w-8 text-primary" />
            Animais da Fazenda
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os animais da sua fazenda
          </p>
        </div>
        <Button asChild>
          <Link to="/fazenda/animais/new">
            <Plus className="h-4 w-4 mr-2" />
            Novo Animal
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, raça ou lote..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Animals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnimals.map((animal) => (
          <Card key={animal.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{animal.nome}</CardTitle>
                  <CardDescription>
                    {animal.especie} - {animal.raca || 'Raça não informada'}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="capitalize">
                  {animal.especie}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {animal.lotes && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{animal.lotes.nome}</Badge>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Peso:</span>
                    <p className="font-medium">{animal.peso ? `${animal.peso} kg` : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Nascimento:</span>
                    <p className="font-medium">
                      {animal.data_nascimento 
                        ? new Date(animal.data_nascimento).toLocaleDateString('pt-BR')
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>

                {animal.nome_tutor && (
                  <div>
                    <span className="text-muted-foreground text-sm">Tutor:</span>
                    <p className="font-medium">{animal.nome_tutor}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button size="sm" variant="outline">
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAnimals.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <PawPrint className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Nenhum animal encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Tente buscar com outros termos' : 'Cadastre o primeiro animal da sua fazenda'}
            </p>
            <Button asChild>
              <Link to="/fazenda/animais/new">
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Animal
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}