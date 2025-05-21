
import React from 'react';
import { PaymentMethod } from '@/types/app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Banknote, CreditCard, QrCode, ReceiptText } from 'lucide-react';

interface CheckoutDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cartTotal: number;
  customerName: string;
  setCustomerName: (name: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  amountPaid: number;
  setAmountPaid: (amount: number) => void;
  onCompleteSale: () => Promise<void>;
}

export const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  isOpen,
  onOpenChange,
  cartTotal,
  customerName,
  setCustomerName,
  paymentMethod,
  setPaymentMethod,
  amountPaid,
  setAmountPaid,
  onCompleteSale
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            className="bg-acai-green hover:bg-acai-green/90 flex items-center"
            onClick={onCompleteSale}
          >
            <ReceiptText size={16} className="mr-2" />
            Finalizar e Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
