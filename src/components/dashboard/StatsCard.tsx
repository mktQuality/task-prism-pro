import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  variant = 'default' 
}: StatsCardProps) => {
  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'success':
        return 'border-success/20 bg-gradient-to-br from-success/5 to-success/10';
      case 'warning':
        return 'border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10';
      case 'destructive':
        return 'border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10';
      default:
        return 'border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10';
    }
  };

  const getIconColor = (variant: string) => {
    switch (variant) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'destructive':
        return 'text-destructive';
      default:
        return 'text-primary';
    }
  };

  return (
    <Card className={cn("relative overflow-hidden", getVariantStyles(variant))}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <span className={cn(
                  "text-sm font-medium",
                  trend.isPositive ? "text-success" : "text-destructive"
                )}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
          </div>
          <div className={cn(
            "p-3 rounded-full",
            getIconColor(variant),
            variant === 'success' && 'bg-success/10',
            variant === 'warning' && 'bg-warning/10',
            variant === 'destructive' && 'bg-destructive/10',
            variant === 'default' && 'bg-primary/10'
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};