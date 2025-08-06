import { StatsCard } from "./StatsCard";
import { TaskCard } from "../tasks/TaskCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  Users,
  TrendingUp,
  Calendar,
  Plus
} from "lucide-react";
import { Task } from "@/types/task";

interface DashboardViewProps {
  tasks: Task[];
}

export const DashboardView = ({ tasks }: DashboardViewProps) => {
  const completedTasks = tasks.filter(t => t.status === 'concluida').length;
  const pendingTasks = tasks.filter(t => t.status === 'pendente').length;
  const overdueTasks = tasks.filter(t => new Date() > t.dueDate && t.status !== 'concluida').length;
  const urgentTasks = tasks.filter(t => t.priority === 'urgente').length;

  const recentTasks = tasks
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const upcomingTasks = tasks
    .filter(t => t.status !== 'concluida')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do seu sistema de tarefas
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Tarefas Concluídas"
          value={completedTasks}
          icon={CheckSquare}
          variant="success"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Tarefas Pendentes"
          value={pendingTasks}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="Tarefas Atrasadas"
          value={overdueTasks}
          icon={AlertTriangle}
          variant="destructive"
        />
        <StatsCard
          title="Tarefas Urgentes"
          value={urgentTasks}
          icon={Users}
          variant="default"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progresso Geral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Taxa de Conclusão</span>
                <span className="font-medium">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Concluídas</span>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  {completedTasks}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Em Progresso</span>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {tasks.filter(t => t.status === 'em_progresso').length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pendentes</span>
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                  {pendingTasks}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Tarefas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximos Prazos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};