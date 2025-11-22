'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SmartWatchConnection } from '@/lib/types';
import { 
  X, 
  Watch, 
  Bluetooth, 
  Check, 
  RefreshCw,
  Smartphone,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react';

interface SmartWatchConnectorProps {
  onConnect: (connection: SmartWatchConnection) => void;
  onClose: () => void;
  currentConnection?: SmartWatchConnection;
}

export function SmartWatchConnector({ onConnect, onClose, currentConnection }: SmartWatchConnectorProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const devices = [
    { id: 'apple_watch', name: 'Apple Watch', type: 'apple_watch' as const, icon: Watch },
    { id: 'garmin', name: 'Garmin', type: 'garmin' as const, icon: Watch },
    { id: 'fitbit', name: 'Fitbit', type: 'fitbit' as const, icon: Activity },
    { id: 'samsung', name: 'Samsung Galaxy Watch', type: 'samsung' as const, icon: Watch },
    { id: 'other', name: 'Outro Dispositivo', type: 'other' as const, icon: Smartphone },
  ];

  const handleConnect = (deviceId: string, deviceName: string, deviceType: SmartWatchConnection['deviceType']) => {
    setIsScanning(true);
    
    // Simular conexão (em produção, usar Web Bluetooth API ou SDK específico)
    setTimeout(() => {
      const connection: SmartWatchConnection = {
        isConnected: true,
        deviceName,
        deviceType,
        lastSync: new Date(),
      };
      
      onConnect(connection);
      setIsScanning(false);
      
      // Salvar no localStorage
      localStorage.setItem('brAiSmartWatch', JSON.stringify(connection));
    }, 2000);
  };

  const handleDisconnect = () => {
    const connection: SmartWatchConnection = {
      isConnected: false,
    };
    
    onConnect(connection);
    localStorage.removeItem('brAiSmartWatch');
  };

  const handleSync = () => {
    setIsScanning(true);
    
    // Simular sincronização
    setTimeout(() => {
      if (currentConnection) {
        const updatedConnection: SmartWatchConnection = {
          ...currentConnection,
          lastSync: new Date(),
        };
        
        onConnect(updatedConnection);
        localStorage.setItem('brAiSmartWatch', JSON.stringify(updatedConnection));
      }
      setIsScanning(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-gray-900 border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Bluetooth className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Conectar Relógio</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Dispositivo Conectado */}
          {currentConnection?.isConnected ? (
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border-green-500/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-500/20 rounded-full">
                      <Watch className="w-8 h-8 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{currentConnection.deviceName}</h3>
                      <div className="flex items-center gap-2 text-sm text-green-400">
                        <Wifi className="w-4 h-4" />
                        <span>Conectado</span>
                      </div>
                    </div>
                  </div>
                  <Check className="w-8 h-8 text-green-400" />
                </div>

                {currentConnection.lastSync && (
                  <p className="text-sm text-gray-400">
                    Última sincronização: {new Date(currentConnection.lastSync).toLocaleString('pt-BR')}
                  </p>
                )}
              </Card>

              <div className="flex gap-3">
                <Button
                  onClick={handleSync}
                  disabled={isScanning}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Sincronizar Agora
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleDisconnect}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  <WifiOff className="w-5 h-5 mr-2" />
                  Desconectar
                </Button>
              </div>

              {/* Informações */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Dados Sincronizados</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Atividades de corrida</li>
                  <li>• Frequência cardíaca</li>
                  <li>• Calorias queimadas</li>
                  <li>• Distância percorrida</li>
                  <li>• Duração dos treinos</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Lista de Dispositivos */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Selecione seu dispositivo</h3>
                <div className="space-y-3">
                  {devices.map((device) => {
                    const Icon = device.icon;
                    return (
                      <button
                        key={device.id}
                        onClick={() => handleConnect(device.id, device.name, device.type)}
                        disabled={isScanning}
                        className="w-full p-4 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-blue-500/50 rounded-lg transition-all flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-700 group-hover:bg-blue-500/20 rounded-lg transition-colors">
                            <Icon className="w-6 h-6 text-gray-400 group-hover:text-blue-400 transition-colors" />
                          </div>
                          <span className="text-white font-medium">{device.name}</span>
                        </div>
                        {isScanning && selectedDevice === device.id ? (
                          <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                        ) : (
                          <Bluetooth className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Informações de Compatibilidade */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Compatibilidade
                </h4>
                <p className="text-sm text-gray-400 mb-3">
                  O BR AI é compatível com os principais relógios inteligentes do mercado:
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Apple Watch (Series 3 ou superior)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Garmin (Forerunner, Fenix, Vivoactive)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Fitbit (Versa, Sense, Charge)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Samsung Galaxy Watch
                  </li>
                </ul>
              </div>

              {/* Nota Técnica */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-sm text-gray-300">
                  <strong className="text-white">Nota:</strong> Certifique-se de que o Bluetooth está ativado 
                  e que seu relógio está próximo ao dispositivo.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
