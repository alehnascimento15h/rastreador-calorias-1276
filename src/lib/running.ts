// Funções utilitárias para cálculos de corrida

/**
 * Calcula calorias queimadas durante corrida
 * Fórmula: MET * peso (kg) * duração (horas)
 * MET para corrida varia de 8-12 dependendo da velocidade
 */
export function calculateRunningCalories(
  weight: number,
  distance: number,
  duration: number
): number {
  // Calcular velocidade (km/h)
  const speed = distance / (duration / 60);
  
  // Determinar MET baseado na velocidade
  let met = 8; // Corrida leve
  if (speed >= 8) met = 9;
  if (speed >= 10) met = 10;
  if (speed >= 12) met = 11;
  if (speed >= 14) met = 12;
  
  // Calcular calorias
  const calories = met * weight * (duration / 60);
  
  return Math.round(calories);
}

/**
 * Calcula o pace (min/km)
 */
export function calculatePace(distance: number, duration: number): number {
  if (distance === 0) return 0;
  return duration / distance;
}

/**
 * Formata pace para exibição (mm:ss)
 */
export function formatPace(pace: number): string {
  if (pace === 0) return '0:00';
  
  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Formata duração para exibição (hh:mm:ss ou mm:ss)
 */
export function formatDuration(duration: number): string {
  const hours = Math.floor(duration / 60);
  const minutes = Math.floor(duration % 60);
  const seconds = Math.round((duration % 1) * 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
