import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Task } from "@/types/database";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Calendar, User, Flag } from "lucide-react";

interface RecentTasksWidgetProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export const RecentTasksWidget = ({ tasks, onTaskClick }: RecentTasksWidgetProps) => {
  const recentTasks = tasks
    .filter(t => t.status !== 'concluida')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'text-destructive';
      case 'alta': return 'text-warning';
      case 'media': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-status-pending';
      case 'em_progresso': return 'bg-status-progress';
      case 'concluida': return 'bg-status-completed';
      case 'atrasada': return 'bg-status-overdue';
      default: return 'bg-muted';
    }
  };

  if (recentTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Tarefas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nenhuma tarefa encontrada
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Tarefas Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onTaskClick?.(task)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium truncate">{task.title}</h4>
                  <Flag className={`h-3 w-3 ${getPriorityColor(task.priority)}`} />
                </div>
                
                <p className="text-sm text-muted-foreground truncate mb-2">
                  {task.description}
                </p>
                
                <div className="flex items-center gap-2 text-xs">
                  <Badge className={`${getStatusColor(task.status)} text-white`}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                  
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(task.due_date), "dd/MM", { locale: ptBR })}</span>
                  </div>
                  
                  {task.assigned_to_profile && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <Avatar className="h-4 w-4">
                        <AvatarFallback className="text-xs">
                          {task.assigned_to_profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};