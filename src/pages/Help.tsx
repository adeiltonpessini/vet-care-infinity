import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, MessageCircle, FileText, Video, Phone, Mail, ExternalLink, BookOpen } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Help() {
  const { organization, userProfile } = useAuth();

  const faqs = [
    {
      question: "Como cadastrar um novo animal?",
      answer: "Para cadastrar um novo animal, vá até a seção 'Animais' no menu lateral e clique em 'Novo Animal'. Preencha os dados obrigatórios como nome, espécie e peso, e clique em 'Salvar'."
    },
    {
      question: "Como gerar uma receita veterinária?",
      answer: "Acesse a seção 'Receitas' no menu lateral, clique em 'Nova Receita', selecione o animal, preencha o medicamento e dosagem, e clique em 'Cadastrar'. Você pode baixar o PDF da receita clicando no botão de download."
    },
    {
      question: "Como funciona o sistema de estoque?",
      answer: "O sistema de estoque permite gerenciar medicamentos, rações e suplementos. Você pode adicionar produtos, definir alertas de estoque mínimo e acompanhar as movimentações de entrada e saída."
    },
    {
      question: "Como alterar dados da minha conta?",
      answer: "Vá em 'Configurações' no menu lateral e acesse a seção 'Perfil'. Lá você pode alterar seus dados pessoais como nome, email e telefone."
    },
    {
      question: "Como funciona o sistema de QR Code?",
      answer: "Cada animal pode ter um QR Code único gerado automaticamente. Este código pode ser impresso e colado na ficha do animal para acesso rápido aos dados."
    },
    {
      question: "Como interpretar os gráficos do dashboard?",
      answer: "O dashboard mostra estatísticas em tempo real dos animais, receitas emitidas, estoque baixo e diagnósticos. Os gráficos são atualizados automaticamente com dados reais do sistema."
    }
  ];

  const shortcuts = [
    { key: "Ctrl + N", description: "Novo animal" },
    { key: "Ctrl + R", description: "Nova receita" },
    { key: "Ctrl + D", description: "Novo diagnóstico" },
    { key: "Ctrl + /", description: "Buscar" },
    { key: "Esc", description: "Fechar modal" }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <HelpCircle className="h-8 w-8" />
          Ajuda e Suporte
        </h1>
        <p className="text-muted-foreground mt-1">
          Central de ajuda, documentação e suporte técnico
        </p>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5" />
              Chat Online
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-3">
              Converse com nossa equipe em tempo real
            </p>
            <Button className="w-full" size="sm">
              Iniciar Chat
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5" />
              Email
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-3">
              Envie um email para nossa equipe
            </p>
            <Button variant="outline" className="w-full" size="sm" asChild>
              <a href="mailto:suporte@infinityvet.com">
                suporte@infinityvet.com
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5" />
              Telefone
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-3">
              Ligue para nossa central de atendimento
            </p>
            <Button variant="outline" className="w-full" size="sm" asChild>
              <a href="tel:+5511999999999">
                (11) 99999-9999
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Organização</h4>
              <p className="text-sm text-muted-foreground mb-1">
                <strong>Nome:</strong> {organization?.name}
              </p>
              <p className="text-sm text-muted-foreground mb-1">
                <strong>Tipo:</strong> <Badge variant="outline">{organization?.type}</Badge>
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Plano:</strong> <Badge>{organization?.plano}</Badge>
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Usuário</h4>
              <p className="text-sm text-muted-foreground mb-1">
                <strong>Nome:</strong> {userProfile?.nome}
              </p>
              <p className="text-sm text-muted-foreground mb-1">
                <strong>Email:</strong> {userProfile?.email}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Cargo:</strong> <Badge variant="secondary">{userProfile?.role}</Badge>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
          <CardDescription>
            Respostas para as dúvidas mais comuns sobre o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle>Atalhos de Teclado</CardTitle>
          <CardDescription>
            Atalhos para navegar mais rapidamente pelo sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">{shortcut.description}</span>
                <Badge variant="outline" className="font-mono">
                  {shortcut.key}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentação
          </CardTitle>
          <CardDescription>
            Guias completos e tutoriais do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto p-4 justify-start" asChild>
              <a href="#" className="block">
                <div>
                  <div className="font-medium mb-1">Manual do Usuário</div>
                  <div className="text-sm text-muted-foreground">
                    Guia completo de todas as funcionalidades
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto" />
              </a>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 justify-start" asChild>
              <a href="#" className="block">
                <div>
                  <div className="font-medium mb-1">Tutoriais em Vídeo</div>
                  <div className="text-sm text-muted-foreground">
                    Aprenda com demonstrações práticas
                  </div>
                </div>
                <Video className="h-4 w-4 ml-auto" />
              </a>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 justify-start" asChild>
              <a href="#" className="block">
                <div>
                  <div className="font-medium mb-1">API e Integrações</div>
                  <div className="text-sm text-muted-foreground">
                    Documentação técnica para desenvolvedores
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto" />
              </a>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 justify-start" asChild>
              <a href="#" className="block">
                <div>
                  <div className="font-medium mb-1">Changelog</div>
                  <div className="text-sm text-muted-foreground">
                    Novidades e atualizações do sistema
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}