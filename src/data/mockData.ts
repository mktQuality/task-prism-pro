import { Task, User, TaskClassification } from "@/types/task";

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Ana Silva",
    email: "ana.silva@empresa.com",
    role: "admin",
    sector: "TI"
  },
  {
    id: "2",
    name: "João Santos",
    email: "joao.santos@empresa.com",
    role: "gestao",
    sector: "Comercial"
  },
  {
    id: "3",
    name: "Maria Oliveira",
    email: "maria.oliveira@empresa.com",
    role: "supervisao",
    sector: "Operações"
  },
  {
    id: "4",
    name: "Pedro Costa",
    email: "pedro.costa@empresa.com",
    role: "usuario",
    sector: "Suporte"
  }
];

export const mockClassifications: TaskClassification[] = [
  {
    id: "1",
    name: "Notificação",
    color: "#3B82F6",
    description: "Tarefas de comunicação e notificação"
  },
  {
    id: "2",
    name: "Atendimento",
    color: "#10B981",
    description: "Atendimento ao cliente"
  },
  {
    id: "3",
    name: "Reunião",
    color: "#F59E0B",
    description: "Reuniões e alinhamentos"
  },
  {
    id: "4",
    name: "Desenvolvimento",
    color: "#8B5CF6",
    description: "Tarefas de desenvolvimento"
  }
];

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Notificar cliente sobre atualização do sistema",
    description: "Enviar comunicado aos clientes sobre a nova versão do sistema que será implementada na próxima semana.",
    classification: mockClassifications[0],
    priority: "alta",
    status: "pendente",
    createdBy: mockUsers[0],
    assignedTo: mockUsers[1],
    createdAt: new Date("2024-01-15"),
    dueDate: new Date("2024-01-20"),
    comments: ["Cliente já foi contatado inicialmente", "Aguardando retorno"],
    isProject: false
  },
  {
    id: "2",
    title: "Revisar proposta comercial",
    description: "Analisar e revisar a proposta comercial para o novo cliente corporativo.",
    classification: mockClassifications[1],
    priority: "urgente",
    status: "em_progresso",
    createdBy: mockUsers[1],
    assignedTo: mockUsers[2],
    delegatedBy: mockUsers[1],
    createdAt: new Date("2024-01-10"),
    dueDate: new Date("2024-01-18"),
    comments: ["Revisão inicial concluída"],
    isProject: false
  },
  {
    id: "3",
    title: "Implementar funcionalidade de relatórios",
    description: "Desenvolver o módulo de relatórios customizáveis no sistema de gestão.",
    classification: mockClassifications[3],
    priority: "media",
    status: "em_progresso",
    createdBy: mockUsers[0],
    assignedTo: mockUsers[3],
    createdAt: new Date("2024-01-05"),
    dueDate: new Date("2024-01-25"),
    comments: ["Mockups aprovados", "Iniciando desenvolvimento"],
    isProject: true
  },
  {
    id: "4",
    title: "Reunião de alinhamento semanal",
    description: "Reunião semanal para alinhamento de projetos e definição de prioridades.",
    classification: mockClassifications[2],
    priority: "media",
    status: "concluida",
    createdBy: mockUsers[2],
    assignedTo: mockUsers[0],
    createdAt: new Date("2024-01-08"),
    dueDate: new Date("2024-01-12"),
    completedAt: new Date("2024-01-12"),
    comments: ["Reunião realizada com sucesso"],
    isProject: false
  },
  {
    id: "5",
    title: "Atualizar documentação do sistema",
    description: "Atualizar manuais e documentação técnica após as últimas mudanças no sistema.",
    classification: mockClassifications[3],
    priority: "baixa",
    status: "pendente",
    createdBy: mockUsers[3],
    assignedTo: mockUsers[0],
    createdAt: new Date("2024-01-12"),
    dueDate: new Date("2024-02-01"),
    comments: [],
    isProject: false
  },
  {
    id: "6",
    title: "Responder chamado de suporte crítico",
    description: "Cliente reportou problema crítico no sistema de pagamentos. Necessita atenção imediata.",
    classification: mockClassifications[1],
    priority: "urgente",
    status: "atrasada",
    createdBy: mockUsers[3],
    assignedTo: mockUsers[2],
    createdAt: new Date("2024-01-14"),
    dueDate: new Date("2024-01-16"),
    comments: ["Cliente muito insatisfeito", "Escalado para supervisão"],
    isProject: false
  }
];