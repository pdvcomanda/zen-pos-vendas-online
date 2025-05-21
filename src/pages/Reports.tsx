import React from 'react';
import { useDataStore } from '@/stores/dataStore';
import { ProductType } from '@/types/app';
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
import { 
  BarChart, 
  Download, 
  CreditCard, 
  Calendar,
  Package
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const Reports: React.FC = () => {
  const { sales, products, categories } = useDataStore();
  
  // Date range state
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  const [startDate, setStartDate] = useState(oneMonthAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  
  // Filter sales by date range
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59); // Include the full end day
    
    return saleDate >= start && saleDate <= end;
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
  
  // Handle report download
  const handleDownloadReport = () => {
    toast('Gerando relatório...', {
      icon: <Download size={16} />,
    });
    
    setTimeout(() => {
      toast.success('Relatório gerado com sucesso!');
    }, 1000);
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <BarChart className="mr-2" />
          Relatórios
        </h1>
        
        <Button 
          className="bg-acai-purple hover:bg-acai-dark flex items-center"
          onClick={handleDownloadReport}
        >
          <Download size={16} className="mr-2" />
          Exportar Relatório
        </Button>
      </div>
      
      <div className="bg-white rounded-lg border p-4 mb-6">
        <h2 className="text-lg font-medium mb-4 flex items-center">
          <Calendar size={18} className="mr-2" />
          Período do Relatório
        </h2>
        
        <div className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Inicial</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded p-2"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Final</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded p-2"
            />
          </div>
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
