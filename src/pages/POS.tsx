import React, { useState } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { ProductType, CategoryType, CartItem, PaymentMethod } from '@/types/app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  Search, 
  Trash2, 
  Plus, 
  Minus,
  CreditCard,
  Banknote,
  QrCode,
  Printer,
  ReceiptText
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';

const POS: React.FC = () => {
  const navigate = useNavigate();
  const { 
    products, 
    categories, 
    cart, 
    addToCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart,
    completeSale
  } = useDataStore();
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [customerName, setCustomerName] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [selectedProductNotes, setSelectedProductNotes] = useState('');
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  
  // Calculate cart total
  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  // Filter products based on search term and active category
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = 
      activeCategory === null || 
      product.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Add product to cart (opens dialog for quantity/notes)
  const handleProductSelect = (product: ProductType) => {
    setSelectedProduct(product);
    setSelectedProductNotes('');
    setIsProductDialogOpen(true);
  };
  
  // Add product to cart with quantity and notes
  const handleAddToCart = () => {
    if (selectedProduct) {
      addToCart(selectedProduct, 1, [], selectedProductNotes || undefined);
      setIsProductDialogOpen(false);
      toast.success(`${selectedProduct.name} adicionado ao carrinho`);
    }
  };
  
  // Checkout flow
  const handleCheckoutClick = () => {
    if (cart.length === 0) {
      toast.error('Adicione produtos ao carrinho para finalizar a venda');
      return;
    }
    
    setPaymentMethod('cash');
    setAmountPaid(cartTotal);
    setCustomerName('');
    setIsCheckoutOpen(true);
  };
  
  const handleCompleteSale = async () => {
    if (amountPaid < cartTotal) {
      toast.error('O valor pago deve ser maior ou igual ao total da compra');
      return;
    }
    
    try {
      const sale = await completeSale(
        { method: paymentMethod, amount: amountPaid }, 
        customerName || undefined
      );
      
      setIsCheckoutOpen(false);
      
      // Simulate receipt printing
      toast.success('Venda finalizada com sucesso!');
      toast('Impressão de cupom iniciada', {
        icon: <Printer size={16} />,
      });
      
      // Navigate to receipt view
      if (sale) {
        navigate(`/receipt/${sale.id}`);
      }
      
    } catch (error) {
      toast.error('Erro ao finalizar venda');
      console.error(error);
    }
  };
  
  // UI for cart item
  const CartItemComponent: React.FC<{ item: CartItem; index: number }> = ({ item, index }) => {
    return (
      <div className="flex items-center justify-between py-2 border-b">
        <div className="flex flex-col">
          <span className="font-medium">{item.product.name}</span>
          <span className="text-sm text-gray-500">
            R$ {item.product.price.toFixed(2)} × {item.quantity}
          </span>
          {item.notes && (
            <span className="text-xs text-gray-500 italic">
              Obs: {item.notes}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="font-medium">
            R$ {(item.product.price * item.quantity).toFixed(2)}
          </span>
          
          <div className="flex items-center border rounded-md">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => {
                if (item.quantity > 1) {
                  updateCartItem(index, item.quantity - 1);
                } else {
                  removeFromCart(index);
                }
              }}
            >
              <Minus size={16} />
            </Button>
            
            <span className="w-8 text-center">{item.quantity}</span>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={() => updateCartItem(index, item.quantity + 1)}
            >
              <Plus size={16} />
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-700"
            onClick={() => removeFromCart(index)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full">
      {/* Products section */}
      <div className="flex-1 p-4 flex flex-col h-full">
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Tabs defaultValue="categories" className="flex-1 flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="all">Todos os Produtos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories" className="flex-1 flex flex-col">
            <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
              <Button
                variant={activeCategory === null ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setActiveCategory(null)}
              >
                Todos
              </Button>
              
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  className="rounded-full whitespace-nowrap"
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
            
            <div className="grid-pos overflow-y-auto flex-1">
              {filteredProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="card-hover cursor-pointer"
                  onClick={() => handleProductSelect(product)}
                >
                  <CardContent className="p-4 flex flex-col">
                    <div className="h-24 bg-gray-100 rounded-md mb-2 flex items-center justify-center">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="h-full w-full object-cover rounded-md" 
                        />
                      ) : (
                        <span className="text-gray-400">{product.name[0]}</span>
                      )}
                    </div>
                    <h3 className="font-medium line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{product.description}</p>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="font-bold">R$ {product.price.toFixed(2)}</span>
                      <span className="text-xs text-gray-500">Estoque: {product.stock}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="all" className="flex-1 overflow-y-auto">
            <div className="grid-pos">
              {filteredProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="card-hover cursor-pointer"
                  onClick={() => handleProductSelect(product)}
                >
                  <CardContent className="p-4 flex flex-col">
                    <div className="h-24 bg-gray-100 rounded-md mb-2 flex items-center justify-center">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="h-full w-full object-cover rounded-md" 
                        />
                      ) : (
                        <span className="text-gray-400">{product.name[0]}</span>
                      )}
                    </div>
                    <h3 className="font-medium line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{product.description}</p>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="font-bold">R$ {product.price.toFixed(2)}</span>
                      <span className="text-xs text-gray-500">Estoque: {product.stock}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Cart section */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold flex items-center">
            <ShoppingCart className="mr-2" size={20} />
            Carrinho de Compras
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingCart size={48} strokeWidth={1} />
              <p className="mt-2">Carrinho vazio</p>
              <p className="text-sm">Adicione produtos para continuar</p>
            </div>
          ) : (
            <div className="space-y-1">
              {cart.map((item, index) => (
                <CartItemComponent 
                  key={`${item.product.id}-${index}`} 
                  item={item} 
                  index={index} 
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Subtotal</span>
            <span>R$ {cartTotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between mb-4 text-lg font-bold">
            <span>Total</span>
            <span>R$ {cartTotal.toFixed(2)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center"
              onClick={clearCart}
              disabled={cart.length === 0}
            >
              Limpar
            </Button>
            
            <Button 
              className="w-full bg-acai-purple hover:bg-acai-dark flex items-center justify-center"
              onClick={handleCheckoutClick}
              disabled={cart.length === 0}
            >
              Finalizar
            </Button>
          </div>
        </div>
      </div>
      
      {/* Product dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              {selectedProduct?.description}
              <div className="mt-2 font-medium">
                Preço: R$ {selectedProduct?.price.toFixed(2)}
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Observações (opcional)</label>
              <Input
                placeholder="Ex: Sem leite condensado"
                value={selectedProductNotes}
                onChange={(e) => setSelectedProductNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-acai-purple hover:bg-acai-dark" onClick={handleAddToCart}>
              Adicionar ao Carrinho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Checkout dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar Venda</DialogTitle>
            <DialogDescription>
              Total a pagar: <span className="font-bold">R$ {cartTotal.toFixed(2)}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Cliente (opcional)</label>
              <Input
                placeholder="Nome do cliente"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Forma de Pagamento</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                  className={`flex items-center justify-center ${
                    paymentMethod === 'cash' ? 'bg-acai-purple hover:bg-acai-dark' : ''
                  }`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <Banknote size={16} className="mr-2" />
                  Dinheiro
                </Button>
                
                <Button
                  type="button"
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  className={`flex items-center justify-center ${
                    paymentMethod === 'card' ? 'bg-acai-purple hover:bg-acai-dark' : ''
                  }`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard size={16} className="mr-2" />
                  Cartão
                </Button>
                
                <Button
                  type="button"
                  variant={paymentMethod === 'pix' ? 'default' : 'outline'}
                  className={`flex items-center justify-center ${
                    paymentMethod === 'pix' ? 'bg-acai-purple hover:bg-acai-dark' : ''
                  }`}
                  onClick={() => setPaymentMethod('pix')}
                >
                  <QrCode size={16} className="mr-2" />
                  PIX
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor Pago</label>
              <Input
                type="number"
                min={cartTotal}
                step="0.01"
                value={amountPaid}
                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
              />
            </div>
            
            {paymentMethod === 'cash' && amountPaid > cartTotal && (
              <div className="bg-green-50 p-3 rounded-md border border-green-200">
                <div className="flex justify-between font-medium">
                  <span>Troco:</span>
                  <span>R$ {(amountPaid - cartTotal).toFixed(2)}</span>
                </div>
              </div>
            )}
            
            {paymentMethod === 'pix' && (
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <QrCode size={120} className="mx-auto mb-2" />
                  <p className="text-sm text-gray-500">QR Code PIX estático</p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-acai-green hover:bg-acai-green/90 flex items-center"
              onClick={handleCompleteSale}
            >
              <ReceiptText size={16} className="mr-2" />
              Finalizar e Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POS;
