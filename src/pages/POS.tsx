
import React, { useState } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { ProductType, CartItem, PaymentMethod } from '@/types/app';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';

// Import our new components
import { SearchBar } from '@/components/POS/SearchBar';
import { CategoryFilter } from '@/components/POS/CategoryFilter';
import { ProductList } from '@/components/POS/ProductList';
import { CartPanel } from '@/components/POS/CartPanel';
import { ProductDialog } from '@/components/POS/ProductDialog';
import { CheckoutDialog } from '@/components/POS/CheckoutDialog';

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
  
  return (
    <div className="flex h-full">
      {/* Products section */}
      <div className="flex-1 p-4 flex flex-col h-full">
        <div className="flex items-center space-x-2 mb-4">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
        
        <Tabs defaultValue="categories" className="flex-1 flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="all">Todos os Produtos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories" className="flex-1 flex flex-col">
            <CategoryFilter 
              categories={categories} 
              activeCategory={activeCategory} 
              onCategorySelect={setActiveCategory} 
            />
            
            <div className="overflow-y-auto flex-1">
              <ProductList products={filteredProducts} onProductSelect={handleProductSelect} />
            </div>
          </TabsContent>
          
          <TabsContent value="all" className="flex-1 overflow-y-auto">
            <ProductList products={filteredProducts} onProductSelect={handleProductSelect} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Cart section */}
      <CartPanel 
        cart={cart}
        cartTotal={cartTotal}
        updateCartItem={updateCartItem}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        handleCheckoutClick={handleCheckoutClick}
      />
      
      {/* Product dialog */}
      <ProductDialog
        isOpen={isProductDialogOpen}
        onOpenChange={setIsProductDialogOpen}
        product={selectedProduct}
        productNotes={selectedProductNotes}
        setProductNotes={setSelectedProductNotes}
        onAddToCart={handleAddToCart}
      />
      
      {/* Checkout dialog */}
      <CheckoutDialog
        isOpen={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        cartTotal={cartTotal}
        customerName={customerName}
        setCustomerName={setCustomerName}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        amountPaid={amountPaid}
        setAmountPaid={setAmountPaid}
        onCompleteSale={handleCompleteSale}
      />
    </div>
  );
};

export default POS;
