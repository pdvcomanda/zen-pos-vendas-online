
import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  Menu,
  ShoppingCart, 
  Package, 
  BarChart, 
  Settings, 
  Users,
  Home
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 w-full p-3 rounded-lg transition-colors ${
      active 
        ? 'bg-acai-purple text-white'
        : 'text-gray-700 hover:bg-acai-purple/10'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);

const DashboardLayout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState(window.location.pathname);

  const navigateTo = (path: string) => {
    navigate(path);
    setActivePage(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarItems = [
    { icon: <Home size={20} />, label: 'Início', path: '/dashboard', adminOnly: false },
    { icon: <ShoppingCart size={20} />, label: 'PDV', path: '/pos', adminOnly: false },
    { icon: <Package size={20} />, label: 'Produtos', path: '/products', adminOnly: true },
    { icon: <BarChart size={20} />, label: 'Relatórios', path: '/reports', adminOnly: true },
    { icon: <Users size={20} />, label: 'Funcionários', path: '/users', adminOnly: true },
    { icon: <Settings size={20} />, label: 'Configurações', path: '/settings', adminOnly: true },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } flex flex-col`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {isSidebarOpen ? (
            <h1 className="text-xl font-bold text-acai-purple">Açaí Zen</h1>
          ) : (
            <span className="text-xl font-bold text-acai-purple">AZ</span>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu size={20} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {sidebarItems
            .filter(item => !item.adminOnly || isAdmin)
            .map((item) => (
              <SidebarItem
                key={item.path}
                icon={item.icon}
                label={isSidebarOpen ? item.label : ''}
                to={item.path}
                active={activePage === item.path}
                onClick={() => navigateTo(item.path)}
              />
            ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          {isSidebarOpen ? (
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role === 'admin' ? 'Administrador' : 'Funcionário'}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut size={16} className="mr-2" />
                Sair
              </Button>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
            >
              <LogOut size={20} />
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
