import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { TaskList } from "@/components/tasks/TaskList";
import { useTasks } from "@/hooks/useTasks";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { data: tasks = [], isLoading } = useTasks();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-6 flex items-center justify-center">
          <div className="text-lg">Carregando tarefas...</div>
        </div>
      );
    }

    switch (activeSection) {
      case "dashboard":
        return <DashboardView tasks={tasks} />;
      case "tasks":
        return <TaskList />;
      case "urgent":
        return <div className="p-6">Tarefas Urgentes (Em desenvolvimento)</div>;
      case "overdue":
        return <div className="p-6">Tarefas Atrasadas (Em desenvolvimento)</div>;
      case "team":
        return <div className="p-6">Gestão de Equipe (Em desenvolvimento)</div>;
      case "reports":
        return <div className="p-6">Relatórios (Em desenvolvimento)</div>;
      case "settings":
        return <div className="p-6">Configurações (Em desenvolvimento)</div>;
      default:
        return <DashboardView tasks={tasks} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 flex">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
