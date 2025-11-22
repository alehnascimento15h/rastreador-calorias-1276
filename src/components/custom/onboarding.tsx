'use client';

import { useState } from 'react';
import { UserProfile, Goal, WorkoutsPerWeek, WeightGoal } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => Promise<void>;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    gender: 'male' as 'male' | 'female' | 'other',
    goal: 'lose' as Goal,
    targetWeight: '',
    activityLevel: 'moderate' as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
    workoutsPerWeek: '3-5' as WorkoutsPerWeek,
    weightGoal: 'lose_moderate' as WeightGoal,
    hasUsedCalorieApps: false,
    previousApps: [] as string[],
  });

  const calculateCalories = () => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    const age = parseInt(formData.age);

    // Fórmula de Harris-Benedict
    let bmr = 0;
    if (formData.gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    // Multiplicador de atividade
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    const tdee = bmr * activityMultipliers[formData.activityLevel];

    // Ajustar baseado no objetivo
    const goalAdjustments = {
      lose_fast: -750,
      lose_moderate: -500,
      lose_slow: -250,
      maintain: 0,
      gain_slow: 250,
      gain_moderate: 500,
      gain_fast: 750,
    };

    return Math.round(tdee + goalAdjustments[formData.weightGoal]);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const dailyCalorieGoal = calculateCalories();
      const targetWeight = parseFloat(formData.targetWeight);

      const profile: UserProfile = {
        name: formData.name,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        gender: formData.gender,
        goal: formData.goal,
        targetWeight,
        activityLevel: formData.activityLevel,
        dailyCalorieGoal,
        workoutsPerWeek: formData.workoutsPerWeek,
        weightGoal: formData.weightGoal,
        hasUsedCalorieApps: formData.hasUsedCalorieApps,
        previousApps: formData.previousApps,
        subscriptionStatus: 'trial',
        trialStartDate: new Date().toISOString(),
      };

      await onComplete(profile);
    } catch (err: any) {
      console.error('Erro ao finalizar onboarding:', err);
      
      // Mensagens de erro mais específicas
      let errorMessage = 'Erro ao salvar seu perfil. ';
      
      if (err.message) {
        if (err.message.includes('relation') && err.message.includes('does not exist')) {
          errorMessage = '❌ Tabelas do banco de dados não encontradas. Execute o SQL de criação das tabelas no Supabase primeiro.';
        } else if (err.message.includes('Invalid API key') || err.message.includes('supabaseUrl')) {
          errorMessage = '⚠️ Supabase não configurado. Configure as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.';
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          errorMessage = '🌐 Erro de conexão. Verifique sua internet ou se o Supabase está acessível.';
        } else {
          errorMessage += err.message;
        }
      } else {
        errorMessage += 'Tente novamente.';
      }
      
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gray-900/80 backdrop-blur-sm border-green-500/20 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">BR AI - Rastreador de Calorias</h1>
          <p className="text-gray-400">Passo {step} de 4</p>
          <div className="w-full bg-gray-800 h-2 rounded-full mt-4">
            <div 
              className="bg-green-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-400 text-sm font-medium mb-1">Erro ao criar perfil</p>
                <p className="text-red-300 text-sm whitespace-pre-line">{error}</p>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Informações Básicas</h2>
            
            <div>
              <Label htmlFor="name" className="text-white">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Seu nome"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age" className="text-white">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="25"
                />
              </div>

              <div>
                <Label htmlFor="gender" className="text-white">Gênero</Label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
                >
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                  <option value="other">Outro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight" className="text-white">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="70"
                />
              </div>

              <div>
                <Label htmlFor="height" className="text-white">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="170"
                />
              </div>
            </div>

            <Button 
              onClick={nextStep}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              disabled={!formData.name || !formData.age || !formData.weight || !formData.height}
            >
              Próximo
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Seus Objetivos</h2>
            
            <div>
              <Label className="text-white mb-3 block">Qual é seu objetivo principal?</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'lose', label: 'Perder Peso' },
                  { value: 'maintain', label: 'Manter Peso' },
                  { value: 'gain', label: 'Ganhar Peso' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFormData({ ...formData, goal: option.value as Goal })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.goal === option.value
                        ? 'border-green-400 bg-green-400/10 text-green-400'
                        : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="targetWeight" className="text-white">Peso Alvo (kg)</Label>
              <Input
                id="targetWeight"
                type="number"
                value={formData.targetWeight}
                onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="65"
              />
            </div>

            <div>
              <Label className="text-white mb-3 block">Velocidade do objetivo</Label>
              <select
                value={formData.weightGoal}
                onChange={(e) => setFormData({ ...formData, weightGoal: e.target.value as WeightGoal })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
              >
                <option value="lose_fast">Perder Rápido (-0.75kg/semana)</option>
                <option value="lose_moderate">Perder Moderado (-0.5kg/semana)</option>
                <option value="lose_slow">Perder Devagar (-0.25kg/semana)</option>
                <option value="maintain">Manter Peso</option>
                <option value="gain_slow">Ganhar Devagar (+0.25kg/semana)</option>
                <option value="gain_moderate">Ganhar Moderado (+0.5kg/semana)</option>
                <option value="gain_fast">Ganhar Rápido (+0.75kg/semana)</option>
              </select>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={prevStep}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
              >
                Voltar
              </Button>
              <Button 
                onClick={nextStep}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                disabled={!formData.targetWeight}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Nível de Atividade</h2>
            
            <div>
              <Label className="text-white mb-3 block">Qual seu nível de atividade diária?</Label>
              <div className="space-y-3">
                {[
                  { value: 'sedentary', label: 'Sedentário', desc: 'Pouco ou nenhum exercício' },
                  { value: 'light', label: 'Leve', desc: 'Exercício leve 1-3 dias/semana' },
                  { value: 'moderate', label: 'Moderado', desc: 'Exercício moderado 3-5 dias/semana' },
                  { value: 'active', label: 'Ativo', desc: 'Exercício intenso 6-7 dias/semana' },
                  { value: 'very_active', label: 'Muito Ativo', desc: 'Exercício muito intenso diariamente' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFormData({ ...formData, activityLevel: option.value as any })}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      formData.activityLevel === option.value
                        ? 'border-green-400 bg-green-400/10'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className={formData.activityLevel === option.value ? 'text-green-400' : 'text-white'}>
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-white mb-3 block">Quantos treinos por semana?</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: '0-2', label: '0-2 dias' },
                  { value: '3-5', label: '3-5 dias' },
                  { value: '6+', label: '6+ dias' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFormData({ ...formData, workoutsPerWeek: option.value as WorkoutsPerWeek })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.workoutsPerWeek === option.value
                        ? 'border-green-400 bg-green-400/10 text-green-400'
                        : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={prevStep}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
              >
                Voltar
              </Button>
              <Button 
                onClick={nextStep}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                Próximo
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Quase lá!</h2>
            
            <div>
              <Label className="text-white mb-3 block">Você já usou apps de contagem de calorias antes?</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormData({ ...formData, hasUsedCalorieApps: true })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.hasUsedCalorieApps
                      ? 'border-green-400 bg-green-400/10 text-green-400'
                      : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  Sim
                </button>
                <button
                  onClick={() => setFormData({ ...formData, hasUsedCalorieApps: false, previousApps: [] })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    !formData.hasUsedCalorieApps
                      ? 'border-green-400 bg-green-400/10 text-green-400'
                      : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  Não
                </button>
              </div>
            </div>

            {formData.hasUsedCalorieApps && (
              <div>
                <Label className="text-white mb-3 block">Quais apps você já usou? (opcional)</Label>
                <Input
                  value={formData.previousApps.join(', ')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    previousApps: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Ex: MyFitnessPal, Lose It, etc"
                />
              </div>
            )}

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 mt-6">
              <h3 className="text-xl font-bold text-green-400 mb-4">Seu Plano Personalizado</h3>
              <div className="space-y-2 text-white">
                <p><strong>Meta diária de calorias:</strong> {calculateCalories()} kcal</p>
                <p><strong>Peso atual:</strong> {formData.weight} kg</p>
                <p><strong>Peso alvo:</strong> {formData.targetWeight} kg</p>
                <p><strong>Diferença:</strong> {Math.abs(parseFloat(formData.weight) - parseFloat(formData.targetWeight)).toFixed(1)} kg</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={prevStep}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
                disabled={isSubmitting}
              >
                Voltar
              </Button>
              <Button 
                onClick={handleSubmit}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Começar Jornada'
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
