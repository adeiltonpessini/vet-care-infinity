import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

export default function Help() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <HelpCircle className="h-8 w-8" />
          Ajuda e Suporte
        </h1>
        <p className="text-muted-foreground mt-1">
          Central de ajuda e documentação
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suporte</CardTitle>
          <CardDescription>Em desenvolvimento</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Esta seção está sendo desenvolvida.</p>
        </CardContent>
      </Card>
    </div>
  );
}