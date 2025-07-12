import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

export default function Formulas() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Activity className="h-8 w-8" />
          Fórmulas
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fórmulas</CardTitle>
          <CardDescription>Em desenvolvimento</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Esta seção está sendo desenvolvida.</p>
        </CardContent>
      </Card>
    </div>
  );
}