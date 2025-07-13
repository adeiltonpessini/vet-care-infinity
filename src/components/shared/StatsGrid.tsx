import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCard {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

interface StatsGridProps {
  stats: StatCard[];
  columns?: 2 | 3 | 4;
}

export function StatsGrid({ stats, columns = 4 }: StatsGridProps) {
  const getValueColor = (variant?: string) => {
    switch (variant) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'destructive':
        return 'text-red-600';
      default:
        return 'text-foreground';
    }
  };

  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6 animate-fade-in`}>
      {stats.map((stat, index) => (
        <Card key={index} className="hover-scale transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon && (
              <div className="text-muted-foreground">{stat.icon}</div>
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getValueColor(stat.variant)}`}>
              {stat.value}
            </div>
            {stat.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}