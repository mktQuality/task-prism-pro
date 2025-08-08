import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "./TaskCard";
import { TaskForm } from "./TaskForm";
import { TaskDetail } from "./TaskDetail";
import { Task } from "@/types/database";
import { useTasks, useTaskClassifications } from "@/hooks/useTasks";
import { Plus, Search, Filter } from "lucide-react";

interface TaskListProps {
  openNewTaskForm?: boolean;
  onNewTaskHandled?: () => void;
}

export const TaskList = ({ openNewTaskForm = false, onNewTaskHandled }: TaskListProps) => {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: classifications = [] } = useTaskClassifications();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

useEffect(() => {
  if (openNewTaskForm) {
    setShowTaskForm(true);
    onNewTaskHandled?.();
  }
}, [openNewTaskForm, onNewTaskHandled]);

const filteredTasks = tasks.filter(task => {
  const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       task.description?.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesStatus = statusFilter === "all" || task.status === statusFilter;
  const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
  
  return matchesSearch && matchesStatus && matchesPriority;
});

  const tasksByStatus = {
    pendente: filteredTasks.filter(t => t.status === 'pendente'),
    em_progresso: filteredTasks.filter(t => t.status === 'em_progresso'),
    concluida: filteredTasks.filter(t => t.status === 'concluida'),
    atrasada: filteredTasks.filter(t => new Date() > new Date(t.due_date) && t.status !== 'concluida')
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando tarefas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Tarefas</h1>
          <p className="text-muted-foreground">
            Gerencie suas tarefas, delegue responsabilidades e converta em projetos
          </p>
        </div>
        <Button onClick={() => setShowTaskForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tarefas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_progresso">Em Progresso</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="atrasada">Atrasada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Prioridades</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{tasksByStatus.pendente.length}</p>
              </div>
              <Badge className="bg-status-pending">
                {tasksByStatus.pendente.length}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Progresso</p>
                <p className="text-2xl font-bold">{tasksByStatus.em_progresso.length}</p>
              </div>
              <Badge className="bg-status-progress">
                {tasksByStatus.em_progresso.length}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold">{tasksByStatus.concluida.length}</p>
              </div>
              <Badge className="bg-status-completed">
                {tasksByStatus.concluida.length}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atrasadas</p>
                <p className="text-2xl font-bold">{tasksByStatus.atrasada.length}</p>
              </div>
              <Badge className="bg-status-overdue">
                {tasksByStatus.atrasada.length}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onTaskClick={setSelectedTask}
          />
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                ? "Nenhuma tarefa encontrada com os filtros aplicados."
                : "Nenhuma tarefa encontrada. Crie sua primeira tarefa!"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          open={showTaskForm}
          onOpenChange={setShowTaskForm}
          task={null}
        />
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