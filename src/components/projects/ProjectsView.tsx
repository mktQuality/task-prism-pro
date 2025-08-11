import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskForm } from "@/components/tasks/TaskForm";
import { ProjectDetail } from "@/components/projects/ProjectDetail";
import { ProjectsListTable } from "@/components/projects/ProjectsListTable";
import { useTasks } from "@/hooks/useTasks";
import { Plus, Search } from "lucide-react";
import { Task } from "@/types/database";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export const ProjectsView = () => {
  const { data: tasks = [], isLoading } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const projects = tasks.filter(t => t.is_project);
  const filtered = projects.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando projetos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projetos</h1>
          <p className="text-muted-foreground">Acompanhe e gerencie seus projetos.</p>
        </div>
        <Button onClick={() => setShowTaskForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Buscar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="page" className="w-full">
        <TabsList>
          <TabsTrigger value="page">Página</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="page" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((task) => (
              <TaskCard key={task.id} task={task} onTaskClick={setSelectedTask} />
            ))}
          </div>

          {filtered.length === 0 && (
            <Card className="mt-4">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Nenhum projeto encontrado.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <ProjectsListTable projects={filtered} allTasks={tasks} onProjectClick={setSelectedTask} />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Modal */}
      {showTaskForm && (
        <TaskForm open={showTaskForm} onOpenChange={setShowTaskForm} task={null} defaultIsProject={true} />
      )}

      {/* Detail Modal */}
      {selectedTask && (
        <ProjectDetail
          project={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
        />
      )}
    </div>
  );
};
