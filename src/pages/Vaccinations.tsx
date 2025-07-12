import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Syringe } from 'lucide-react';

export default function Vaccinations() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Syringe className="h-8 w-8" />
          Controle de Vacinação
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie vacinações dos animais
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vacinações</CardTitle>
          <CardDescription>Em desenvolvimento</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Esta seção está sendo desenvolvida.</p>
        </CardContent>
      </Card>
    </div>
  );
}