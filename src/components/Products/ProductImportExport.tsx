
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileInput } from '@/components/ui/file-input';
import { toast } from '@/components/ui/sonner';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Upload, FileSpreadsheet } from 'lucide-react';
import { ProductType } from '@/types/app';
import { useDataStore } from '@/stores/dataStore';

interface ProductImportExportProps {
  products: ProductType[];
}

export const ProductImportExport: React.FC<ProductImportExportProps> = ({ products }) => {
  const { addProduct } = useDataStore();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFiles, setImportFiles] = useState<File[]>([]);
  const [importInProgress, setImportInProgress] = useState(false);

  const handleFileChange = (files: File[]) => {
    setImportFiles(files);
  };

  const handleExportProducts = () => {
    try {
      // Create CSV content
      const headers = ['name', 'description', 'price', 'category', 'stock'];
      const csvContent = [
        headers.join(','),
        ...products.map(product => {
          return [
            `"${product.name}"`,
            `"${product.description || ''}"`,
            product.price,
            product.category || '',
            product.stock || 0
          ].join(',');
        })
      ].join('\n');

      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `produtos-acaizen-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Produtos exportados com sucesso!');
    } catch (error) {
      console.error('Error exporting products:', error);
      toast.error('Erro ao exportar produtos');
    }
  };

  const handleImportProducts = async () => {
    if (!importFiles.length) {
      toast.error('Nenhum arquivo selecionado');
      return;
    }

    const file = importFiles[0];
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast.error('Formato de arquivo não suportado. Use .csv ou .xlsx');
      return;
    }

    setImportInProgress(true);

    try {
      const text = await file.text();
      const rows = text.split('\n');
      const headers = rows[0].split(',');
      
      const nameIndex = headers.findIndex(h => h.trim().toLowerCase() === 'name');
      const descriptionIndex = headers.findIndex(h => h.trim().toLowerCase() === 'description');
      const priceIndex = headers.findIndex(h => h.trim().toLowerCase() === 'price');
      const categoryIndex = headers.findIndex(h => h.trim().toLowerCase() === 'category');
      const stockIndex = headers.findIndex(h => h.trim().toLowerCase() === 'stock');

      if (nameIndex === -1 || priceIndex === -1) {
        throw new Error('Formato de CSV inválido. Os campos name e price são obrigatórios.');
      }

      let importedCount = 0;
      const importPromises = [];

      // Process data rows (skip header)
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue;
        
        const values = rows[i].split(',');
        
        const productData: any = {
          name: values[nameIndex].replace(/^"|"$/g, '').trim(),
          price: parseFloat(values[priceIndex])
        };

        if (descriptionIndex !== -1) {
          productData.description = values[descriptionIndex]?.replace(/^"|"$/g, '').trim();
        }
        
        if (categoryIndex !== -1) {
          productData.category = values[categoryIndex]?.trim() || null;
        }
        
        if (stockIndex !== -1) {
          productData.stock = parseInt(values[stockIndex]) || 0;
        }
        
        // Validate required fields
        if (!productData.name || isNaN(productData.price)) {
          console.error(`Linha ${i+1} inválida. Nome e preço são obrigatórios.`);
          continue;
        }

        importPromises.push(addProduct(productData));
        importedCount++;
      }

      await Promise.all(importPromises);
      
      toast.success(`${importedCount} produtos importados com sucesso!`);
      setIsImportDialogOpen(false);
      
    } catch (error) {
      console.error('Error importing products:', error);
      toast.error(`Erro ao importar produtos: ${error instanceof Error ? error.message : 'Formato inválido'}`);
    } finally {
      setImportInProgress(false);
      setImportFiles([]);
    }
  };

  return (
    <>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          className="flex items-center"
          onClick={handleExportProducts}
        >
          <Download size={16} className="mr-2" />
          Exportar Produtos
        </Button>
        
        <Button 
          className="bg-acai-purple hover:bg-acai-dark flex items-center"
          onClick={() => setIsImportDialogOpen(true)}
        >
          <Upload size={16} className="mr-2" />
          Importar Produtos
        </Button>
      </div>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Produtos</DialogTitle>
            <DialogDescription>
              Selecione um arquivo CSV ou Excel com os dados dos produtos.
              <div className="mt-2 text-sm text-gray-500">
                Formato requerido: name, description, price, category, stock
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center p-4 border-2 border-dashed rounded-md">
              <div className="text-center">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <FileInput
                    accept=".csv,.xlsx"
                    onFilesChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4 file:rounded-md
                    file:border-0 file:text-sm file:font-semibold
                    file:bg-acai-purple file:text-white
                    hover:file:bg-acai-dark"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  CSV ou XLSX (máximo 10MB)
                </p>
              </div>
            </div>

            {importFiles.length > 0 && (
              <div className="text-sm">
                <p>Arquivo selecionado: {importFiles[0].name}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsImportDialogOpen(false)}
              disabled={importInProgress}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-acai-purple hover:bg-acai-dark flex items-center"
              onClick={handleImportProducts}
              disabled={importFiles.length === 0 || importInProgress}
            >
              <Upload size={16} className="mr-2" />
              {importInProgress ? 'Importando...' : 'Importar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
