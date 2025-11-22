// Funções utilitárias para cálculos de calorias

/**
 * Calcula o progresso percentual de calorias consumidas
 */
export function calculateProgress(consumed: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.round((consumed / goal) * 100);
}

/**
 * Calcula calorias restantes para atingir a meta
 */
export function calculateRemainingCalories(consumed: number, goal: number): number {
  return goal - consumed;
}

/**
 * Calcula TMB (Taxa Metabólica Basal) usando fórmula de Harris-Benedict
 */
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female'
): number {
  if (gender === 'male') {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
}

/**
 * Calcula TDEE (Total Daily Energy Expenditure) baseado no nível de atividade
 */
export function calculateTDEE(
  bmr: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
): number {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  
  return Math.round(bmr * multipliers[activityLevel]);
}

/**
 * Calcula meta calórica baseada no objetivo
 */
export function calculateCalorieGoal(
  tdee: number,
  goal: 'lose' | 'maintain' | 'gain'
): number {
  if (goal === 'lose') {
    return Math.round(tdee - 500); // Déficit de 500 kcal para perder ~0.5kg/semana
  } else if (goal === 'gain') {
    return Math.round(tdee + 500); // Superávit de 500 kcal para ganhar ~0.5kg/semana
  }
  
  return tdee; // Manter peso
}
