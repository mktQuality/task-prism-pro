export type UserRole = 'admin' | 'gestao' | 'supervisao' | 'usuario';
export type TaskPriority = 'baixa' | 'media' | 'alta' | 'urgente';
export type TaskStatus = 'pendente' | 'em_progresso' | 'concluida' | 'atrasada';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  sector: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskClassification {
  id: string;
  name: string;
  color: string;
  description: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  classification_id: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  created_by: string;
  assigned_to: string | null;
  delegated_by: string | null;
  due_date: string;
  completed_at: string | null;
  is_project: boolean;
  project_id: string | null; // parent project reference (null for standalone or for projects)
  comments: string[];
  created_at: string;
  updated_at: string;
  // Related data
  classification?: TaskClassification;
  created_by_profile?: Profile;
  assigned_to_profile?: Profile;
  delegated_by_profile?: Profile;
}