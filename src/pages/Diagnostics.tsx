import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope } from 'lucide-react';

export default function Diagnostics() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Stethoscope className="h-8 w-8" />
          Diagnósticos
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Diagnósticos</CardTitle>
          <CardDescription>Em desenvolvimento</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Esta seção está sendo desenvolvida.</p>
        </CardContent>
      </Card>
    </div>
  );
}