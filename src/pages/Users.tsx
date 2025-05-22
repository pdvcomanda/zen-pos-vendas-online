
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users as UsersIcon, UserPlus } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { UserRole } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import UserForm from '@/components/UserForm';
import UserTable, { UserData } from '@/components/UserTable';

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  
  // Load users from Supabase
  useEffect(() => {
    loadUsers();
  }, []);
  
  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setUsers(data.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole
      })));
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };
  
  // Open dialog for adding/editing user
  const openUserDialog = (user?: UserData) => {
    if (user) {
      setEditingUser(user);
    } else {
      setEditingUser(null);
    }
    setUserDialogOpen(true);
  };
  
  // Handle save user
  const handleSaveUser = async (userData: {
    name: string;
    email: string;
    role: UserRole;
    password?: string;
  }) => {
    try {
      if (editingUser) {
        // Update existing user
        const { error } = await supabase
          .from('employees')
          .update({
            name: userData.name,
            email: userData.email,
            role: userData.role
          })
          .eq('id', editingUser.id);
        
        if (error) throw error;
        
        // If password provided, update it separately via auth API or function
        if (userData.password) {
          // In a real implementation, you would update the password via auth API
          console.log('Password would be updated separately via auth API');
        }
        
        setUsers(users.map(user => 
          user.id === editingUser.id ? { ...user, ...userData } : user
        ));
        
        toast.success('Usuário atualizado com sucesso');
      } else {
        // For new users, we need to create an ID
        const newId = crypto.randomUUID();
        
        // Validate required fields for new user
        if (!userData.password) {
          toast.error('Senha é obrigatória para novos usuários');
          return;
        }
        
        // Add new user
        const { error } = await supabase
          .from('employees')
          .insert([{
            id: newId,
            name: userData.name,
            email: userData.email,
            role: userData.role
          }]);
        
        if (error) throw error;
        
        // In a real implementation, you would handle password separately through auth
        
        setUsers([...users, { 
          id: newId,
          name: userData.name,
          email: userData.email,
          role: userData.role
        }]);
        
        toast.success('Usuário adicionado com sucesso');
      }
      setUserDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast.error(`Erro ao salvar usuário: ${error?.message || 'Erro desconhecido'}`);
    }
  };
  
  // Handle delete user
  const handleDeleteUser = async (id: string) => {
    // Don't allow deleting the primary admin
    if (id === '1') {
      toast.error('Não é possível excluir o administrador principal');
      return;
    }
    
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        const { error } = await supabase
          .from('employees')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        setUsers(users.filter(user => user.id !== id));
        toast.success('Usuário excluído com sucesso');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Erro ao excluir usuário');
      }
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <UsersIcon className="mr-2" />
          Funcionários
        </h1>
        
        <Button 
          className="bg-acai-purple hover:bg-acai-dark flex items-center"
          onClick={() => openUserDialog()}
        >
          <UserPlus size={16} className="mr-2" />
          Novo Funcionário
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <UserTable 
            users={users} 
            onEdit={openUserDialog} 
            onDelete={handleDeleteUser}
            isLoading={loading}
          />
        </CardContent>
      </Card>
      
      {/* User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Funcionário' : 'Novo Funcionário'}
            </DialogTitle>
            <DialogDescription>
              {editingUser 
                ? 'Atualize as informações do funcionário'
                : 'Preencha as informações para adicionar um novo funcionário'
              }
            </DialogDescription>
          </DialogHeader>
          
          <UserForm 
            initialData={editingUser || { name: '', email: '', role: 'employee' }}
            onSave={handleSaveUser}
            onCancel={() => setUserDialogOpen(false)}
            isEditing={!!editingUser}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
