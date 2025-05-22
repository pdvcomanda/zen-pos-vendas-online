
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserRole } from '@/contexts/AuthContext';
import { Save } from 'lucide-react';

interface UserFormProps {
  initialData: {
    id?: string;
    name: string;
    email: string;
    role: UserRole;
  };
  onSave: (userData: {
    name: string;
    email: string;
    role: UserRole;
    password?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isEditing: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  initialData,
  onSave,
  onCancel,
  isEditing
}) => {
  const [userData, setUserData] = useState({
    name: initialData.name,
    email: initialData.email,
    role: initialData.role
  });
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      await onSave({
        ...userData,
        password: password || undefined
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome*</label>
        <Input
          placeholder="Nome completo"
          value={userData.name}
          onChange={(e) => setUserData({...userData, name: e.target.value})}
          required
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Email*</label>
        <Input
          type="email"
          placeholder="email@acaizen.com"
          value={userData.email}
          onChange={(e) => setUserData({...userData, email: e.target.value})}
          required
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Função</label>
        <select 
          className="w-full rounded-md border border-input p-2"
          value={userData.role}
          onChange={(e) => setUserData({
            ...userData, 
            role: e.target.value as UserRole
          })}
        >
          <option value="employee">Funcionário</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {isEditing ? 'Nova Senha (opcional)' : 'Senha*'}
        </label>
        <Input
          type="password"
          placeholder={isEditing ? "Deixe em branco para manter a senha atual" : "Senha"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!isEditing}
        />
        {isEditing && (
          <p className="text-xs text-gray-500">
            Preencha apenas se deseja alterar a senha
          </p>
        )}
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button 
          type="button"
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button 
          type="submit"
          className="bg-acai-purple hover:bg-acai-dark flex items-center"
          disabled={isSubmitting}
        >
          <Save size={16} className="mr-2" />
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
