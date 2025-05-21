
import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDataStore } from '@/stores/dataStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const getPaymentMethodName = (method: string) => {
  switch (method) {
    case 'cash': return 'Dinheiro';
    case 'card': return 'Cartão';
    case 'pix': return 'PIX';
    default: return method;
  }
};

const Receipt: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSaleById } = useDataStore();
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const sale = getSaleById(id || '');
  
  if (!sale) {
    return (
      <div className="p-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Cupom não encontrado</h1>
        <Button onClick={() => navigate('/pos')}>Voltar ao PDV</Button>
      </div>
    );
  }
  
  const handlePrint = () => {
    toast('Iniciando impressão...', {
      icon: <Printer size={16} />,
    });
    
    // In a real app, we would connect to a thermal printer here
    // For now, we'll just simulate a print with window.print()
    window.print();
  };
  
  const handleDownloadPDF = () => {
    toast('Gerando PDF...', {
      icon: <Download size={16} />,
    });
    
    // In a real app, we would generate a PDF
    // For now, we'll just show a success message
    setTimeout(() => {
      toast.success('PDF gerado com sucesso!');
    }, 1000);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-4 flex items-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-2"
          onClick={() => navigate('/pos')}
        >
          <ArrowLeft size={16} className="mr-2" />
          Voltar ao PDV
        </Button>
        
        <h1 className="text-2xl font-bold">Cupom de Venda</h1>
      </div>
      
      <div className="print:block mb-4">
        <Card>
          <CardHeader className="pb-2 border-b">
            <CardTitle>
              <div className="flex justify-between items-center">
                <span className="text-xl">Açaí Zen</span>
                <span className="text-sm text-gray-500">Não Fiscal</span>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-4" ref={receiptRef}>
            <div className="text-sm text-gray-500 mb-4">
              <p>Rua Arthur Oscar, 220 - Vila Nova</p>
              <p>Mansa - RJ</p>
              <p>Tel: (24) 9933-9007</p>
              <p>Instagram: @acaizenn</p>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between font-medium">
                <span>Cupom:</span>
                <span>{sale.id.substring(5, 13)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Data/Hora:</span>
                <span>{formatDate(sale.createdAt)}</span>
              </div>
              {sale.customerName && (
                <div className="flex justify-between text-sm">
                  <span>Cliente:</span>
                  <span>{sale.customerName}</span>
                </div>
              )}
            </div>
            
            <div className="border-t border-b py-2 mb-4">
              <div className="flex justify-between font-medium text-sm mb-2">
                <span className="w-8 text-center">Qtd</span>
                <span className="flex-1 ml-2">Produto</span>
                <span className="w-20 text-right">Valor Un.</span>
                <span className="w-20 text-right">Subtotal</span>
              </div>
              
              {sale.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm py-1">
                  <span className="w-8 text-center">{item.quantity}</span>
                  <span className="flex-1 ml-2">
                    {item.product.name}
                    {item.notes && (
                      <span className="block text-xs text-gray-500">Obs: {item.notes}</span>
                    )}
                  </span>
                  <span className="w-20 text-right">R$ {item.product.price.toFixed(2)}</span>
                  <span className="w-20 text-right">R$ {(item.quantity * item.product.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between">
                <span className="font-medium">Total:</span>
                <span className="font-bold">R$ {sale.total.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Forma de Pagamento:</span>
                <span>{getPaymentMethodName(sale.payment.method)}</span>
              </div>
              
              {sale.payment.method === 'cash' && sale.payment.change && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Valor Pago:</span>
                    <span>R$ {sale.payment.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Troco:</span>
                    <span>R$ {sale.payment.change.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
            
            <div className="text-center text-sm border-t pt-4">
              <p className="font-medium">Obrigado pela preferência!</p>
              <p className="text-xs text-gray-500">www.acaizen.com.br</p>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center space-x-4 print:hidden">
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={handlePrint}
            >
              <Printer size={16} className="mr-2" />
              Imprimir
            </Button>
            <Button 
              className="bg-acai-purple hover:bg-acai-dark flex items-center"
              onClick={handleDownloadPDF}
            >
              <Download size={16} className="mr-2" />
              Baixar PDF
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Receipt;
