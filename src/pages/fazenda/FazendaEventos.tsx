import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Plus, 
  Search,
  Baby,
  Heart,
  Skull,
  Syringe,
  Stethoscope,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FazendaEventos() {
  const { userProfile } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [userProfile?.org_id]);

  const fetchEvents = async () => {
    if (!userProfile?.org_id) return;

    try {
      const { data, error } = await supabase
        .from('eventos_zootecnicos')
        .select(`
          *,
          animais(nome, especie)
        `)
        .eq('org_id', userProfile.org_id)
        .order('data_evento', { ascending: false });

      if (error) {
        console.error('Error fetching events:', error);
        return;
      }

      setEvents(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event =>
    event.tipo_evento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.animais?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'parto':
        return <Baby className="h-4 w-4" />;
      case 'inseminacao':
        return <Heart className="h-4 w-4" />;
      case 'morte':
        return <Skull className="h-4 w-4" />;
      case 'vacinacao':
        return <Syringe className="h-4 w-4" />;
      case 'tratamento':
        return <Stethoscope className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'parto':
        return 'bg-green-100 text-green-800';
      case 'inseminacao':
        return 'bg-pink-100 text-pink-800';
      case 'morte':
        return 'bg-red-100 text-red-800';
      case 'vacinacao':
        return 'bg-blue-100 text-blue-800';
      case 'tratamento':
        return 'bg-yellow-100 text-yellow-800';
      case 'doenca':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const eventTypeLabel = {
    parto: 'Parto',
    inseminacao: 'Inseminação',
    morte: 'Morte',
    vacinacao: 'Vacinação',
    tratamento: 'Tratamento',
    doenca: 'Doença'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Carregando eventos...</h2>
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
            <Calendar className="h-8 w-8 text-primary" />
            Eventos Zootécnicos
          </h1>
          <p className="text-muted-foreground mt-1">
            Registre e acompanhe eventos importantes dos animais
          </p>
        </div>
        <Button asChild>
          <Link to="/fazenda/eventos/new">
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {Object.entries(eventTypeLabel).map(([type, label]) => (
          <Card key={type}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {getEventIcon(type)}
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {events.filter(e => e.tipo_evento === type).length}
              </div>
            </CardContent>
          </Card>
        ))}
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
              placeholder="Buscar por tipo de evento ou animal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Events Timeline */}
      <div className="space-y-4">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getEventColor(event.tipo_evento)}`}>
                    {getEventIcon(event.tipo_evento)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {eventTypeLabel[event.tipo_evento as keyof typeof eventTypeLabel]}
                    </CardTitle>
                    <CardDescription>
                      Animal: {event.animais?.nome} ({event.animais?.especie})
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {new Date(event.data_evento).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(event.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {event.observacoes && (
                  <div>
                    <span className="text-muted-foreground text-sm">Observações:</span>
                    <p className="text-sm mt-1">{event.observacoes}</p>
                  </div>
                )}

                {event.dados_json && (
                  <div>
                    <span className="text-muted-foreground text-sm">Dados Adicionais:</span>
                    <div className="mt-1 p-2 bg-muted rounded text-xs">
                      <pre>{JSON.stringify(event.dados_json, null, 2)}</pre>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline">
                    Editar
                  </Button>
                  <Button size="sm" variant="outline">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Tente buscar com outros termos' : 'Registre o primeiro evento zootécnico'}
            </p>
            <Button asChild>
              <Link to="/fazenda/eventos/new">
                <Plus className="h-4 w-4 mr-2" />
                Novo Evento
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}