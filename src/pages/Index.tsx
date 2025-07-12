import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Stethoscope, 
  Factory, 
  Wheat, 
  CheckCircle, 
  ArrowRight,
  Users,
  BarChart3,
  Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">InfinityVet</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Começar Agora</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Gestão inteligente,<br />
            sustentável e sem limites
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Plataforma SaaS completa para veterinários, empresas do agronegócio e fazendas. 
            Gerencie animais, produtos e operações com tecnologia de ponta.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="text-lg px-8">
              <Link to="/auth">
                Comece Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 border-white/20 text-white hover:bg-white/20">
              Ver Demo
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Gratuito para começar</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Setup em 5 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Suporte especializado</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Uma solução para cada segmento
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Módulos especializados para atender às necessidades específicas do seu negócio
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Clínicas */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Clínicas Veterinárias</CardTitle>
                <CardDescription className="text-base">
                  Gestão completa para veterinários e clínicas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Cadastro de animais com QR Code</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Diagnósticos com IA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Receitas digitais em PDF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Controle de estoque</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Portal do cliente</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  Saiba Mais
                </Button>
              </CardContent>
            </Card>

            {/* Empresas */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Factory className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="text-2xl">Empresas do Agro</CardTitle>
                <CardDescription className="text-base">
                  Rastreamento e métricas de produtos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Catálogo de produtos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Métricas de indicação</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Relatórios regionais</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Análise de mercado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Dashboard executivo</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  Saiba Mais
                </Button>
              </CardContent>
            </Card>

            {/* Fazendas */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wheat className="h-8 w-8 text-warning" />
                </div>
                <CardTitle className="text-2xl">Fazendas & Agro</CardTitle>
                <CardDescription className="text-base">
                  Gestão zootécnica completa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Gestão de lotes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Cartão de vacinação digital</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Eventos zootécnicos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Controle de estoque</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Relatórios MAPA</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  Saiba Mais
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10k+</div>
              <div className="text-muted-foreground">Animais Cadastrados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Organizações Ativas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1M+</div>
              <div className="text-muted-foreground">Receitas Geradas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime Garantido</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Por que escolher o InfinityVet?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tecnologia de ponta com foco na experiência do usuário
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-tenant Seguro</h3>
              <p className="text-muted-foreground">
                Isolamento total entre organizações com segurança de nível empresarial
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analytics Avançado</h3>
              <p className="text-muted-foreground">
                Relatórios inteligentes e dashboards em tempo real para tomada de decisão
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Conformidade Total</h3>
              <p className="text-muted-foreground">
                Atende todas as regulamentações do MAPA e órgãos de controle
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Planos para todos os tamanhos
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Desde freelancers até grandes empresas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Free */}
            <Card>
              <CardHeader className="text-center">
                <Badge variant="secondary" className="w-fit mx-auto mb-2">
                  Gratuito
                </Badge>
                <CardTitle className="text-2xl">Free</CardTitle>
                <div className="text-3xl font-bold">R$ 0</div>
                <CardDescription>por mês</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Até 10 animais</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">2 funcionários</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">5 produtos</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  Começar Grátis
                </Button>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="border-primary">
              <CardHeader className="text-center">
                <Badge className="w-fit mx-auto mb-2 bg-primary">
                  Mais Popular
                </Badge>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="text-3xl font-bold">R$ 99</div>
                <CardDescription>por mês</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Até 100 animais</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">10 funcionários</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">50 produtos</span>
                  </div>
                </div>
                <Button className="w-full">
                  Começar Agora
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card>
              <CardHeader className="text-center">
                <Badge variant="secondary" className="w-fit mx-auto mb-2">
                  Empresarial
                </Badge>
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="text-3xl font-bold">R$ 299</div>
                <CardDescription>por mês</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Até 1000 animais</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">50 funcionários</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">500 produtos</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  Falar com Vendas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-hero text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para revolucionar sua gestão?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Junte-se a centenas de profissionais que já confiam no InfinityVet
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8">
            <Link to="/auth">
              Comece sua jornada gratuita
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">InfinityVet</span>
            </div>
            <div className="text-muted-foreground text-center md:text-right">
              <p>© 2024 InfinityVet. Todos os direitos reservados.</p>
              <p className="text-sm mt-1">Gestão inteligente, sustentável e sem limites.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
