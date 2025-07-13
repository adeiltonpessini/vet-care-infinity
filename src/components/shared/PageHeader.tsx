import { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
}

export function PageHeader({ title, description, icon, badge, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          {icon && <div className="text-primary">{icon}</div>}
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
        {badge && (
          <Badge variant={badge.variant || 'secondary'} className="mt-2">
            {badge.label}
          </Badge>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick} className="hover-scale">
          {action.icon}
          {action.label}
        </Button>
      )}
    </div>
  );
}