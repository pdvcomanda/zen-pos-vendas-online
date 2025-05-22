
import { Sale } from '@/types/app';

// Configuration for the printer middleware
const PRINTER_MIDDLEWARE_URL = 'http://localhost:3333/print';

/**
 * Service to handle communication with the printer middleware
 */
export const PrinterService = {
  /**
   * Send a sale receipt to the local printer middleware
   * @param sale The sale data to print
   * @returns Promise resolving to true if successful, false otherwise
   */
  printReceipt: async (sale: Sale): Promise<boolean> => {
    try {
      const response = await fetch(PRINTER_MIDDLEWARE_URL, {
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
        throw new Error(`Falha na comunicação com a impressora: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao enviar para impressão:', error);
      return false;
    }
  },

  /**
   * Check if the printer middleware is available
   * @returns Promise resolving to true if middleware is online, false otherwise
   */
  checkPrinterStatus: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${PRINTER_MIDDLEWARE_URL}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Generate ESC/POS commands for the receipt (for direct printing)
   * @param sale The sale data
   * @returns String containing ESC/POS commands
   */
  generateESCPOSCommands: (sale: Sale): string => {
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
      
      // Add addons indented
      if (item.addons && item.addons.length > 0) {
        item.addons.forEach(addonItem => {
          const addonName = `+ ${addonItem.addon.name}`.substring(0, 20).padEnd(20);
          const addonPrice = `R$ ${(addonItem.addon.price * addonItem.quantity).toFixed(2)}`;
          receipt += `    ${addonName}${addonPrice.padStart(9)}\n`;
        });
      }
      
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
  },

  /**
   * Send receipt details to the middleware and fallback to PDF if needed
   * @param sale Sale data
   * @returns Promise resolving to success status
   */
  enviarCupom: async (sale: Sale): Promise<boolean> => {
    try {
      // Try to send to the middleware first
      const printed = await PrinterService.printReceipt(sale);
      if (printed) {
        return true;
      }
      
      // If middleware fails, we'll return false to trigger the fallback in UI
      return false;
    } catch (error) {
      console.error('Erro ao enviar cupom:', error);
      return false;
    }
  }
};
