import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { Task } from "@/types/database";
import { useUpdateTask } from "@/hooks/useTasks";
import { useToast } from "@/hooks/use-toast";

const delegateFormSchema = z.object({
  assigned_to: z.string().min(1, "Selecione um usuário para delegar"),
  delegation_note: z.string().optional(),
});

type DelegateFormData = z.infer<typeof delegateFormSchema>;

interface TaskDelegateFormProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock users - in a real app, this would come from an API
const MOCK_USERS = [
  { id: "user1", name: "João Silva", email: "joao@empresa.com" },
  { id: "user2", name: "Maria Santos", email: "maria@empresa.com" },
  { id: "user3", name: "Pedro Costa", email: "pedro@empresa.com" },
  { id: "user4", name: "Ana Oliveira", email: "ana@empresa.com" },
];

export const TaskDelegateForm = ({ task, open, onOpenChange }: TaskDelegateFormProps) => {
  const { toast } = useToast();
  const updateTask = useUpdateTask();

  const form = useForm<DelegateFormData>({
    resolver: zodResolver(delegateFormSchema),
    defaultValues: {
      assigned_to: task.assigned_to || "",
      delegation_note: "",
    },
  });

  const onSubmit = async (data: DelegateFormData) => {
    try {
      const updates: any = {
        assigned_to: data.assigned_to,
        delegated_by: task.created_by, // Current user becomes the delegator
      };

      // Add delegation note to comments if provided
      if (data.delegation_note) {
        const newComment = `Tarefa delegada: ${data.delegation_note}`;
        updates.comments = [...(task.comments || []), newComment];
      }

      await updateTask.mutateAsync({
        id: task.id,
        updates,
      });

      toast({
        title: "Tarefa delegada",
        description: "A tarefa foi delegada com sucesso.",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao delegar a tarefa.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Delegar Tarefa
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-3 bg-muted rounded-lg">
          <h4 className="font-medium">{task.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {task.description}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="assigned_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delegar para</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um usuário" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOCK_USERS.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex flex-col">
                            <span>{user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="delegation_note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instruções para delegação (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Adicione instruções ou contexto sobre a delegação..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateTask.isPending}
              >
                {updateTask.isPending ? "Delegando..." : "Delegar Tarefa"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};