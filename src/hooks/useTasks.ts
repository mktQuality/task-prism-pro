import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskClassification, TaskPriority, TaskStatus } from '@/types/database';

export const useTasks = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      // Fetch tasks with classifications
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          classification:task_classifications(*)
        `)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      // Get all unique user IDs from tasks
      const userIds = new Set<string>();
      tasksData?.forEach(task => {
        if (task.created_by) userIds.add(task.created_by);
        if (task.assigned_to) userIds.add(task.assigned_to);
        if (task.delegated_by) userIds.add(task.delegated_by);
      });

      // Fetch profiles for all users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', Array.from(userIds));

      // Create a map of user_id to profile
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });

      // Combine tasks with profile data
      const tasksWithProfiles = tasksData?.map(task => ({
        ...task,
        created_by_profile: profilesMap.get(task.created_by) || null,
        assigned_to_profile: profilesMap.get(task.assigned_to) || null,
        delegated_by_profile: profilesMap.get(task.delegated_by) || null,
      })) || [];

      return tasksWithProfiles as Task[];
    },
  });
};

export const useTaskClassifications = () => {
  return useQuery({
    queryKey: ['task-classifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_classifications')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as TaskClassification[];
    },
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: {
      title: string;
      description?: string;
      classification_id?: string;
      priority: TaskPriority;
      assigned_to?: string;
      due_date: string;
      is_project?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...task,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { 
      id: string; 
      updates: Partial<Task> 
    }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};