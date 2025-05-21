
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';

export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Simulated user database for the demo
const USERS = [
  {
    id: '1',
    email: 'pdvzen1@gmail.com',
    password: 'Zen2024',
    name: 'Administrador',
    role: 'admin' as UserRole
  },
  {
    id: '2',
    email: 'funcionario@acaizen.com',
    password: 'Zen2024',
    name: 'Funcionário',
    role: 'employee' as UserRole
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('acaizen_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Failed to parse stored user data', error);
        localStorage.removeItem('acaizen_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('acaizen_user', JSON.stringify(userWithoutPassword));
      toast.success(`Bem-vindo, ${userWithoutPassword.name}!`);
      return true;
    } else {
      toast.error('Email ou senha incorretos');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('acaizen_user');
    toast.info('Sessão encerrada');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
