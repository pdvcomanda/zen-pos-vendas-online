
import React, { useState, useEffect } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { ProductType, CartItem, PaymentMethod, AddonType } from '@/types/app';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { PrinterIcon } from 'lucide-react';

// Import our components
import { SearchBar } from '@/components/POS/SearchBar';
import { CategoryFilter } from '@/components/POS/CategoryFilter';
import { ProductList } from '@/components/POS/ProductList';
import { CartPanel } from '@/components/POS/CartPanel';
import { ProductDialog } from '@/components/POS/ProductDialog';
import { CheckoutDialog } from '@/components/POS/CheckoutDialog';
import { PrinterService } from '@/services/PrinterService';

// Import addon selection component
import { AddonSelector } from '@/components/POS/AddonSelector';

const POS: React.FC = () => {
  const navigate = useNavigate();
  const { 
    products, 
    categories,
    addons,
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
  const [selectedAddons, setSelectedAddons] = useState<AddonType[]>([]);
  const [printerStatus, setPrinterStatus] = useState<boolean | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  // Calculate cart total
  const cartTotal = cart.reduce((sum, item) => {
    // Add product price
    let itemTotal = item.product.price * item.quantity;
    
    // Add addons price if any
    if (item.addons && item.addons.length > 0) {
      itemTotal += item.addons.reduce((addonSum, addonItem) => 
        addonSum + (addonItem.addon.price * addonItem.quantity), 0);
    }
    
    return sum + itemTotal;
  }, 0);

  // Check printer status on component mount
  useEffect(() => {
    const checkPrinter = async () => {
      const status = await PrinterService.checkPrinterStatus();
      setPrinterStatus(status);
      
      if (!status) {
        toast.warning(
          'Impressora não conectada. Verificar se o aplicativo middleware está rodando.',
          { duration: 5000 }
        );
      } else {
        toast.success('Impressora conectada', { duration: 3000 });
      }
    };
    
    checkPrinter();
  }, []);
  
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
  
  // Add product to cart (opens dialog for quantity/notes/addons)
  const handleProductSelect = (product: ProductType) => {
    setSelectedProduct(product);
    setSelectedProductNotes('');
    setSelectedAddons([]);
    setQuantity(1);
    setIsProductDialogOpen(true);
  };
  
  // Add product to cart with quantity, notes, and addons
  const handleAddToCart = () => {
    if (selectedProduct) {
      addToCart(selectedProduct, quantity, selectedAddons, selectedProductNotes || undefined);
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
      
      if (!sale) {
        throw new Error('Falha ao salvar a venda');
      }
      
      setIsCheckoutOpen(false);
      
      // Try to print receipt via middleware
      const printerIcon = <PrinterIcon size={16} />;
      toast('Enviando para impressora...', { icon: printerIcon });
      
      const printed = await PrinterService.printReceipt(sale);
      
      if (printed) {
        toast.success('Impressão iniciada com sucesso!');
      } else {
        toast.error('Falha na impressão. Verifique o middleware da impressora.', { duration: 5000 });
      }
      
      // Navigate to receipt view
      navigate(`/receipt/${sale.id}`);
      
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      toast.error('Erro ao finalizar venda');
    }
  };
  
  // Toggle addon selection
  const handleToggleAddon = (addon: AddonType) => {
    if (selectedAddons.some(a => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };
  
  return (
    <div className="flex h-full">
      {/* Products section */}
      <div className="flex-1 p-4 flex flex-col h-full">
        <div className="flex items-center space-x-2 mb-4">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          
          {/* Printer status indicator */}
          <div className="ml-2">
            {printerStatus === null ? (
              <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-md">
                Verificando impressora...
              </span>
            ) : printerStatus ? (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-md">
                Impressora conectada
              </span>
            ) : (
              <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-md">
                Impressora não conectada
              </span>
            )}
          </div>
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
      
      {/* Product dialog with addon support */}
      <ProductDialog
        isOpen={isProductDialogOpen}
        onOpenChange={setIsProductDialogOpen}
        product={selectedProduct}
        productNotes={selectedProductNotes}
        setProductNotes={setSelectedProductNotes}
        quantity={quantity}
        setQuantity={setQuantity}
        onAddToCart={handleAddToCart}
      >
        {/* Add addon selector component */}
        {selectedProduct && addons.length > 0 && (
          <AddonSelector 
            addons={addons}
            selectedAddons={selectedAddons}
            onToggleAddon={handleToggleAddon}
          />
        )}
      </ProductDialog>
      
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
