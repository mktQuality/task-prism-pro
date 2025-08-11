import { useMemo } from "react";
import { Task } from "@/types/database";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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
  const groups = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const p of projects) {
      const key = p.classification?.name || "Sem classificação";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [projects]);

  const getActivities = (projectId: string) => allTasks.filter(t => t.project_id === projectId);

  const formatDate = (iso?: string | null) => {
    if (!iso) return "-";
    try { return format(new Date(iso), "dd/MM/yy"); } catch { return "-"; }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Atividade</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Início</TableHead>
            <TableHead>Dias úteis</TableHead>
            <TableHead>Dias corridos</TableHead>
            <TableHead>Término</TableHead>
            <TableHead className="w-[160px]">Realizado %</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Observações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map(([groupName, groupProjects]) => (
            <>
              <TableRow key={`group-${groupName}`} className="bg-accent/40">
                <TableCell colSpan={9} className="font-semibold">{groupName}</TableCell>
              </TableRow>

              {groupProjects.map((project) => {
                const activities = getActivities(project.id);
                const total = activities.length;
                const completed = activities.filter(a => a.status === 'concluida').length;
                const progress = total > 0 ? Math.round((completed / total) * 100) : (project.status === 'concluida' ? 100 : 0);

                const startDate = new Date(project.created_at);
                const endRef = safeDate(project.completed_at) || safeDate(project.due_date) || new Date();
                const business = businessDaysBetween(startDate, endRef);
                const calendar = daysBetween(startDate, endRef);

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
                      <TableCell>{formatDate(project.due_date)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="h-2" />
                          <span className="text-sm text-muted-foreground w-10 text-right">{progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{String(project.status).replace(/_/g, ' ')}</TableCell>
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

                      return (
                        <TableRow key={act.id} className="">
                          <TableCell className="pl-8">{act.title}</TableCell>
                          <TableCell>{act.assigned_to_profile?.name || '-'}</TableCell>
                          <TableCell>{formatDate(act.created_at)}</TableCell>
                          <TableCell>{aBusiness}</TableCell>
                          <TableCell>{aCalendar}</TableCell>
                          <TableCell>{formatDate(act.due_date)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={aProgress} className="h-2" />
                              <span className="text-sm text-muted-foreground w-10 text-right">{aProgress}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{String(act.status).replace(/_/g, ' ')}</TableCell>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
