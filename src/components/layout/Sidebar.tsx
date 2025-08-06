import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  CheckSquare, 
  Users, 
  BarChart3, 
  Settings, 
  Plus,
  Clock,
  AlertTriangle
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare, badge: '12' },
    { id: 'urgent', label: 'Urgentes', icon: AlertTriangle, badge: '3' },
    { id: 'overdue', label: 'Atrasadas', icon: Clock, badge: '2' },
    { id: 'team', label: 'Equipe', icon: Users },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="w-64 bg-card border-r border-border h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          TaskFlow
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sistema de Gestão
        </p>
      </div>
      
      <div className="px-3">
        <Button 
          className="w-full mb-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
        
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start font-medium",
                activeSection === item.id && "bg-accent text-accent-foreground"
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <item.icon className="h-4 w-4 mr-3" />
              {item.label}
              {item.badge && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
};