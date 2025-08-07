import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderTree, AlertTriangle } from "lucide-react";
import { Task } from "@/types/database";
import { useUpdateTask } from "@/hooks/useTasks";
import { useToast } from "@/hooks/use-toast";

interface ConvertToProjectDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ConvertToProjectDialog = ({ 
  task, 
  open, 
  onOpenChange 
}: ConvertToProjectDialogProps) => {
  const { toast } = useToast();
  const updateTask = useUpdateTask();
  const [isConverting, setIsConverting] = useState(false);

  const handleConvertToProject = async () => {
    setIsConverting(true);
    
    try {
      await updateTask.mutateAsync({
        id: task.id,
        updates: {
          is_project: true,
          // Add a comment about the conversion
          comments: [
            ...(task.comments || []),
            `Tarefa convertida em projeto em ${new Date().toLocaleString('pt-BR')}`
          ]
        },
      });

      toast({
        title: "Convertido com sucesso",
        description: "A tarefa foi convertida em projeto.",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao converter a tarefa em projeto.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Converter em Projeto
          </DialogTitle>
          <DialogDescription>
            Você está prestes a converter esta tarefa em um projeto.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task Preview */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium">{task.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {task.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Badge>
                  <Badge>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Information about the conversion */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <FolderTree className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                O que acontece ao converter?
              </p>
              <ul className="mt-1 text-blue-700 dark:text-blue-300 space-y-1">
                <li>• A tarefa será marcada como projeto</li>
                <li>• Poderá servir como base para subtarefas</li>
                <li>• Ganhará funcionalidades de gestão de projeto</li>
                <li>• Um comentário será adicionado registrando a conversão</li>
              </ul>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-900 dark:text-amber-100">
                Atenção
              </p>
              <p className="mt-1 text-amber-700 dark:text-amber-300">
                Esta ação pode ser revertida editando a tarefa e desmarcando a opção "É um projeto".
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isConverting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConvertToProject}
              disabled={isConverting}
            >
              {isConverting ? "Convertendo..." : "Converter em Projeto"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};