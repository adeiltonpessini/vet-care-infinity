import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DataCardAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  icon?: ReactNode;
}

interface DataCardProps {
  title: string;
  description?: string;
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  };
  children?: ReactNode;
  actions?: DataCardAction[];
  className?: string;
  onClick?: () => void;
}

export function DataCard({ 
  title, 
  description, 
  badge, 
  children, 
  actions, 
  className = '',
  onClick 
}: DataCardProps) {
  return (
    <Card 
      className={`hover:shadow-md transition-all duration-200 animate-scale-in ${onClick ? 'cursor-pointer hover-scale' : ''} ${className}`}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          {badge && (
            <Badge variant={badge.variant} className={badge.className}>
              {badge.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      {(children || actions) && (
        <CardContent>
          {children}
          {actions && actions.length > 0 && (
            <div className="flex gap-2 pt-3 border-t">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant={action.variant || 'outline'}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                  }}
                  className="flex-1"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}