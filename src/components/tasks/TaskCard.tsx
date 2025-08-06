import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Task } from "@/types/database";
import { 
  Calendar, 
  User, 
  Clock, 
  MoreVertical,
  Flag,
  MessageCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TaskCardProps {
  task: Task;
  onTaskClick?: (task: Task) => void;
}

export const TaskCard = ({ task, onTaskClick }: TaskCardProps) => {
  const isOverdue = new Date() > new Date(task.due_date) && task.status !== 'concluida';
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-status-pending text-white';
      case 'em_progresso':
        return 'bg-status-progress text-white';
      case 'concluida':
        return 'bg-status-completed text-white';
      case 'atrasada':
        return 'bg-status-overdue text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente':
        return 'text-destructive border-destructive/20 bg-destructive/10';
      case 'alta':
        return 'text-warning border-warning/20 bg-warning/10';
      case 'media':
        return 'text-primary border-primary/20 bg-primary/10';
      case 'baixa':
        return 'text-muted-foreground border-border bg-muted/50';
      default:
        return 'text-muted-foreground border-border bg-muted/50';
    }
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1",
        isOverdue && "border-destructive/20 bg-destructive/5"
      )}
      onClick={() => onTaskClick?.(task)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="outline" 
                className={cn("text-xs", getPriorityColor(task.priority))}
              >
                <Flag className="h-3 w-3 mr-1" />
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
              <Badge className={getStatusColor(task.status)}>
                {task.status.replace('_', ' ')}
              </Badge>
            </div>
            <h3 className="font-semibold text-sm leading-tight">
              {task.title}
            </h3>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {task.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              Vence em {format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR })}
            </span>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs py-0">
                Atrasada
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {task.assigned_to_profile && (
                <div className="flex items-center gap-1">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {task.assigned_to_profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {task.assigned_to_profile.name}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {task.classification && (
                <Badge variant="outline" className="text-xs">
                  {task.classification.name}
                </Badge>
              )}
              {task.comments.length > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MessageCircle className="h-3 w-3" />
                  <span className="text-xs">{task.comments.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};