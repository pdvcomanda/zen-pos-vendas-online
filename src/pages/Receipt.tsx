
import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDataStore } from '@/stores/dataStore';
import { Sale } from '@/types/app';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Printer, Download, Share } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { PrinterService } from '@/services/PrinterService';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
      // Try to print via middleware
      const printed = await PrinterService.printReceipt(sale);
      
      if (printed) {
        toast.success('Enviado para impressora com sucesso!');
      } else {
        throw new Error('Middleware indisponível');
      }
    } catch (error) {
      console.error('Erro na impressão:', error);
      toast.error('Erro ao enviar para impressora. Usando impressão do navegador como alternativa.');
      
      // Fallback to browser print
      window.print();
    }
  };
  
  const handleDownloadPDF = async () => {
    toast('Gerando PDF...', {
      icon: <Download size={16} />,
    });
    
    try {
      if (!receiptRef.current) {
        throw new Error('Erro ao acessar o conteúdo do cupom');
      }
      
      // Create PDF using html2canvas and jsPDF
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 297] // 80mm width (standard for thermal receipts)
      });
      
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Save the PDF
      pdf.save(`acaizen-cupom-${sale.id.substring(5, 13)}.pdf`);
      
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      
      // Fallback method - save receipt content to Supabase
      try {
        // Generate text version of receipt
        const receiptText = PrinterService.generateESCPOSCommands(sale);
        
        // Save to Supabase storage
        const { data, error } = await supabase.storage
          .from('receipts')
          .upload(
            `receipt-${sale.id}.txt`,
            receiptText,
            { contentType: 'text/plain', upsert: true }
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
          link.download = `acaizen-cupom-${sale.id.substring(5, 13)}.txt`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast.success('Cupom salvo como arquivo de texto!');
        } else {
          throw new Error('Falha ao obter URL de download');
        }
      } catch (fallbackError) {
        console.error('Erro no método alternativo:', fallbackError);
        toast.error('Não foi possível gerar o PDF. Tente novamente.');
      }
    }
  };
  
  const handleShareReceipt = () => {
    // Implemented basic sharing functionality
    if (navigator.share) {
      navigator.share({
        title: `Açaí Zen - Cupom ${sale.id.substring(5, 13)}`,
        text: `Seu cupom de compra na Açaí Zen no valor de R$ ${sale.total.toFixed(2)}`,
        url: window.location.href
      })
        .then(() => toast.success('Compartilhado com sucesso!'))
        .catch((error) => {
          console.error('Erro ao compartilhar:', error);
          toast.error('Erro ao compartilhar cupom');
        });
    } else {
      // Fallback for browsers that don't support Web Share API
      toast.info('Compartilhamento não suportado neste navegador');
    }
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
                    
                    {/* Display addons if present */}
                    {item.addons && item.addons.length > 0 && (
                      <div className="pl-4">
                        {item.addons.map((addonItem, addonIndex) => (
                          <div key={addonIndex} className="text-xs text-gray-600 flex justify-between">
                            <span>+ {addonItem.addon.name} × {addonItem.quantity}</span>
                            <span>R$ {(addonItem.addon.price * addonItem.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
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
