import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wheat } from 'lucide-react';

export default function Lotes() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Wheat className="h-8 w-8" />
          Gerenciar Lotes
        </h1>
        <p className="text-muted-foreground mt-1">
          Controle de lotes de animais
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lotes</CardTitle>
          <CardDescription>Em desenvolvimento</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Esta seção está sendo desenvolvida.</p>
        </CardContent>
      </Card>
    </div>
  );
}