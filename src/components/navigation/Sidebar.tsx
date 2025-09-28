import { SystemSelector } from "@/components/navigation/SystemSelector";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  PieChart,
  FileText,
  Database,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Plus,
  LogOut,
  Zap,
  Phone,
  Smartphone,
  Users,
  Package,
  GraduationCap,
} from "lucide-react";
import { useSystem } from "@/contexts/SystemContext";
import logoSecretaria from "@/assets/logo-secretaria.jpg";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
  },
  {
    name: "Gráficos",
    href: "/charts",
    icon: PieChart,
  },
  {
    name: "Relatórios",
    href: "/reports",
    icon: FileText,
  },
  {
    name: "Relatório Consolidado",
    href: "/consolidated-report",
    icon: FileText,
  },
  {
    name: "Registros",
    href: "/records",
    icon: Plus,
  },
  {
    name: "Dados",
    href: "/data-management",
    icon: Database,
  },
];

const systemManagement = [
  {
    name: "Gestão de Água",
    href: "/",
    system: "water",
    icon: Droplets,
    color: "text-water",
  },
  {
    name: "Gestão de Energia", 
    href: "/",
    system: "energy",
    icon: Zap,
    color: "text-energy",
  },
  {
    name: "Gestão de Linha Fixa",
    href: "/",
    system: "fixed-line", 
    icon: Phone,
    color: "text-fixed-line",
  },
  {
    name: "Gestão de Celular",
    href: "/",
    system: "mobile",
    icon: Smartphone,
    color: "text-mobile",
  },
  {
    name: "Gestão de RH",
    href: "/hr-dashboard",
    system: "hr",
    icon: Users,
    color: "text-orange-500",
  },
  {
    name: "Gestão de Suprimentos",
    href: "/supplies-dashboard",
    system: "supplies",
    icon: Package,
    color: "text-teal-500",
  },
  {
    name: "Gestão de Demanda Escolar",
    href: "/school-demand-dashboard",
    system: "school-demand",
    icon: GraduationCap,
    color: "text-school-demand",
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut, user } = useAuth();
  const { setCurrentSystem } = useSystem();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <div className="flex flex-col items-center space-y-2 w-full">
            <div className="flex-shrink-0">
              <img 
                src={logoSecretaria} 
                alt="Logo Secretaria de Educação" 
                className="h-16 w-auto object-contain"
              />
            </div>
            <div className="text-center">
              <h1 className="text-sm font-bold text-sidebar-foreground">
                Gestão de Custos – SME
              </h1>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <img 
              src={logoSecretaria} 
              alt="Logo Secretaria de Educação" 
              className="h-8 w-auto object-contain"
            />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-6">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center"
                  )
                }
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5" />
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* System Management Section */}
        <div>
          {!collapsed && (
            <h3 className="px-3 mb-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
              Gestão de Sistemas
            </h3>
          )}
          <ul className="space-y-1">
            {systemManagement.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => {
                    setCurrentSystem(item.system as any);
                    // Navigate to dashboard after setting system without reloading the page
                    navigate(item.href);
                  }}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left",
                    "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className={cn("h-5 w-5", item.color)} />
                  {!collapsed && <span className="ml-3">{item.name}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        {!collapsed && user && (
          <div className="text-xs text-sidebar-foreground/70 mb-3 truncate">
            {user.email}
          </div>
        )}
        <div className={cn("flex items-center gap-2", collapsed ? "flex-col" : "justify-between")}>
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size={collapsed ? "icon" : "sm"}
            onClick={handleSignOut}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
            title={collapsed ? "Sair" : undefined}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Sair</span>}
          </Button>
        </div>
        {!collapsed && (
          <div className="text-xs text-sidebar-foreground/70 mt-2 text-center">
            v1.0.0
          </div>
        )}
      </div>
    </div>
  );
}