'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, CreditCard, TrendingUp } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  active: boolean;
}

interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  started_at: string;
  expires_at: string;
  subscription_plans: SubscriptionPlan;
}

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
}

export default function AdminPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Carregar planos
    const { data: plansData } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('active', true);
    
    if (plansData) setPlans(plansData);

    // Carregar assinaturas
    const { data: subsData } = await supabase
      .from('user_subscriptions')
      .select('*, subscription_plans(*)')
      .order('created_at', { ascending: false });
    
    if (subsData) {
      setSubscriptions(subsData);
      
      // Calcular estatísticas
      const active = subsData.filter(s => s.status === 'active').length;
      const monthly = subsData
        .filter(s => s.status === 'active' && s.subscription_plans.interval === 'monthly')
        .reduce((sum, s) => sum + Number(s.subscription_plans.price), 0);
      const yearly = subsData
        .filter(s => s.status === 'active' && s.subscription_plans.interval === 'yearly')
        .reduce((sum, s) => sum + Number(s.subscription_plans.price), 0);
      
      setStats({
        totalRevenue: monthly + yearly,
        activeSubscriptions: active,
        monthlyRevenue: monthly,
        yearlyRevenue: yearly,
      });
    }

    // Carregar pagamentos
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (paymentsData) setPayments(paymentsData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
      case 'failed':
        return 'bg-red-500';
      case 'expired':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Gerencie assinaturas e pagamentos dos alunos</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Receita Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                R$ {stats.totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Assinaturas ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Assinaturas Ativas
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.activeSubscriptions}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Alunos pagantes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Receita Mensal
              </CardTitle>
              <CreditCard className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                R$ {stats.monthlyRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Planos mensais
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Receita Anual
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                R$ {stats.yearlyRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Planos anuais
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Planos Disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle>Planos de Assinatura</CardTitle>
            <CardDescription>Planos disponíveis para os alunos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="border rounded-lg p-6 bg-white hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{plan.interval === 'monthly' ? 'Mensal' : 'Anual'}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600">
                        R$ {Number(plan.price).toFixed(2)}
                      </div>
                      <p className="text-xs text-gray-500">
                        {plan.interval === 'monthly' ? '/mês' : '/ano'}
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center">
                        <span className="mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assinaturas Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Assinaturas Recentes</CardTitle>
            <CardDescription>Últimas assinaturas dos alunos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma assinatura encontrada</p>
              ) : (
                subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {sub.subscription_plans.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Iniciado em {new Date(sub.started_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          R$ {Number(sub.subscription_plans.price).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {sub.subscription_plans.interval === 'monthly' ? 'Mensal' : 'Anual'}
                        </p>
                      </div>
                      <Badge className={getStatusColor(sub.status)}>
                        {sub.status === 'active' ? 'Ativo' : 
                         sub.status === 'cancelled' ? 'Cancelado' :
                         sub.status === 'expired' ? 'Expirado' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pagamentos Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Pagamentos Recentes</CardTitle>
            <CardDescription>Últimas transações realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum pagamento encontrado</p>
              ) : (
                payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {payment.payment_method || 'Método não informado'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(payment.created_at).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(payment.created_at).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-gray-900">
                        R$ {Number(payment.amount).toFixed(2)}
                      </p>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status === 'completed' ? 'Concluído' :
                         payment.status === 'pending' ? 'Pendente' :
                         payment.status === 'failed' ? 'Falhou' : 'Reembolsado'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
