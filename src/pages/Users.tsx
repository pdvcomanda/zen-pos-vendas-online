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

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, email, role')
        .order('name');

      if (error) throw error;

      setUsers(data as UserData[]);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };
  const openUserDialog = (user?: UserData) => {
    if (user) {
      setEditingUser(user);
    } else {
      setEditingUser(null);
    }
    setUserDialogOpen(true);
  };

  const handleSaveUser = async (userData: {
    name: string;
    email: string;
    role: UserRole;
    password?: string;
  }) => {
    try {
      if (editingUser) {
        const { error } = await supabase
          .from('employees')
          .update({
            name: userData.name,
            email: userData.email,
            role: userData.role
          })
          .eq('id', editingUser.id);

        if (error) throw error;

        setUsers(users.map(user =>
          user.id === editingUser.id ? { ...user, ...userData } : user
        ));

        toast.success('Usuário atualizado com sucesso');
      } else {
        const newId = crypto.randomUUID();

        const { error } = await supabase
          .from('employees')
          .insert([{
            id: newId,
            name: userData.name,
            email: userData.email,
            role: userData.role
          }]);

        if (error) throw error;

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
      console.error('Erro ao salvar usuário:', error);
      toast.error(`Erro: ${error.message || 'Erro desconhecido'}`);
    }
  };
  const handleDeleteUser = async (id: string) => {
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
        console.error('Erro ao excluir usuário:', error);
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

      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Funcionário' : 'Novo Funcionário'}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Atualize as informações do funcionário'
                : 'Preencha os dados do novo funcionário'}
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
Corrigido Users.tsx - salvar e editar funcionários
