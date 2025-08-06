import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { mockTasks } from "@/data/mockData";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardView tasks={mockTasks} />;
      case "tasks":
        return <div className="p-6">Gerenciamento de Tarefas (Em desenvolvimento)</div>;
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
        return <DashboardView tasks={mockTasks} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 flex">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
