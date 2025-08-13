import { useMemo, useState, useCallback } from "react";
import { Task, TaskStatus, TaskPriority } from "@/types/database";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronDown, ChevronRight, ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useUpdateTask } from "@/hooks/useTasks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { usePublicProfiles } from "@/hooks/usePublicProfiles";
import { useToast } from "@/hooks/use-toast";

interface ProjectsListTableProps {
  projects: Task[];
  allTasks: Task[];
  onProjectClick?: (project: Task) => void;
}

// Helper: count business days between two dates (Mon-Fri)
function businessDaysBetween(start: Date, end: Date) {
  const s = new Date(start);
  const e = new Date(end);
  if (e < s) return 0;
  let count = 0;
  const d = new Date(s);
  d.setHours(0, 0, 0, 0);
  while (d <= e) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

function daysBetween(start: Date, end: Date) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = Math.ceil((end.getTime() - start.getTime()) / msPerDay);
  return Math.max(diff, 0);
}

function safeDate(value?: string | null) {
  return value ? new Date(value) : undefined;
}

export const ProjectsListTable = ({ projects, allTasks, onProjectClick }: ProjectsListTableProps) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const toggleGroup = useCallback((g: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g); else next.add(g);
      return next;
    });
  }, []);

  const [sort, setSort] = useState<{ key: 'atividade'|'responsavel'|'inicio'|'uteis'|'corridos'|'termino'|'progresso'|'status'; dir: 'asc'|'desc' }>({ key: 'atividade', dir: 'asc' });
  const setSortKey = (key: typeof sort.key) => setSort((prev) => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });

  const updateTask = useUpdateTask();
  const { data: profiles } = usePublicProfiles();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  const [responsibleFilter, setResponsibleFilter] = useState<'all' | string>('all');

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && p.priority !== priorityFilter) return false;
      if (responsibleFilter !== 'all' && p.assigned_to !== responsibleFilter) return false;
      if (!q) return true;
      const hay = `${p.title} ${(p.description || '')} ${(p.assigned_to_profile?.name || '')}`.toLowerCase();
      return hay.includes(q);
    });
  }, [projects, search, statusFilter, priorityFilter, responsibleFilter]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggleSelect = (id: string, checked: boolean | string) => {
    const value = !!checked && checked !== 'indeterminate';
    setSelected((prev) => {
      const next = new Set(prev);
      if (value) next.add(id); else next.delete(id);
      return next;
    });
  };

  const groups = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const p of filteredProjects) {
      const key = p.classification?.name || "Sem classificação";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredProjects]);

  const getActivities = (projectId: string) => allTasks.filter(t => t.project_id === projectId);

  const visibleIds = useMemo(() => {
    const ids: string[] = [];
    for (const [gName, groupProjects] of groups) {
      if (collapsedGroups.has(gName)) continue;
      for (const p of groupProjects) {
        ids.push(p.id);
        getActivities(p.id).forEach((a) => ids.push(a.id));
      }
    }
    return ids;
  }, [groups, collapsedGroups, allTasks]);

  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const toggleSelectAllVisible = (checked: boolean | string) => {
    const value = !!checked && checked !== 'indeterminate';
    setSelected((prev) => {
      const next = new Set(prev);
      if (value) visibleIds.forEach((id) => next.add(id));
      else visibleIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  const [bulkAssignee, setBulkAssignee] = useState<string | undefined>(undefined);
  const bulkStatus = async (status: TaskStatus) => {
    try {
      await Promise.all(Array.from(selected).map((id) => updateTask.mutateAsync({ id, updates: { status } })));
      toast({ title: 'Atualizado', description: 'Status atualizado para os itens selecionados.' });
    } catch {
      toast({ title: 'Erro', description: 'Falha ao aplicar ação em massa.', variant: 'destructive' });
    }
  };
  const bulkAssign = async (userId: string) => {
    try {
      await Promise.all(Array.from(selected).map((id) => updateTask.mutateAsync({ id, updates: { assigned_to: userId } })));
      toast({ title: 'Atribuído', description: 'Responsável atualizado para os itens selecionados.' });
      setBulkAssignee(undefined);
    } catch {
      toast({ title: 'Erro', description: 'Falha ao atribuir responsável.', variant: 'destructive' });
    }
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return "-";
    try {
      const s = format(new Date(iso), "dd-LLL", { locale: ptBR });
      return s.replace('.', '').toLowerCase();
    } catch { return "-"; }
  };
  return (
    <TooltipProvider>
      <div className="rounded-md border">
        <div className="p-3 border-b bg-card/50 flex flex-wrap items-center gap-2">
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-52"
          />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="em_progresso">Em progresso</SelectItem>
              <SelectItem value="concluida">Concluída</SelectItem>
              <SelectItem value="atrasada">Atrasada</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as any)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Prioridade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas prioridades</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
            </SelectContent>
          </Select>
          <Select value={responsibleFilter} onValueChange={(v) => setResponsibleFilter(v as any)}>
            <SelectTrigger className="w-56"><SelectValue placeholder="Responsável" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos responsáveis</SelectItem>
              {profiles?.map((u) => (
                <SelectItem key={u.user_id} value={u.user_id}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="secondary" onClick={() => { setSearch(''); setStatusFilter('all'); setPriorityFilter('all'); setResponsibleFilter('all'); }}>
            Limpar filtros
          </Button>
        </div>

        {selected.size > 0 && (
          <div className="p-2 border-b bg-accent/30 text-sm flex flex-wrap items-center gap-3">
            <span>{selected.size} selecionado(s)</span>
            <Button size="sm" onClick={() => bulkStatus('concluida')}>Marcar concluído</Button>
            <Select value={bulkAssignee ?? ''} onValueChange={(v) => { setBulkAssignee(v); bulkAssign(v); }}>
              <SelectTrigger className="h-8 w-[220px]"><SelectValue placeholder="Atribuir a..." /></SelectTrigger>
              <SelectContent>
                {profiles?.map((u) => (
                  <SelectItem key={u.user_id} value={u.user_id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Limpar seleção</Button>
          </div>
        )}

        <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allVisibleSelected}
                onCheckedChange={toggleSelectAllVisible}
                aria-label="Selecionar todos"
              />
            </TableHead>
            <TableHead>
              <button className="flex items-center gap-1 hover:underline" onClick={() => setSortKey('atividade')}>
                Atividade <ArrowUpDown className="h-3.5 w-3.5" />
              </button>
            </TableHead>
            <TableHead>
              <button className="flex items-center gap-1 hover:underline" onClick={() => setSortKey('responsavel')}>
                Responsável <ArrowUpDown className="h-3.5 w-3.5" />
              </button>
            </TableHead>
            <TableHead>
              <button className="flex items-center gap-1 hover:underline" onClick={() => setSortKey('inicio')}>
                Início <ArrowUpDown className="h-3.5 w-3.5" />
              </button>
            </TableHead>
            <TableHead>
              <button className="flex items-center gap-1 hover:underline" onClick={() => setSortKey('uteis')}>
                Dias úteis <ArrowUpDown className="h-3.5 w-3.5" />
              </button>
            </TableHead>
            <TableHead>
              <button className="flex items-center gap-1 hover:underline" onClick={() => setSortKey('corridos')}>
                Dias corridos <ArrowUpDown className="h-3.5 w-3.5" />
              </button>
            </TableHead>
            <TableHead>
              <button className="flex items-center gap-1 hover:underline" onClick={() => setSortKey('termino')}>
                Término <ArrowUpDown className="h-3.5 w-3.5" />
              </button>
            </TableHead>
            <TableHead className="w-[160px]">
              <button className="flex items-center gap-1 hover:underline" onClick={() => setSortKey('progresso')}>
                Realizado % <ArrowUpDown className="h-3.5 w-3.5" />
              </button>
            </TableHead>
            <TableHead>
              <button className="flex items-center gap-1 hover:underline" onClick={() => setSortKey('status')}>
                Status <ArrowUpDown className="h-3.5 w-3.5" />
              </button>
            </TableHead>
            <TableHead>Observações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map(([groupName, groupProjects]) => {
            const collapsed = collapsedGroups.has(groupName);
            const computeProgress = (project: Task) => {
              const activities = getActivities(project.id);
              const total = activities.length;
              const completed = activities.filter(a => a.status === 'concluida').length;
              return total > 0 ? Math.round((completed / total) * 100) : (project.status === 'concluida' ? 100 : 0);
            };
            const groupProgress = groupProjects.length
              ? Math.round(groupProjects.map(computeProgress).reduce((a, b) => a + b, 0) / groupProjects.length)
              : 0;

            // apply sorting within group
            const sortedProjects = [...groupProjects].sort((a, b) => {
              const dir = sort.dir === 'asc' ? 1 : -1;
              switch (sort.key) {
                case 'atividade':
                  return a.title.localeCompare(b.title) * dir;
                case 'responsavel':
                  return (a.assigned_to_profile?.name || '').localeCompare(b.assigned_to_profile?.name || '') * dir;
                case 'inicio':
                  return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
                case 'uteis': {
                  const aEnd = safeDate(a.completed_at) || safeDate(a.due_date) || new Date();
                  const bEnd = safeDate(b.completed_at) || safeDate(b.due_date) || new Date();
                  return (businessDaysBetween(new Date(a.created_at), aEnd) - businessDaysBetween(new Date(b.created_at), bEnd)) * dir;
                }
                case 'corridos': {
                  const aEnd = safeDate(a.completed_at) || safeDate(a.due_date) || new Date();
                  const bEnd = safeDate(b.completed_at) || safeDate(b.due_date) || new Date();
                  return (daysBetween(new Date(a.created_at), aEnd) - daysBetween(new Date(b.created_at), bEnd)) * dir;
                }
                case 'termino': {
                  const aEnd = (safeDate(a.completed_at) || safeDate(a.due_date) || new Date()).getTime();
                  const bEnd = (safeDate(b.completed_at) || safeDate(b.due_date) || new Date()).getTime();
                  return (aEnd - bEnd) * dir;
                }
                case 'progresso': {
                  return (computeProgress(a) - computeProgress(b)) * dir;
                }
                case 'status':
                  return a.status.localeCompare(b.status) * dir;
                default:
                  return 0;
              }
            });
            return (
              <>
                <TableRow
                  key={`group-${groupName}`}
                  className="bg-accent/40 cursor-pointer"
                  onClick={() => toggleGroup(groupName)}
                >
                  <TableCell colSpan={9} className="font-semibold">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {collapsed ? (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>{groupName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={groupProgress} className="h-2 w-40" />
                        <span className="text-sm text-muted-foreground w-10 text-right">{groupProgress}%</span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>

                {(!collapsed ? sortedProjects : []).map((project) => {
                  const activities = getActivities(project.id);
                  const total = activities.length;
                  const completed = activities.filter(a => a.status === 'concluida').length;
                  const progress = total > 0 ? Math.round((completed / total) * 100) : (project.status === 'concluida' ? 100 : 0);

                  const startDate = new Date(project.created_at);
                  const endRef = safeDate(project.completed_at) || safeDate(project.due_date) || new Date();
                  const business = businessDaysBetween(startDate, endRef);
                  const calendar = daysBetween(startDate, endRef);
                  const isOverdue = project.status !== 'concluida' && !!project.due_date && new Date(project.due_date) < new Date();
                  return (
                    <>
                      <TableRow
                        key={project.id}
                        className={cn("cursor-pointer hover:bg-accent/50")}
                        onClick={() => onProjectClick?.(project)}
                      >
                        <TableCell className="font-medium">{project.title}</TableCell>
                        <TableCell>{project.assigned_to_profile?.name || '-'}</TableCell>
                        <TableCell>{formatDate(project.created_at)}</TableCell>
                        <TableCell>{business}</TableCell>
                        <TableCell>{calendar}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{formatDate(project.due_date)}</span>
                            {isOverdue && <Badge variant="destructive">Atrasado</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2">
                                <Progress value={progress} className="h-2" />
                                <span className="text-sm text-muted-foreground w-10 text-right">{progress}%</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{completed} de {total} atividades concluídas</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Select
                            defaultValue={project.status}
                            onValueChange={(value) => updateTask.mutate({ id: project.id, updates: { status: value as TaskStatus } })}
                          >
                            <SelectTrigger className="capitalize">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendente">Pendente</SelectItem>
                              <SelectItem value="em_progresso">Em progresso</SelectItem>
                              <SelectItem value="concluida">Concluída</SelectItem>
                              <SelectItem value="atrasada">Atrasada</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="truncate max-w-[240px]">
                          {project.comments && project.comments.length > 0 ? project.comments[0] : '-'}
                        </TableCell>
                      </TableRow>

                      {activities.map((act) => {
                        const aStart = new Date(act.created_at);
                        const aEndRef = safeDate(act.completed_at) || safeDate(act.due_date) || new Date();
                        const aBusiness = businessDaysBetween(aStart, aEndRef);
                        const aCalendar = daysBetween(aStart, aEndRef);
                        const aProgress = act.status === 'concluida' ? 100 : 0;
                        const isOverdueAct = act.status !== 'concluida' && !!act.due_date && new Date(act.due_date) < new Date();
                        return (
                          <TableRow key={act.id} className="">
                            <TableCell className="pl-8">{act.title}</TableCell>
                            <TableCell>{act.assigned_to_profile?.name || '-'}</TableCell>
                            <TableCell>{formatDate(act.created_at)}</TableCell>
                            <TableCell>{aBusiness}</TableCell>
                            <TableCell>{aCalendar}</TableCell>
                             <TableCell>
                               <div className="flex items-center gap-2">
                                 <span>{formatDate(act.due_date)}</span>
                                 {isOverdueAct && <Badge variant="destructive">Atrasado</Badge>}
                               </div>
                             </TableCell>
                             <TableCell>
                               <Tooltip>
                                 <TooltipTrigger asChild>
                                   <div className="flex items-center gap-2">
                                     <Progress value={aProgress} className="h-2" />
                                     <span className="text-sm text-muted-foreground w-10 text-right">{aProgress}%</span>
                                   </div>
                                 </TooltipTrigger>
                                 <TooltipContent>
                                   <p>{act.status === 'concluida' ? 'Concluída' : 'Não concluída'}</p>
                                 </TooltipContent>
                               </Tooltip>
                             </TableCell>
                             <TableCell onClick={(e) => e.stopPropagation()} className="capitalize">
                               <Select
                                 defaultValue={act.status}
                                 onValueChange={(value) => updateTask.mutate({ id: act.id, updates: { status: value as TaskStatus } })}
                               >
                                 <SelectTrigger className="capitalize">
                                   <SelectValue placeholder="Status" />
                                 </SelectTrigger>
                                 <SelectContent>
                                   <SelectItem value="pendente">Pendente</SelectItem>
                                   <SelectItem value="em_progresso">Em progresso</SelectItem>
                                   <SelectItem value="concluida">Concluída</SelectItem>
                                   <SelectItem value="atrasada">Atrasada</SelectItem>
                                 </SelectContent>
                               </Select>
                             </TableCell>
                            <TableCell className="truncate max-w-[240px]">
                              {act.comments && act.comments.length > 0 ? act.comments[0] : '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </>
                  );
                })}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  </TooltipProvider>
);
};
