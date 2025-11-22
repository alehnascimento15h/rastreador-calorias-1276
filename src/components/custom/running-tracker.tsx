'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RunningActivity } from '@/lib/types';
import { 
  calculateRunningCalories, 
  calculatePace, 
  formatPace, 
  formatDuration 
} from '@/lib/running';
import { 
  X, 
  Play, 
  Pause, 
  Square, 
  MapPin, 
  Clock, 
  Zap, 
  TrendingUp,
  Heart
} from 'lucide-react';

interface RunningTrackerProps {
  userWeight: number;
  onActivityAdded: (activity: RunningActivity) => void;
  onClose: () => void;
}

export function RunningTracker({ userWeight, onActivityAdded, onClose }: RunningTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Modo manual
  const [manualDistance, setManualDistance] = useState('');
  const [manualDuration, setManualDuration] = useState('');

  const startTracking = () => {
    setIsTracking(true);
    setIsPaused(false);
    setStartTime(new Date());
    setDistance(0);
    setDuration(0);

    // Simular rastreamento (em produção, usar GPS real)
    const id = setInterval(() => {
      setDuration(prev => prev + 1);
      // Simular distância (em produção, usar GPS)
      setDistance(prev => prev + 0.002); // ~120m/min (pace 8:20/km)
    }, 1000);

    setIntervalId(id);
  };

  const pauseTracking = () => {
    setIsPaused(true);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const resumeTracking = () => {
    setIsPaused(false);
    const id = setInterval(() => {
      setDuration(prev => prev + 1);
      setDistance(prev => prev + 0.002);
    }, 1000);
    setIntervalId(id);
  };

  const stopTracking = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }

    const pace = calculatePace(distance, duration / 60);
    const calories = calculateRunningCalories(userWeight, distance, duration / 60);

    const activity: RunningActivity = {
      id: Date.now().toString(),
      date: startTime || new Date(),
      distance: parseFloat(distance.toFixed(2)),
      duration: duration / 60,
      pace,
      caloriesBurned: calories,
      source: 'manual',
    };

    onActivityAdded(activity);
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dist = parseFloat(manualDistance);
    const dur = parseFloat(manualDuration);

    if (dist <= 0 || dur <= 0) {
      alert('Por favor, insira valores válidos');
      return;
    }

    const pace = calculatePace(dist, dur);
    const calories = calculateRunningCalories(userWeight, dist, dur);

    const activity: RunningActivity = {
      id: Date.now().toString(),
      date: new Date(),
      distance: dist,
      duration: dur,
      pace,
      caloriesBurned: calories,
      source: 'manual',
    };

    onActivityAdded(activity);
    onClose();
  };

  const currentPace = duration > 0 ? calculatePace(distance, duration / 60) : 0;
  const currentCalories = duration > 0 ? calculateRunningCalories(userWeight, distance, duration / 60) : 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-gray-900 border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Rastreador de Corrida</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {!isTracking ? (
            <div className="space-y-6">
              {/* Botão Iniciar Rastreamento */}
              <div className="text-center py-8">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Play className="w-16 h-16 text-white" />
                </div>
                <Button
                  onClick={startTracking}
                  className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-lg px-8 py-6 hover:opacity-90"
                >
                  Iniciar Corrida
                </Button>
                <p className="text-gray-400 text-sm mt-4">
                  Rastreie sua corrida em tempo real
                </p>
              </div>

              {/* Divisor */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-900 text-gray-400">ou</span>
                </div>
              </div>

              {/* Entrada Manual */}
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Adicionar Manualmente</h3>
                
                <div>
                  <Label htmlFor="distance" className="text-white">Distância (km)</Label>
                  <Input
                    id="distance"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 5.0"
                    value={manualDistance}
                    onChange={(e) => setManualDistance(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="duration" className="text-white">Duração (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    step="1"
                    placeholder="Ex: 30"
                    value={manualDuration}
                    onChange={(e) => setManualDuration(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white"
                >
                  Adicionar Corrida
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats em Tempo Real */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gray-800 border-gray-700 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-400 text-sm">Distância</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {distance.toFixed(2)} <span className="text-lg text-gray-400">km</span>
                  </div>
                </Card>

                <Card className="bg-gray-800 border-gray-700 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-green-400" />
                    <span className="text-gray-400 text-sm">Tempo</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {formatDuration(duration / 60)}
                  </div>
                </Card>

                <Card className="bg-gray-800 border-gray-700 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-400 text-sm">Pace</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {formatPace(currentPace)} <span className="text-lg text-gray-400">/km</span>
                  </div>
                </Card>

                <Card className="bg-gray-800 border-gray-700 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-orange-400" />
                    <span className="text-gray-400 text-sm">Calorias</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {currentCalories} <span className="text-lg text-gray-400">kcal</span>
                  </div>
                </Card>
              </div>

              {/* Controles */}
              <div className="flex gap-4 justify-center">
                {!isPaused ? (
                  <Button
                    onClick={pauseTracking}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-6"
                  >
                    <Pause className="w-6 h-6 mr-2" />
                    Pausar
                  </Button>
                ) : (
                  <Button
                    onClick={resumeTracking}
                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-6"
                  >
                    <Play className="w-6 h-6 mr-2" />
                    Continuar
                  </Button>
                )}
                
                <Button
                  onClick={stopTracking}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-6"
                >
                  <Square className="w-6 h-6 mr-2" />
                  Finalizar
                </Button>
              </div>

              {/* Informação */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-300">
                    {isPaused ? 'Corrida pausada. Clique em Continuar para retomar.' : 'Corrida em andamento. Seus dados estão sendo rastreados.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
