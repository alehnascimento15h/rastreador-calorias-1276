'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Wallet, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Copy, 
  Share2,
  ArrowDownToLine,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { AffiliateData, Withdrawal } from '@/lib/types';

interface AffiliateWalletProps {
  userId: string;
  affiliateCode: string;
  onClose: () => void;
}

export function AffiliateWallet({ userId, affiliateCode, onClose }: AffiliateWalletProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'withdraw'>('overview');
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState<'cpf' | 'email' | 'phone' | 'random'>('cpf');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Dados simulados - em produção, viriam do Supabase
  const [affiliateData, setAffiliateData] = useState<AffiliateData>({
    userId,
    affiliateCode,
    totalReferrals: 8,
    activeReferrals: 6,
    totalEarnings: 450.00,
    availableBalance: 275.00,
    pendingBalance: 175.00,
    referrals: [
      {
        id: '1',
        referredUserId: 'user1',
        referredUserName: 'João Silva',
        signupDate: new Date('2024-01-15'),
        status: 'active',
        commissionAmount: 37.50,
        commissionPaid: true,
        subscriptionValue: 150.00,
      },
      {
        id: '2',
        referredUserId: 'user2',
        referredUserName: 'Maria Santos',
        signupDate: new Date('2024-01-20'),
        status: 'active',
        commissionAmount: 37.50,
        commissionPaid: true,
        subscriptionValue: 150.00,
      },
      {
        id: '3',
        referredUserId: 'user3',
        referredUserName: 'Pedro Costa',
        signupDate: new Date('2024-02-01'),
        status: 'pending',
        commissionAmount: 37.50,
        commissionPaid: false,
        subscriptionValue: 150.00,
      },
    ],
    withdrawals: [
      {
        id: '1',
        amount: 150.00,
        pixKey: '***.***.***-**',
        pixKeyType: 'cpf',
        status: 'completed',
        requestDate: new Date('2024-01-25'),
        completedDate: new Date('2024-01-26'),
        transactionId: 'TXN123456',
      },
      {
        id: '2',
        amount: 25.00,
        pixKey: '***@email.com',
        pixKeyType: 'email',
        status: 'processing',
        requestDate: new Date('2024-02-05'),
      },
    ],
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(affiliateCode);
    alert('Código copiado! Compartilhe com seus amigos.');
  };

  const handleShareCode = () => {
    const message = `🎉 Junte-se ao BR AI e ganhe 25% de desconto!\n\nUse meu código: ${affiliateCode}\n\nRastreie suas calorias, alcance seus objetivos e transforme sua saúde! 💪\n\n#BRAI #Fitness #Saúde`;

    if (navigator.share) {
      navigator.share({
        title: 'Convite BR AI',
        text: message,
      }).catch(() => {
        navigator.clipboard.writeText(message);
        alert('Mensagem copiada! Cole nas suas redes sociais.');
      });
    } else {
      navigator.clipboard.writeText(message);
      alert('Mensagem copiada! Cole nas suas redes sociais.');
    }
  };

  const handleWithdraw = async () => {
    if (!pixKey || !withdrawAmount) {
      alert('Preencha todos os campos');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount < 20) {
      alert('Valor mínimo para saque é R$ 20,00');
      return;
    }

    if (amount > affiliateData.availableBalance) {
      alert('Saldo insuficiente');
      return;
    }

    setLoading(true);

    // Simular processamento
    setTimeout(() => {
      const newWithdrawal: Withdrawal = {
        id: Date.now().toString(),
        amount,
        pixKey,
        pixKeyType,
        status: 'pending',
        requestDate: new Date(),
      };

      setAffiliateData({
        ...affiliateData,
        availableBalance: affiliateData.availableBalance - amount,
        withdrawals: [newWithdrawal, ...affiliateData.withdrawals],
      });

      setShowWithdrawForm(false);
      setPixKey('');
      setWithdrawAmount('');
      setLoading(false);
      alert('Solicitação de saque enviada! Processamento em até 2 dias úteis.');
    }, 1500);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'processing':
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'processing':
        return 'Processando';
      case 'pending':
        return 'Pendente';
      case 'failed':
        return 'Falhou';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Carteira de Afiliado</h1>
                <p className="text-gray-400 text-sm">Ganhe 25% por indicação</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border-green-500/30 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Saldo Disponível</span>
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                R$ {affiliateData.availableBalance.toFixed(2)}
              </div>
              <p className="text-xs text-gray-400 mt-1">Pronto para saque</p>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Saldo Pendente</span>
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                R$ {affiliateData.pendingBalance.toFixed(2)}
              </div>
              <p className="text-xs text-gray-400 mt-1">Aguardando confirmação</p>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Total Ganho</span>
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                R$ {affiliateData.totalEarnings.toFixed(2)}
              </div>
              <p className="text-xs text-gray-400 mt-1">Desde o início</p>
            </Card>
          </div>

          {/* Affiliate Code Card */}
          <Card className="bg-gray-900 border-gray-800 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Seu Código de Afiliado</h3>
                <p className="text-sm text-gray-400">Compartilhe e ganhe 25% por cada amigo</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            
            <div className="flex gap-3 mb-4">
              <div className="flex-1 bg-gray-800 rounded-lg p-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-400 tracking-wider">
                  {affiliateCode}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCopyCode}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Código
              </Button>
              <Button
                onClick={handleShareCode}
                className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 text-white hover:opacity-90"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </Card>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('referrals')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'referrals'
                  ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Indicações ({affiliateData.totalReferrals})
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'withdraw'
                  ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Saques
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <Card className="bg-gray-900 border-gray-800 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Estatísticas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-3xl font-bold text-white">{affiliateData.totalReferrals}</div>
                    <div className="text-sm text-gray-400">Total de Indicações</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-400">{affiliateData.activeReferrals}</div>
                    <div className="text-sm text-gray-400">Indicações Ativas</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">
                      R$ {(affiliateData.totalEarnings / affiliateData.totalReferrals || 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-400">Média por Indicação</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-400">25%</div>
                    <div className="text-sm text-gray-400">Taxa de Comissão</div>
                  </div>
                </div>
              </Card>

              <Card className="bg-gray-900 border-gray-800 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Como Funciona</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <span className="text-green-400 font-bold">1</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Compartilhe seu código</p>
                      <p className="text-sm text-gray-400">Envie para amigos e familiares</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <span className="text-blue-400 font-bold">2</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Eles se cadastram</p>
                      <p className="text-sm text-gray-400">Usando seu código de afiliado</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <span className="text-purple-400 font-bold">3</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Você ganha 25%</p>
                      <p className="text-sm text-gray-400">De cada assinatura confirmada</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'referrals' && (
            <div className="space-y-3">
              {affiliateData.referrals.length === 0 ? (
                <Card className="bg-gray-900 border-gray-800 p-8 text-center">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 mb-4">Nenhuma indicação ainda</p>
                  <Button
                    onClick={handleShareCode}
                    className="bg-gradient-to-r from-green-400 to-blue-500 text-white hover:opacity-90"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar Código
                  </Button>
                </Card>
              ) : (
                affiliateData.referrals.map((referral) => (
                  <Card key={referral.id} className="bg-gray-900 border-gray-800 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white">{referral.referredUserName}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            referral.status === 'active' 
                              ? 'bg-green-500/20 text-green-400'
                              : referral.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {referral.status === 'active' ? 'Ativo' : 
                             referral.status === 'pending' ? 'Pendente' : 'Cancelado'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">
                          Cadastro: {referral.signupDate.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">
                          R$ {referral.commissionAmount.toFixed(2)}
                        </div>
                        <p className="text-xs text-gray-400">
                          {referral.commissionPaid ? 'Pago' : 'Pendente'}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'withdraw' && (
            <div className="space-y-4">
              {!showWithdrawForm ? (
                <>
                  <Card className="bg-gray-900 border-gray-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">Solicitar Saque</h3>
                        <p className="text-sm text-gray-400">Valor mínimo: R$ 20,00</p>
                      </div>
                      <ArrowDownToLine className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-white mb-1">
                        R$ {affiliateData.availableBalance.toFixed(2)}
                      </div>
                      <p className="text-sm text-gray-400">Disponível para saque</p>
                    </div>
                    <Button
                      onClick={() => setShowWithdrawForm(true)}
                      disabled={affiliateData.availableBalance < 20}
                      className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white hover:opacity-90 disabled:opacity-50"
                    >
                      Solicitar Saque via PIX
                    </Button>
                  </Card>

                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-white">Histórico de Saques</h3>
                    {affiliateData.withdrawals.length === 0 ? (
                      <Card className="bg-gray-900 border-gray-800 p-8 text-center">
                        <ArrowDownToLine className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">Nenhum saque realizado ainda</p>
                      </Card>
                    ) : (
                      affiliateData.withdrawals.map((withdrawal) => (
                        <Card key={withdrawal.id} className="bg-gray-900 border-gray-800 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(withdrawal.status)}
                              <div>
                                <div className="font-medium text-white">
                                  R$ {withdrawal.amount.toFixed(2)}
                                </div>
                                <p className="text-sm text-gray-400">
                                  {withdrawal.requestDate.toLocaleDateString('pt-BR')}
                                </p>
                                <p className="text-xs text-gray-500">
                                  PIX: {withdrawal.pixKey}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`text-sm font-medium ${
                                withdrawal.status === 'completed' ? 'text-green-400' :
                                withdrawal.status === 'processing' || withdrawal.status === 'pending' ? 'text-yellow-400' :
                                'text-red-400'
                              }`}>
                                {getStatusText(withdrawal.status)}
                              </span>
                              {withdrawal.completedDate && (
                                <p className="text-xs text-gray-500">
                                  {withdrawal.completedDate.toLocaleDateString('pt-BR')}
                                </p>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <Card className="bg-gray-900 border-gray-800 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">Solicitar Saque via PIX</h3>
                    <button
                      onClick={() => setShowWithdrawForm(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Tipo de Chave PIX
                      </label>
                      <select
                        value={pixKeyType}
                        onChange={(e) => setPixKeyType(e.target.value as any)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-400"
                      >
                        <option value="cpf">CPF</option>
                        <option value="email">E-mail</option>
                        <option value="phone">Telefone</option>
                        <option value="random">Chave Aleatória</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Chave PIX
                      </label>
                      <input
                        type="text"
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                        placeholder={
                          pixKeyType === 'cpf' ? '000.000.000-00' :
                          pixKeyType === 'email' ? 'seu@email.com' :
                          pixKeyType === 'phone' ? '(00) 00000-0000' :
                          'Chave aleatória'
                        }
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Valor do Saque
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          R$
                        </span>
                        <input
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="0,00"
                          min="20"
                          max={affiliateData.availableBalance}
                          step="0.01"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Disponível: R$ {affiliateData.availableBalance.toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-300">
                          <p className="font-medium mb-1">Informações Importantes:</p>
                          <ul className="space-y-1 text-xs">
                            <li>• Valor mínimo: R$ 20,00</li>
                            <li>• Processamento em até 2 dias úteis</li>
                            <li>• Sem taxas de saque</li>
                            <li>• Verifique seus dados antes de confirmar</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => setShowWithdrawForm(false)}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleWithdraw}
                        disabled={loading || !pixKey || !withdrawAmount}
                        className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 text-white hover:opacity-90 disabled:opacity-50"
                      >
                        {loading ? 'Processando...' : 'Confirmar Saque'}
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
