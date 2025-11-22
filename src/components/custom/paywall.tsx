'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Crown, Sparkles } from 'lucide-react';
import { SUBSCRIPTION_PRICE, getTrialTimeRemaining } from '@/lib/subscription';

interface PaywallProps {
  trialStartDate: string;
  onSubscribe: () => void;
}

export function Paywall({ trialStartDate, onSubscribe }: PaywallProps) {
  const [loading, setLoading] = useState(false);
  const timeRemaining = getTrialTimeRemaining(trialStartDate);
  const isExpired = timeRemaining === 'Trial expirado';

  const handleSubscribe = async () => {
    setLoading(true);
    // Aqui você integraria com Stripe
    // Por enquanto, vamos simular o processo
    await new Promise(resolve => setTimeout(resolve, 1500));
    onSubscribe();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <Card className="max-w-lg w-full bg-gradient-to-br from-gray-900 to-black border-2 border-green-400/20 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-4 shadow-lg shadow-green-400/50">
            <Crown className="w-10 h-10 text-black" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            {isExpired ? 'Trial Expirado' : 'Continue sua Jornada'}
          </h1>
          
          {!isExpired && (
            <p className="text-gray-400 text-sm">
              {timeRemaining} do seu período de teste
            </p>
          )}
        </div>

        <div className="space-y-6 mb-8">
          <div className="bg-gradient-to-r from-green-400/10 to-emerald-500/10 border border-green-400/30 rounded-xl p-6">
            <div className="flex items-baseline justify-center mb-4">
              <span className="text-5xl font-bold text-white">R$ {SUBSCRIPTION_PRICE.toFixed(2)}</span>
              <span className="text-gray-400 ml-2">/mês</span>
            </div>
            <p className="text-center text-gray-300 text-sm">
              Acesso ilimitado a todas as funcionalidades
            </p>
          </div>

          <div className="space-y-3">
            {[
              'Análise ilimitada de refeições com IA',
              'Rastreamento completo de calorias e macros',
              'Metas personalizadas de peso',
              'Histórico completo de progresso',
              'Gráficos e estatísticas detalhadas',
              'Suporte prioritário'
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-400/20 rounded-full flex items-center justify-center mt-0.5">
                  <Check className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-gray-300 text-sm">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-black font-bold py-6 text-lg shadow-lg shadow-green-400/30 transition-all duration-300 hover:scale-105"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Processando...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Assinar Agora
            </div>
          )}
        </Button>

        <p className="text-center text-gray-500 text-xs mt-4">
          Cancele a qualquer momento. Sem taxas ocultas.
        </p>
      </Card>
    </div>
  );
}
