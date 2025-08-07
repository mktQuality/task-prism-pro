import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatsWidget } from "./TaskStatsWidget";
import { RecentTasksWidget } from "./RecentTasksWidget";
import { TaskDetail } from "../tasks/TaskDetail";
import { Task } from "@/types/database";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCurrentProfile } from "@/hooks/useProfiles";
import { Calendar, Clock, AlertTriangle } from "lucide-react";

interface DashboardViewProps {
  tasks: Task[];
}

export const DashboardView = ({ tasks }: DashboardViewProps) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { data: currentProfile } = useCurrentProfile();

  const todaysTasks = tasks.filter(task => {
    const dueDate = new Date(task.due_date);
    const today = new Date();
    return dueDate.toDateString() === today.toDateString();
  });

  const overdueTasks = tasks.filter(task => {
    const dueDate = new Date(task.due_date);
    const today = new Date();
    return dueDate < today && task.status !== 'concluida';
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {currentProfile?.name || 'Usuário'}! Aqui está o resumo das suas atividades.
          </p>
        </div>
      </div>

      {/* Main Stats */}
      <TaskStatsWidget tasks={tasks} />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <RecentTasksWidget 
          tasks={tasks} 
          onTaskClick={setSelectedTask}
        />

        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Tarefas de Hoje ({todaysTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaysTasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma tarefa para hoje
              </p>
            ) : (
              <div className="space-y-3">
                {todaysTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-2 rounded border cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'urgente' ? 'bg-destructive' :
                      task.priority === 'alta' ? 'bg-warning' : 'bg-primary'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.assigned_to_profile?.name || 'Não atribuída'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Tarefas Atrasadas ({overdueTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-2 rounded border border-destructive/20 cursor-pointer hover:bg-destructive/10"
                  onClick={() => setSelectedTask(task)}
                >
                  <Clock className="h-4 w-4 text-destructive" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Venceu em {format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
        />
      )}
    </div>
  );
};