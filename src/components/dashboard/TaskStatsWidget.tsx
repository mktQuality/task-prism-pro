import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Task } from "@/types/database";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  PlayCircle,
  TrendingUp,
  Users
} from "lucide-react";

interface TaskStatsWidgetProps {
  tasks: Task[];
}

export const TaskStatsWidget = ({ tasks }: TaskStatsWidgetProps) => {
  const now = new Date();
  
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'concluida').length,
    inProgress: tasks.filter(t => t.status === 'em_progresso').length,
    pending: tasks.filter(t => t.status === 'pendente').length,
    overdue: tasks.filter(t => new Date(t.due_date) < now && t.status !== 'concluida').length,
    urgent: tasks.filter(t => t.priority === 'urgente').length,
    projects: tasks.filter(t => t.is_project).length,
    assigned: tasks.filter(t => t.assigned_to).length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const urgentRate = stats.total > 0 ? Math.round((stats.urgent / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Tasks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="flex items-center gap-2 mt-2">
            <Progress value={completionRate} className="flex-1" />
            <span className="text-xs text-muted-foreground">{completionRate}%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.completed} concluídas
          </p>
        </CardContent>
      </Card>

      {/* In Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
          <PlayCircle className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{stats.inProgress}</div>
          <div className="flex items-center gap-1 mt-2">
            <Badge variant="outline" className="text-xs">
              +{stats.pending} pendentes
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Tarefas ativas
          </p>
        </CardContent>
      </Card>

      {/* Overdue & Urgent */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Críticas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
          <div className="flex items-center gap-1 mt-2">
            <Badge variant="destructive" className="text-xs">
              {stats.urgent} urgentes
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Requerem atenção
          </p>
        </CardContent>
      </Card>

      {/* Projects & Assignments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Colaboração</CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.projects}</div>
          <div className="flex items-center gap-1 mt-2">
            <Badge variant="outline" className="text-xs">
              {stats.assigned} delegadas
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Projetos ativos
          </p>
        </CardContent>
      </Card>
    </div>
  );
};