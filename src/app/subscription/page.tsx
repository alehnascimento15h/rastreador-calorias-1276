'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  active: boolean;
}

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    loadPlans();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const loadPlans = async () => {
    const { data } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('active', true)
      .order('price', { ascending: true });
    
    if (data) setPlans(data);
  };

  const handleSubscribe = async (planId: string, planPrice: number) => {
    if (!currentUser) {
      alert('Você precisa estar logado para assinar um plano');
      return;
    }

    setLoading(true);

    try {
      // Criar assinatura
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: currentUser.id,
          plan_id: planId,
          status: 'pending',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (subError) throw subError;

      // Criar pagamento pendente
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: currentUser.id,
          subscription_id: subscription.id,
          amount: planPrice,
          status: 'pending',
          payment_method: 'pending',
        });

      if (paymentError) throw paymentError;

      alert('Assinatura criada com sucesso! Aguardando confirmação de pagamento.');
      router.push('/');
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      alert('Erro ao criar assinatura. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Planos Premium</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Escolha seu plano ideal
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tenha acesso completo ao app de nutrição e alcance seus objetivos de saúde
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const isYearly = plan.interval === 'yearly';
            const monthlyEquivalent = isYearly ? (Number(plan.price) / 12).toFixed(2) : null;
            const savings = isYearly ? ((9.99 * 12) - Number(plan.price)).toFixed(2) : null;

            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all hover:shadow-2xl ${
                  isYearly ? 'border-2 border-purple-500 shadow-xl' : ''
                }`}
              >
                {isYearly && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 text-sm font-bold">
                    ECONOMIZE 25%
                  </div>
                )}
                
                <CardHeader className="text-center pb-8 pt-8">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-2">
                    {isYearly ? 'Melhor custo-benefício' : 'Flexibilidade mensal'}
                  </CardDescription>
                  
                  <div className="mt-6">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold text-gray-900">
                        R$ {Number(plan.price).toFixed(2)}
                      </span>
                      <span className="text-gray-600">
                        /{isYearly ? 'ano' : 'mês'}
                      </span>
                    </div>
                    {isYearly && monthlyEquivalent && (
                      <p className="text-sm text-purple-600 font-medium mt-2">
                        Equivalente a R$ {monthlyEquivalent}/mês
                      </p>
                    )}
                    {isYearly && savings && (
                      <p className="text-sm text-green-600 font-medium mt-1">
                        Economize R$ {savings} por ano
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(plan.id, Number(plan.price))}
                    disabled={loading}
                    className={`w-full py-6 text-lg font-semibold transition-all ${
                      isYearly
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {loading ? 'Processando...' : 'Assinar Agora'}
                  </Button>

                  <p className="text-xs text-center text-gray-500">
                    {isYearly ? 'Pagamento único anual' : 'Renovação automática mensal'}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="max-w-4xl mx-auto mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Todos os planos incluem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Registro Ilimitado</h3>
                  <p className="text-sm text-gray-600">
                    Registre todas as suas refeições sem limites
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Análise Nutricional</h3>
                  <p className="text-sm text-gray-600">
                    Acompanhe calorias, proteínas, carboidratos e gorduras
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Suporte Dedicado</h3>
                  <p className="text-sm text-gray-600">
                    Tire suas dúvidas com nossa equipe
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
