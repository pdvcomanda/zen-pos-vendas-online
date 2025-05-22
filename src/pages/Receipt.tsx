
import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDataStore } from '@/stores/dataStore';
import { Sale } from '@/types/app';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Printer, Download, Share } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

// Function to generate ESC/POS commands for the receipt
const generateESCPOSCommands = (sale) => {
  // ESC/POS commands for initialization
  const ESC = '\x1B';
  const INIT = `${ESC}@`;
  const CENTER = `${ESC}a\x01`;
  const LEFT = `${ESC}a\x00`;
  const RIGHT = `${ESC}a\x02`;
  const BOLD_ON = `${ESC}E\x01`;
  const BOLD_OFF = `${ESC}E\x00`;
  const DOUBLE_WIDTH_ON = `${ESC}!\x10`;
  const DOUBLE_WIDTH_OFF = `${ESC}!\x00`;
  const UNDERLINE_ON = `${ESC}-\x01`;
  const UNDERLINE_OFF = `${ESC}-\x00`;
  const CUT_PAPER = `${ESC}d\x03${ESC}m`;
  
  // Formatting the date
  const date = new Date(sale.createdAt);
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date);
  
  // Build receipt content
  let receipt = INIT;
  
  // Header (centered, bold)
  receipt += CENTER;
  receipt += BOLD_ON + DOUBLE_WIDTH_ON;
  receipt += 'Açaí Zen\n';
  receipt += DOUBLE_WIDTH_OFF + BOLD_OFF;
  receipt += 'Rua Arthur Oscar, 220 - Vila Nova\n';
  receipt += 'Mansa - RJ\n';
  receipt += 'Tel: (24) 9933-9007\n';
  receipt += 'Instagram: @acaizenn\n\n';
  
  // Receipt info
  receipt += LEFT;
  receipt += BOLD_ON + 'Cupom: ' + BOLD_OFF + sale.id.substring(5, 13) + '\n';
  receipt += BOLD_ON + 'Data/Hora: ' + BOLD_OFF + formattedDate + '\n';
  
  if (sale.customerName) {
    receipt += BOLD_ON + 'Cliente: ' + BOLD_OFF + sale.customerName + '\n';
  }
  
  receipt += UNDERLINE_ON + '                                     ' + UNDERLINE_OFF + '\n\n';
  
  // Items header
  receipt += BOLD_ON;
  receipt += 'Qtd  Produto                    Valor\n';
  receipt += BOLD_OFF;
  receipt += UNDERLINE_ON + '                                     ' + UNDERLINE_OFF + '\n';
  
  // Items
  sale.items.forEach(item => {
    const quantity = String(item.quantity).padEnd(3);
    const name = item.product.name.substring(0, 22).padEnd(22);
    const price = `R$ ${(item.quantity * item.product.price).toFixed(2)}`;
    
    receipt += `${quantity}${name}${price.padStart(7)}\n`;
    
    // Add notes indented if they exist
    if (item.notes) {
      receipt += `     > ${item.notes.substring(0, 25)}\n`;
    }
  });
  
  receipt += UNDERLINE_ON + '                                     ' + UNDERLINE_OFF + '\n';
  
  // Total
  receipt += '\n';
  receipt += RIGHT;
  receipt += BOLD_ON;
  receipt += `TOTAL: R$ ${sale.total.toFixed(2)}\n`;
  receipt += BOLD_OFF;
  
  // Payment method
  let paymentMethod;
  switch (sale.payment.method) {
    case 'cash': paymentMethod = 'Dinheiro'; break;
    case 'card': paymentMethod = 'Cartão'; break;
    case 'pix': paymentMethod = 'PIX'; break;
    default: paymentMethod = sale.payment.method;
  }
  
  receipt += `Forma de Pagamento: ${paymentMethod}\n`;
  
  // Show change for cash payments
  if (sale.payment.method === 'cash' && sale.payment.change) {
    receipt += `Valor Pago: R$ ${sale.payment.amount.toFixed(2)}\n`;
    receipt += `Troco: R$ ${sale.payment.change.toFixed(2)}\n`;
  }
  
  // Footer
  receipt += CENTER;
  receipt += '\n';
  receipt += BOLD_ON;
  receipt += 'Obrigado pela preferência!\n';
  receipt += BOLD_OFF;
  receipt += 'www.acaizen.com.br\n';
  receipt += '\n\n\n';
  receipt += CUT_PAPER;
  
  return receipt;
};

// Function to generate a PDF version of the receipt
const generatePDF = async (sale) => {
  try {
    // In a real implementation, we would use a library like jspdf
    // For now we'll just return the raw content as a Blob
    const content = generateESCPOSCommands(sale);
    return new Blob([content], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Function to print receipt via middleware
const printViaMiddleware = async (sale) => {
  try {
    // Send to local middleware for printing
    const response = await fetch('http://localhost:3333/print', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        type: 'receipt',
        data: {
          saleId: sale.id,
          items: sale.items,
          total: sale.total,
          paymentMethod: sale.payment.method,
          amountPaid: sale.payment.amount,
          change: sale.payment.change,
          customerName: sale.customerName
        }
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to print receipt');
    }
    
    return true;
  } catch (error) {
    console.error('Error printing receipt:', error);
    toast.error('Falha ao imprimir. Verifique se o middleware está rodando.');
    return false;
  }
};

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
  
  const handlePrint = async () => {
    toast('Enviando para impressora...', {
      icon: <Printer size={16} />,
    });
    
    try {
      // Try to print via middleware first
      const printed = await printViaMiddleware(sale);
      
      if (printed) {
        toast.success('Enviado para impressora com sucesso!');
      } else {
        // Fallback to browser print if middleware fails
        window.print();
      }
    } catch (error) {
      console.error('Printing error:', error);
      // Fallback to browser print
      window.print();
    }
  };
  
  const handleDownloadPDF = async () => {
    toast('Gerando PDF...', {
      icon: <Download size={16} />,
    });
    
    try {
      // In a real app, we would generate a complete PDF
      // This is a simplified version for demonstration
      
      // Save receipt to Supabase storage for download
      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(
          `receipt-${sale.id}.txt`,
          generateESCPOSCommands(sale),
          { contentType: 'text/plain' }
        );
        
      if (error) throw error;
      
      // Get public URL for download
      const { data: urlData } = await supabase.storage
        .from('receipts')
        .getPublicUrl(`receipt-${sale.id}.txt`);
        
      if (urlData?.publicUrl) {
        // Create a link element and trigger download
        const link = document.createElement('a');
        link.href = urlData.publicUrl;
        link.download = `acaizen-receipt-${sale.id.substring(5, 13)}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('PDF gerado com sucesso!');
      } else {
        throw new Error('Failed to get download URL');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.');
    }
  };
  
  const handleShareReceipt = () => {
    toast.info('Opção de compartilhar em desenvolvimento');
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
                      <span className="block text-xs text-gray-500 pl-4"> → {item.notes}</span>
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
          
          <CardFooter className="flex justify-center space-x-2 print:hidden">
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
            <Button 
              variant="outline"
              className="flex items-center"
              onClick={handleShareReceipt}
            >
              <Share size={16} className="mr-2" />
              Compartilhar
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Receipt;
