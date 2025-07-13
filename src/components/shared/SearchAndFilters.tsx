import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchAndFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filters?: ReactNode;
  title?: string;
}

export function SearchAndFilters({ 
  searchValue, 
  onSearchChange, 
  placeholder = "Buscar...", 
  filters,
  title = "Filtros"
}: SearchAndFiltersProps) {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          {filters && (
            <div className="flex flex-wrap gap-4">
              {filters}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}