// Funções utilitárias para gerenciamento de assinatura

/**
 * Verifica se o trial ainda está ativo
 */
export function isTrialActive(trialStartDate?: Date): boolean {
  if (!trialStartDate) return false;
  
  const now = new Date();
  const start = new Date(trialStartDate);
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  return diffDays < 7; // 7 dias de trial
}

/**
 * Retorna o tempo restante do trial
 */
export function getTrialTimeRemaining(trialStartDate?: Date): string {
  if (!trialStartDate) return 'Trial expirado';
  
  const now = new Date();
  const start = new Date(trialStartDate);
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const remainingDays = 7 - diffDays;
  
  if (remainingDays <= 0) return 'Trial expirado';
  if (remainingDays === 1) return '1 dia restante';
  
  return `${remainingDays} dias restantes`;
}
