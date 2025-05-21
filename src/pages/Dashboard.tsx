
import React from 'react';
import { useDataStore } from '@/stores/dataStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Package, CreditCard, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { products, sales } = useDataStore();
  const navigate = useNavigate();
  
  // Calculate dashboard statistics
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalProducts = products.length;
  
  const recentSales = sales.slice(0, 5);
  
  // Get payment method distribution
  const paymentMethods = {
    cash: sales.filter(s => s.payment.method === 'cash').length,
    card: sales.filter(s => s.payment.method === 'card').length,
    pix: sales.filter(s => s.payment.method === 'pix').length
  };
  
  // Calculate most popular products
  const popularProducts = sales.flatMap(sale => 
    sale.items.map(item => ({
      id: item.product.id,
      name: item.product.name,
      quantity: item.quantity
    }))
  ).reduce((acc, curr) => {
    const existing = acc.find(p => p.id === curr.id);
    if (existing) {
      existing.quantity += curr.quantity;
    } else {
      acc.push(curr);
    }
    return acc;
  }, [] as { id: string, name: string, quantity: number }[])
  .sort((a, b) => b.quantity - a.quantity)
  .slice(0, 5);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex space-x-2">
          <button 
            className="pos-button pos-button-primary"
            onClick={() => navigate('/pos')}
          >
            Ir para PDV
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="card-hover">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">vendas realizadas</p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">em vendas</p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">no catálogo</p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Formas de Pagamento</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1 mt-1">
              <div className="flex justify-between">
                <span>Dinheiro:</span>
                <span className="font-medium">{paymentMethods.cash}</span>
              </div>
              <div className="flex justify-between">
                <span>Cartão:</span>
                <span className="font-medium">{paymentMethods.card}</span>
              </div>
              <div className="flex justify-between">
                <span>PIX:</span>
                <span className="font-medium">{paymentMethods.pix}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vendas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSales.length > 0 ? (
              <div className="space-y-4">
                {recentSales.map((sale, index) => (
                  <div 
                    key={sale.id} 
                    className="flex justify-between p-2 rounded border bg-white hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/receipt/${sale.id}`)}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        Venda #{sale.id.substring(5, 13)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(sale.createdAt).toLocaleString('pt-BR')}
                      </span>
                      {sale.customerName && (
                        <span className="text-xs text-gray-500">Cliente: {sale.customerName}</span>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-medium">R$ {sale.total.toFixed(2)}</span>
                      <span className="text-xs bg-gray-100 rounded px-2 py-0.5">
                        {sale.payment.method === 'cash' ? 'Dinheiro' : 
                         sale.payment.method === 'card' ? 'Cartão' : 'PIX'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground p-4">
                Nenhuma venda registrada
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {popularProducts.length > 0 ? (
              <div className="space-y-4">
                {popularProducts.map((product, index) => (
                  <div key={product.id} className="flex justify-between items-center p-2 rounded border">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-acai-purple/10 text-acai-purple flex items-center justify-center mr-3">
                        {index + 1}
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                    <span className="text-sm bg-acai-purple/10 text-acai-purple rounded px-2 py-1">
                      {product.quantity} unid.
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground p-4">
                Nenhum produto vendido
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
