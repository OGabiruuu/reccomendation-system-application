import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, LogOut, Boxes } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { toast } from "sonner";

export function AdminSidebar() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logout realizado com sucesso");
    navigate("/");
  };

  const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/admin/products", icon: Package, label: "Produtos", end: false },
    { to: "/admin/collections", icon: Boxes, label: "Coleções", end: false },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border/50 flex flex-col">
      <div className="p-6 border-b border-border/50">
        <h2 className="text-xl font-display font-bold text-primary">Painel do administrador</h2>
        <p className="text-sm text-muted-foreground">Gerenciamento</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth ${
                isActive ? "bg-primary text-primary-foreground shadow-soft" : "hover:bg-muted hover:text-primary"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border/50">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 transition-smooth hover:border-primary/50 hover:text-primary"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
