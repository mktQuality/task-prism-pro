import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Task } from "@/types/database";
import { useTasks } from "@/hooks/useTasks";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskDetail } from "@/components/tasks/TaskDetail";
import { Flag, FolderTree, Plus } from "lucide-react";

interface ProjectDetailProps {
  project: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProjectDetail = ({ project, open, onOpenChange }: ProjectDetailProps) => {
  const { data: tasks = [] } = useTasks();
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Task | null>(null);

  const activities = useMemo(
    () => tasks.filter((t) => t.project_id === project.id),
    [tasks, project.id]
  );

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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              {project.title}
            </DialogTitle>
            <DialogDescription className="sr-only">Detalhes do projeto e suas atividades</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getPriorityColor(project.priority)}>
                    <Flag className="h-3 w-3 mr-1" />
                    {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                  </Badge>
                  <Badge variant="outline">Projeto</Badge>
                </div>
                <CardTitle className="sr-only">Informações do Projeto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </CardContent>
            </Card>

            <Separator />

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Atividades</h3>
              <Button size="sm" onClick={() => setShowNewActivity(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Atividade
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activities.map((task) => (
                <TaskCard key={task.id} task={task} onTaskClick={setSelectedActivity} />
              ))}
            </div>

            {activities.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Nenhuma atividade adicionada ainda.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {showNewActivity && (
        <TaskForm
          open={showNewActivity}
          onOpenChange={setShowNewActivity}
          task={null}
          parentProjectId={project.id}
        />
      )}

      {selectedActivity && (
        <TaskDetail
          task={selectedActivity}
          open={!!selectedActivity}
          onOpenChange={(open) => !open && setSelectedActivity(null)}
        />
      )}
    </>
  );
};