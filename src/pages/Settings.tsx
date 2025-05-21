
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Settings as SettingsIcon, 
  Printer, 
  Store, 
  Database, 
  CreditCard,
  Check,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const Settings: React.FC = () => {
  // Store settings
  const [storeSettings, setStoreSettings] = useState({
    name: 'Açaí Zen',
    address: 'Rua Arthur Oscar, 220 - Vila Nova, Mansa - RJ',
    phone: '(24) 9933-9007',
    instagram: '@acaizenn',
    facebook: '@açaizen'
  });
  
  // Printer settings
  const [printers, setPrinters] = useState({
    receipt: {
      name: 'Epson TM-T20',
      connected: true,
      type: 'usb'
    },
    kitchen: {
      name: 'POS-80',
      connected: true,
      type: 'usb'
    }
  });
  
  // Supabase settings (placeholder)
  const [supabaseSettings, setSupabaseSettings] = useState({
    url: '',
    key: '',
    connected: false
  });
  
  // Payment settings (placeholder)
  const [paymentSettings, setPaymentSettings] = useState({
    stone: {
      enabled: false,
      merchantId: '',
      apiKey: ''
    },
    getnet: {
      enabled: false,
      merchantId: '',
      apiKey: ''
    },
    pix: {
      enabled: true,
      key: 'acaizen@example.com'
    }
  });
  
  // Handle store settings save
  const handleSaveStoreSettings = () => {
    // In a real app, this would persist to a database
    toast.success('Configurações da loja salvas com sucesso');
  };
  
  // Handle printer test
  const handleTestPrinter = (type: 'receipt' | 'kitchen') => {
    toast('Testando impressora...', {
      icon: <Printer size={16} />,
    });
    
    // In a real app, this would send a test print
    setTimeout(() => {
      toast.success(`Teste enviado para ${printers[type].name} com sucesso`);
    }, 1000);
  };
  
  // Handle printer search
  const handleSearchPrinters = () => {
    toast('Buscando impressoras...', {
      icon: <RefreshCw size={16} />,
    });
    
    // In a real app, this would scan for connected printers
    setTimeout(() => {
      toast.success('Impressoras encontradas e conectadas');
    }, 1500);
  };
  
  // Handle Supabase connection
  const handleConnectSupabase = () => {
    if (!supabaseSettings.url || !supabaseSettings.key) {
      toast.error('URL e chave da API são obrigatórios');
      return;
    }
    
    toast('Conectando ao Supabase...', {
      icon: <Database size={16} />,
    });
    
    // In a real app, this would test the connection
    setTimeout(() => {
      setSupabaseSettings({
        ...supabaseSettings,
        connected: true
      });
      toast.success('Conectado ao Supabase com sucesso');
    }, 1000);
  };
  
  // Handle payment settings save
  const handleSavePaymentSettings = () => {
    toast.success('Configurações de pagamento salvas com sucesso');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <SettingsIcon className="mr-2" />
          Configurações
        </h1>
      </div>
      
      <Tabs defaultValue="store">
        <TabsList className="mb-4">
          <TabsTrigger value="store">Loja</TabsTrigger>
          <TabsTrigger value="printers">Impressoras</TabsTrigger>
          <TabsTrigger value="integration">Integrações</TabsTrigger>
          <TabsTrigger value="payment">Pagamentos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store size={18} className="mr-2" />
                Informações da Loja
              </CardTitle>
              <CardDescription>
                Configure as informações que aparecerão nos cupons e relatórios.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome da Loja</label>
                <Input
                  value={storeSettings.name}
                  onChange={(e) => setStoreSettings({...storeSettings, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Endereço</label>
                <Textarea
                  value={storeSettings.address}
                  onChange={(e) => setStoreSettings({...storeSettings, address: e.target.value})}
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone</label>
                <Input
                  value={storeSettings.phone}
                  onChange={(e) => setStoreSettings({...storeSettings, phone: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Instagram</label>
                  <Input
                    value={storeSettings.instagram}
                    onChange={(e) => setStoreSettings({...storeSettings, instagram: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Facebook</label>
                  <Input
                    value={storeSettings.facebook}
                    onChange={(e) => setStoreSettings({...storeSettings, facebook: e.target.value})}
                  />
                </div>
              </div>
              
              <Button 
                className="bg-acai-purple hover:bg-acai-dark"
                onClick={handleSaveStoreSettings}
              >
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="printers">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Printer size={18} className="mr-2" />
                Impressoras
              </CardTitle>
              <CardDescription>
                Configure as impressoras utilizadas para cupons e comandas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                onClick={handleSearchPrinters}
                className="mb-6"
              >
                <RefreshCw size={16} className="mr-2" />
                Buscar Impressoras Conectadas
              </Button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Impressora de Cupom (Cliente)</h3>
                    <div className="flex items-center">
                      {printers.receipt.connected ? (
                        <span className="text-green-500 flex items-center text-sm">
                          <Check size={12} className="mr-1" />
                          Conectada
                        </span>
                      ) : (
                        <span className="text-red-500 text-sm">Desconectada</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome</label>
                      <Input
                        value={printers.receipt.name}
                        onChange={(e) => setPrinters({
                          ...printers, 
                          receipt: {...printers.receipt, name: e.target.value}
                        })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tipo de Conexão</label>
                      <select 
                        className="w-full rounded-md border border-input p-2"
                        value={printers.receipt.type}
                        onChange={(e) => setPrinters({
                          ...printers, 
                          receipt: {...printers.receipt, type: e.target.value}
                        })}
                      >
                        <option value="usb">USB</option>
                        <option value="network">Rede (Ethernet/Wi-Fi)</option>
                        <option value="bluetooth">Bluetooth</option>
                      </select>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => handleTestPrinter('receipt')}
                    >
                      Testar Impressora
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Impressora de Comanda (Cozinha)</h3>
                    <div className="flex items-center">
                      {printers.kitchen.connected ? (
                        <span className="text-green-500 flex items-center text-sm">
                          <Check size={12} className="mr-1" />
                          Conectada
                        </span>
                      ) : (
                        <span className="text-red-500 text-sm">Desconectada</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome</label>
                      <Input
                        value={printers.kitchen.name}
                        onChange={(e) => setPrinters({
                          ...printers, 
                          kitchen: {...printers.kitchen, name: e.target.value}
                        })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tipo de Conexão</label>
                      <select 
                        className="w-full rounded-md border border-input p-2"
                        value={printers.kitchen.type}
                        onChange={(e) => setPrinters({
                          ...printers, 
                          kitchen: {...printers.kitchen, type: e.target.value}
                        })}
                      >
                        <option value="usb">USB</option>
                        <option value="network">Rede (Ethernet/Wi-Fi)</option>
                        <option value="bluetooth">Bluetooth</option>
                      </select>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => handleTestPrinter('kitchen')}
                    >
                      Testar Impressora
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integration">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database size={18} className="mr-2" />
                Integração com Supabase
              </CardTitle>
              <CardDescription>
                Configure a conexão com o Supabase para integração com o catálogo digital.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">URL do Projeto Supabase</label>
                <Input
                  value={supabaseSettings.url}
                  onChange={(e) => setSupabaseSettings({...supabaseSettings, url: e.target.value})}
                  placeholder="https://xxxxxxxxxxxxx.supabase.co"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Chave da API (anon public)</label>
                <Input
                  type="password"
                  value={supabaseSettings.key}
                  onChange={(e) => setSupabaseSettings({...supabaseSettings, key: e.target.value})}
                  placeholder="eyJh..."
                />
              </div>
              
              <div className="flex items-center mb-4">
                <div className="flex-1">
                  <Button 
                    className="bg-acai-purple hover:bg-acai-dark"
                    onClick={handleConnectSupabase}
                  >
                    {supabaseSettings.connected ? 'Reconectar' : 'Conectar'}
                  </Button>
                </div>
                
                {supabaseSettings.connected && (
                  <span className="text-green-500 flex items-center">
                    <Check size={16} className="mr-1" />
                    Conectado
                  </span>
                )}
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-2">Chave de Autenticação para o Catálogo</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Utilize esta chave para autenticar requisições do seu catálogo digital.
                </p>
                <div className="bg-white border rounded p-2 font-mono text-sm overflow-auto">
                  {supabaseSettings.connected 
                    ? 'acai_zen_12345678abcdefghijklmn'
                    : 'Conecte ao Supabase primeiro para gerar a chave'}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard size={18} className="mr-2" />
                Gateways de Pagamento
              </CardTitle>
              <CardDescription>
                Configure as integrações com gateways de pagamento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Stone</h3>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="stone-enabled"
                      checked={paymentSettings.stone.enabled}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        stone: {
                          ...paymentSettings.stone,
                          enabled: e.target.checked
                        }
                      })}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="stone-enabled" className="text-sm">Ativar</label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Merchant ID</label>
                    <Input
                      value={paymentSettings.stone.merchantId}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        stone: {
                          ...paymentSettings.stone,
                          merchantId: e.target.value
                        }
                      })}
                      disabled={!paymentSettings.stone.enabled}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Chave da API</label>
                    <Input
                      type="password"
                      value={paymentSettings.stone.apiKey}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        stone: {
                          ...paymentSettings.stone,
                          apiKey: e.target.value
                        }
                      })}
                      disabled={!paymentSettings.stone.enabled}
                    />
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">GetNet</h3>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="getnet-enabled"
                      checked={paymentSettings.getnet.enabled}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        getnet: {
                          ...paymentSettings.getnet,
                          enabled: e.target.checked
                        }
                      })}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="getnet-enabled" className="text-sm">Ativar</label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Merchant ID</label>
                    <Input
                      value={paymentSettings.getnet.merchantId}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        getnet: {
                          ...paymentSettings.getnet,
                          merchantId: e.target.value
                        }
                      })}
                      disabled={!paymentSettings.getnet.enabled}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Chave da API</label>
                    <Input
                      type="password"
                      value={paymentSettings.getnet.apiKey}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        getnet: {
                          ...paymentSettings.getnet,
                          apiKey: e.target.value
                        }
                      })}
                      disabled={!paymentSettings.getnet.enabled}
                    />
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">PIX</h3>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="pix-enabled"
                      checked={paymentSettings.pix.enabled}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        pix: {
                          ...paymentSettings.pix,
                          enabled: e.target.checked
                        }
                      })}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="pix-enabled" className="text-sm">Ativar</label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Chave PIX</label>
                    <Input
                      value={paymentSettings.pix.key}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        pix: {
                          ...paymentSettings.pix,
                          key: e.target.value
                        }
                      })}
                      disabled={!paymentSettings.pix.enabled}
                    />
                    <p className="text-xs text-gray-500">
                      Esta chave será usada para gerar o QR Code PIX estático
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                className="bg-acai-purple hover:bg-acai-dark"
                onClick={handleSavePaymentSettings}
              >
                Salvar Configurações de Pagamento
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
