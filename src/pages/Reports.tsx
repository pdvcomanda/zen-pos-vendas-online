
import React, { useState } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { ProductType, ReportFilters, PaymentMethod } from '@/types/app';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { SearchBar } from '@/components/POS/SearchBar';
import { 
  BarChart, 
  Download, 
  CreditCard, 
  Calendar,
  Package,
  FileText,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const Reports: React.FC = () => {
  const { sales, products, categories } = useDataStore();
  
  // Date range state
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: oneMonthAgo.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
    paymentMethod: 'all',
    productId: null,
  });

  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter sales by date range and other filters
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59); // Include the full end day
    
    // Check date range
    const matchesDate = saleDate >= start && saleDate <= end;
    
    // Check payment method
    const matchesPayment = filters.paymentMethod === 'all' || sale.payment.method === filters.paymentMethod;

    // Check product if filter is set
    let matchesProduct = true;
    if (filters.productId) {
      matchesProduct = sale.items.some(item => item.product.id === filters.productId);
    }
    
    return matchesDate && matchesPayment && matchesProduct;
  });
  
  // Calculate summary statistics
  const totalSales = filteredSales.length;
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  
  // Payment method statistics
  const paymentStats = {
    cash: filteredSales.filter(s => s.payment.method === 'cash'),
    card: filteredSales.filter(s => s.payment.method === 'card'),
    pix: filteredSales.filter(s => s.payment.method === 'pix')
  };
  
  const paymentTotals = {
    cash: paymentStats.cash.reduce((sum, sale) => sum + sale.total, 0),
    card: paymentStats.card.reduce((sum, sale) => sum + sale.total, 0),
    pix: paymentStats.pix.reduce((sum, sale) => sum + sale.total, 0)
  };
  
  // Top products
  const topProducts = filteredSales
    .flatMap(sale => sale.items)
    .reduce((acc, item) => {
      const existing = acc.find(p => p.id === item.product.id);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.product.price * item.quantity;
      } else {
        acc.push({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          revenue: item.product.price * item.quantity
        });
      }
      return acc;
    }, [] as { id: string; name: string; quantity: number; revenue: number }[])
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  
  // Filter products by search term
  const filteredProducts = products.filter(product =>
    searchTerm === '' || 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle report download
  const handleDownloadReport = (format: 'pdf' | 'excel') => {
    toast(`Gerando relatório em ${format.toUpperCase()}...`, {
      icon: <Download size={16} />,
    });
    
    setTimeout(() => {
      toast.success(`Relatório ${format.toUpperCase()} gerado com sucesso!`);
    }, 1000);
  };

  // Handle export products
  const handleExportProducts = () => {
    toast('Exportando produtos...', {
      icon: <Download size={16} />,
    });
    
    setTimeout(() => {
      toast.success('Produtos exportados com sucesso!');
    }, 1000);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <BarChart className="mr-2" />
          Relatórios
        </h1>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            className="flex items-center"
            onClick={() => handleExportProducts()}
          >
            <Download size={16} className="mr-2" />
            Exportar Produtos
          </Button>
          <Button 
            className="bg-acai-purple hover:bg-acai-dark flex items-center"
            onClick={() => handleDownloadReport('pdf')}
          >
            <FileText size={16} className="mr-2" />
            Exportar PDF
          </Button>
          <Button 
            variant="outline"
            className="flex items-center"
            onClick={() => handleDownloadReport('excel')}
          >
            <Download size={16} className="mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border p-4 mb-6">
        <h2 className="text-lg font-medium mb-4 flex items-center">
          <Calendar size={18} className="mr-2" />
          Filtros do Relatório
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Inicial</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="border rounded p-2 w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Final</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="border rounded p-2 w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Forma de Pagamento</label>
            <Select
              value={filters.paymentMethod}
              onValueChange={(value) => setFilters({...filters, paymentMethod: value as PaymentMethod | 'all'})}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
                <SelectItem value="card">Cartão</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Produto</label>
            <div className="flex space-x-2">
              <Select
                value={filters.productId || ''}
                onValueChange={(value) => setFilters({...filters, productId: value || null})}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos os produtos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os produtos</SelectItem>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <SearchBar 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            placeholder="Buscar nos resultados..."
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Resumo de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-500">Total de Vendas:</dt>
                <dd className="font-bold">{totalSales}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Faturamento Total:</dt>
                <dd className="font-bold">R$ {totalRevenue.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Ticket Médio:</dt>
                <dd className="font-bold">
                  R$ {totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : '0.00'}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CreditCard size={16} className="mr-2" />
              Formas de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-500">Dinheiro:</dt>
                <dd>
                  <span className="font-bold mr-2">
                    R$ {paymentTotals.cash.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({paymentStats.cash.length} vendas)
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Cartão:</dt>
                <dd>
                  <span className="font-bold mr-2">
                    R$ {paymentTotals.card.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({paymentStats.card.length} vendas)
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">PIX:</dt>
                <dd>
                  <span className="font-bold mr-2">
                    R$ {paymentTotals.pix.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({paymentStats.pix.length} vendas)
                  </span>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Package size={16} className="mr-2" />
              Produtos Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-500">Total de Itens:</dt>
                <dd className="font-bold">
                  {filteredSales.reduce((sum, sale) => 
                    sum + sale.items.reduce((s, item) => s + item.quantity, 0), 0)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Produtos Diferentes:</dt>
                <dd className="font-bold">
                  {new Set(filteredSales.flatMap(sale => 
                    sale.items.map(item => item.product.id))).size}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Qtd.</TableHead>
                    <TableHead className="text-right">Faturamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-right">{product.quantity}</TableCell>
                      <TableCell className="text-right">R$ {product.revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-gray-500 py-6">
                Nenhuma venda no período selecionado
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vendas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSales.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.slice(0, 5).map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        {new Date(sale.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {sale.customerName || 'Cliente não informado'}
                      </TableCell>
                      <TableCell>
                        {sale.payment.method === 'cash' ? 'Dinheiro' : 
                         sale.payment.method === 'card' ? 'Cartão' : 'PIX'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        R$ {sale.total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-gray-500 py-6">
                Nenhuma venda no período selecionado
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
