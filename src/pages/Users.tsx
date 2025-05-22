
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users as UsersIcon, UserPlus, Edit, Trash2, Check, X, Save } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { UserRole } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
    name: '',
    email: '',
    role: 'employee'
  });
  const [password, setPassword] = useState('');
  
  // Load users from Supabase
  useEffect(() => {
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
    
    loadUsers();
  }, []);
  
  // Open dialog for adding/editing user
  const openUserDialog = (user?: User) => {
    if (user) {
      setNewUser({
        name: user.name,
        email: user.email,
        role: user.role
      });
      setEditingUserId(user.id);
      setPassword(''); // Clear password when editing
    } else {
      setNewUser({
        name: '',
        email: '',
        role: 'employee'
      });
      setEditingUserId(null);
      setPassword('');
    }
    setUserDialogOpen(true);
  };
  
  // Handle save user
  const handleSaveUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Nome e email são obrigatórios');
      return;
    }
    
    if (!editingUserId && !password) {
      toast.error('Senha é obrigatória para novos usuários');
      return;
    }
    
    try {
      if (editingUserId) {
        // Update existing user - don't include password in the update data
        const { error } = await supabase
          .from('employees')
          .update({
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
          })
          .eq('id', editingUserId);
        
        if (error) throw error;
        
        // If password provided, update it separately via auth API or function
        if (password) {
          // In a real implementation, you would update the password via auth API
          console.log('Password would be updated separately via auth API');
        }
        
        setUsers(users.map(user => 
          user.id === editingUserId ? { ...user, ...newUser } : user
        ));
        
        toast.success('Usuário atualizado com sucesso');
      } else {
        // For new users, we need to create an ID
        const newId = crypto.randomUUID();
        
        // Add new user
        const { error } = await supabase
          .from('employees')
          .insert([{
            id: newId,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
          }]);
        
        if (error) throw error;
        
        // In a real implementation, you would handle password separately through auth
        
        setUsers([...users, { 
          id: newId,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }]);
        
        toast.success('Usuário adicionado com sucesso');
      }
      setUserDialogOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Erro ao salvar usuário');
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
          {loading ? (
            <div className="text-center py-4">Carregando usuários...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.role === 'admin' ? 'Administrador' : 'Funcionário'}
                    </TableCell>
                    <TableCell>
                      {user.role === 'admin' ? (
                        <Check className="text-green-500" size={18} />
                      ) : (
                        <X className="text-red-500" size={18} />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openUserDialog(user)}
                        >
                          <Edit size={16} />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.id === '1'} // Disable for primary admin
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUserId ? 'Editar Funcionário' : 'Novo Funcionário'}
            </DialogTitle>
            <DialogDescription>
              {editingUserId 
                ? 'Atualize as informações do funcionário'
                : 'Preencha as informações para adicionar um novo funcionário'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome*</label>
              <Input
                placeholder="Nome completo"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email*</label>
              <Input
                type="email"
                placeholder="email@acaizen.com"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
            </div>
            
            {(!editingUserId || editingUserId !== '1') && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Função</label>
                <select 
                  className="w-full rounded-md border border-input p-2"
                  value={newUser.role}
                  onChange={(e) => setNewUser({
                    ...newUser, 
                    role: e.target.value as UserRole
                  })}
                >
                  <option value="employee">Funcionário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            )}
            
            {!editingUserId && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Senha*</label>
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Nota: A senha seria gerenciada via sistema de autenticação em uma implementação completa
                </p>
              </div>
            )}
            
            {editingUserId && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Nova Senha (opcional)</label>
                <Input
                  type="password"
                  placeholder="Deixe em branco para manter a senha atual"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Preencha apenas se deseja alterar a senha
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setUserDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-acai-purple hover:bg-acai-dark flex items-center"
              onClick={handleSaveUser}
            >
              <Save size={16} className="mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
