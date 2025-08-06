export type Priority = 'baixa' | 'media' | 'alta' | 'urgente';
export type TaskStatus = 'pendente' | 'em_progresso' | 'concluida' | 'atrasada';
export type UserRole = 'admin' | 'gestao' | 'supervisao' | 'usuario';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  sector: string;
}

export interface TaskClassification {
  id: string;
  name: string;
  color: string;
  description: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  classification: TaskClassification;
  priority: Priority;
  status: TaskStatus;
  createdBy: User;
  assignedTo?: User;
  delegatedBy?: User;
  createdAt: Date;
  dueDate: Date;
  completedAt?: Date;
  comments: string[];
  isProject: boolean;
  subTasks?: Task[];
}

export interface DelegationHistory {
  id: string;
  taskId: string;
  fromUser: User;
  toUser: User;
  delegatedAt: Date;
  comments: string;
}