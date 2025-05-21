
import React, { useState } from 'react';
import { useDataStore, type Product, type Category } from '@/stores/dataStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Tag,
  Download,
  Upload
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const Products: React.FC = () => {
  const { 
    products, 
    categories, 
    addProduct, 
    updateProduct, 
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory
  } = useDataStore();
  
  // Product state
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    description: '',
    category: '',
    stock: 0
  });
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  // Category state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  
  // Filter products based on search
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Product dialog handling
  const openProductDialog = (product?: Product) => {
    if (product) {
      setNewProduct({
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        stock: product.stock,
        image: product.image
      });
      setEditingProductId(product.id);
    } else {
      setNewProduct({
        name: '',
        price: 0,
        description: '',
        category: categories.length > 0 ? categories[0].id : '',
        stock: 0
      });
      setEditingProductId(null);
    }
    setProductDialogOpen(true);
  };
  
  const handleSaveProduct = () => {
    if (!newProduct.name) {
      toast.error('O nome do produto é obrigatório');
      return;
    }
    
    if (newProduct.price <= 0) {
      toast.error('O preço deve ser maior que zero');
      return;
    }
    
    try {
      if (editingProductId) {
        updateProduct(editingProductId, newProduct);
        toast.success('Produto atualizado com sucesso');
      } else {
        addProduct(newProduct);
        toast.success('Produto adicionado com sucesso');
      }
      setProductDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar produto');
      console.error(error);
    }
  };
  
  const handleDeleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(id);
      toast.success('Produto excluído com sucesso');
    }
  };
  
  // Category dialog handling
  const openCategoryDialog = (category?: Category) => {
    if (category) {
      setNewCategory(category.name);
      setEditingCategoryId(category.id);
    } else {
      setNewCategory('');
      setEditingCategoryId(null);
    }
    setCategoryDialogOpen(true);
  };
  
  const handleSaveCategory = () => {
    if (!newCategory) {
      toast.error('O nome da categoria é obrigatório');
      return;
    }
    
    try {
      if (editingCategoryId) {
        updateCategory(editingCategoryId, newCategory);
        toast.success('Categoria atualizada com sucesso');
      } else {
        addCategory({ name: newCategory });
        toast.success('Categoria adicionada com sucesso');
      }
      setCategoryDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar categoria');
      console.error(error);
    }
  };
  
  const handleDeleteCategory = (id: string) => {
    // Check if any products use this category
    const productsWithCategory = products.filter(p => p.category === id);
    
    if (productsWithCategory.length > 0) {
      toast.error(`Não é possível excluir: ${productsWithCategory.length} produtos usam esta categoria`);
      return;
    }
    
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      deleteCategory(id);
      toast.success('Categoria excluída com sucesso');
    }
  };
  
  // Import/Export functionality
  const handleExportProducts = () => {
    const csv = [
      ['Nome', 'Preço', 'Descrição', 'Categoria', 'Estoque'].join(','),
      ...products.map(p => {
        const category = categories.find(c => c.id === p.category)?.name || '';
        return [
          `"${p.name.replace(/"/g, '""')}"`,
          p.price,
          `"${p.description.replace(/"/g, '""')}"`,
          `"${category.replace(/"/g, '""')}"`,
          p.stock
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'produtos-acaizen.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success('Produtos exportados com sucesso');
  };
  
  const handleImportProducts = () => {
    toast.info('Funcionalidade de importação em desenvolvimento');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Package className="mr-2" />
          Gerenciamento de Produtos
        </h1>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={handleExportProducts}
          >
            <Download size={16} className="mr-2" />
            Exportar
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={handleImportProducts}
          >
            <Upload size={16} className="mr-2" />
            Importar
          </Button>
          <Button 
            className="bg-acai-purple hover:bg-acai-dark flex items-center"
            onClick={() => openProductDialog()}
          >
            <Plus size={16} className="mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="products">
        <TabsList className="mb-4">
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <div className="bg-white rounded-lg border mb-4">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Estoque</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const category = categories.find(c => c.id === product.category);
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{category?.name || 'Sem categoria'}</TableCell>
                        <TableCell className="text-right">R$ {product.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{product.stock}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openProductDialog(product)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {filteredProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                        Nenhum produto encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="categories">
          <div className="bg-white rounded-lg border mb-4">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-medium flex items-center">
                <Tag size={16} className="mr-2" />
                Categorias de Produtos
              </h3>
              <Button 
                className="bg-acai-purple hover:bg-acai-dark flex items-center"
                onClick={() => openCategoryDialog()}
              >
                <Plus size={16} className="mr-2" />
                Nova Categoria
              </Button>
            </div>
            
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const productCount = products.filter(p => p.category === category.id).length;
                return (
                  <div 
                    key={category.id} 
                    className="bg-gray-50 rounded-lg border p-4 flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-medium">{category.name}</h4>
                      <p className="text-sm text-gray-500">{productCount} produtos</p>
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openCategoryDialog(category)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                );
              })}
              
              {categories.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Nenhuma categoria cadastrada
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProductId ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do produto abaixo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome*</label>
              <Input
                placeholder="Nome do produto"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Preço (R$)*</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria*</label>
              {categories.length > 0 ? (
                <Select 
                  value={newProduct.category} 
                  onValueChange={(value) => setNewProduct({...newProduct, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-red-500">
                  Adicione categorias primeiro
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                placeholder="Descrição do produto"
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Estoque</label>
              <Input
                type="number"
                min="0"
                placeholder="Quantidade em estoque"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setProductDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-acai-purple hover:bg-acai-dark"
              onClick={handleSaveProduct}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategoryId ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome*</label>
              <Input
                placeholder="Nome da categoria"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCategoryDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-acai-purple hover:bg-acai-dark"
              onClick={handleSaveCategory}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
