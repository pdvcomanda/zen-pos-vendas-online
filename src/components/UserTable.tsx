
import React from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Check, Edit, Trash2, X } from 'lucide-react';
import { UserRole } from '@/contexts/AuthContext';

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface UserTableProps {
  users: UserData[];
  onEdit: (user: UserData) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  if (isLoading) {
    return <div className="text-center py-4">Carregando usuários...</div>;
  }

  return (
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
                  onClick={() => onEdit(user)}
                >
                  <Edit size={16} />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => onDelete(user.id)}
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
  );
};

export default UserTable;
