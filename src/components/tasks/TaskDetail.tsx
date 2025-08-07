import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  User, 
  Flag, 
  MessageCircle, 
  Edit,
  Trash2,
  UserPlus,
  FolderTree,
  Clock,
  CheckCircle,
  PlayCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Task } from "@/types/database";
import { TaskForm } from "./TaskForm";
import { TaskDelegateForm } from "./TaskDelegateForm";
import { ConvertToProjectDialog } from "./ConvertToProjectDialog";
import { useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TaskDetailProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TaskDetail = ({ task, open, onOpenChange }: TaskDetailProps) => {
  const { toast } = useToast();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDelegateForm, setShowDelegateForm] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        updates: { status: newStatus as any },
      });
      toast({
        title: "Status atualizado",
        description: `Tarefa marcada como ${newStatus.replace('_', ' ')}.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync(task.id);
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi excluída com sucesso.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir a tarefa.",
        variant: "destructive",
      });
    }
  };

  const isOverdue = new Date() > new Date(task.due_date) && task.status !== 'concluida';

  return (
    <>
      <Dialog open={open && !showEditForm} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-xl">{task.title}</DialogTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant="outline" 
                    className={getPriorityColor(task.priority)}
                  >
                    <Flag className="h-3 w-3 mr-1" />
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Badge>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                  {task.is_project && (
                    <Badge variant="outline">
                      <FolderTree className="h-3 w-3 mr-1" />
                      Projeto
                    </Badge>
                  )}
                  {isOverdue && (
                    <Badge variant="destructive">
                      Atrasada
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowEditForm(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Description */}
            {task.description && (
              <div>
                <h3 className="font-semibold mb-2">Descrição</h3>
                <p className="text-muted-foreground">{task.description}</p>
              </div>
            )}

            <Separator />

            {/* Task Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Vence em {format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Criada em {format(new Date(task.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>

                {task.classification && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {task.classification.name}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {task.created_by_profile && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Criado por:</span>
                    <div className="flex items-center gap-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {task.created_by_profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{task.created_by_profile.name}</span>
                    </div>
                  </div>
                )}

                {task.assigned_to_profile && (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Atribuído para:</span>
                    <div className="flex items-center gap-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {task.assigned_to_profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{task.assigned_to_profile.name}</span>
                    </div>
                  </div>
                )}

                {task.delegated_by_profile && (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Delegado por:</span>
                    <div className="flex items-center gap-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {task.delegated_by_profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{task.delegated_by_profile.name}</span>
                    </div>
                  </div>
                )}

                {task.comments.length > 0 && (
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{task.comments.length} comentários</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="font-semibold">Ações Rápidas</h3>
              
              {/* Status Actions */}
              <div className="flex gap-2 flex-wrap">
                {task.status !== 'em_progresso' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('em_progresso')}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Iniciar
                  </Button>
                )}
                
                {task.status !== 'concluida' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('concluida')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Concluir
                  </Button>
                )}
              </div>

              {/* Other Actions */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDelegateForm(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Delegar
                </Button>
                
                {!task.is_project && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConvertDialog(true)}
                  >
                    <FolderTree className="h-4 w-4 mr-2" />
                    Converter em Projeto
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Form */}
      {showEditForm && (
        <TaskForm
          task={task}
          open={showEditForm}
          onOpenChange={setShowEditForm}
        />
      )}

      {/* Delegate Form */}
      {showDelegateForm && (
        <TaskDelegateForm
          task={task}
          open={showDelegateForm}
          onOpenChange={setShowDelegateForm}
        />
      )}

      {/* Convert to Project Dialog */}
      {showConvertDialog && (
        <ConvertToProjectDialog
          task={task}
          open={showConvertDialog}
          onOpenChange={setShowConvertDialog}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tarefa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
