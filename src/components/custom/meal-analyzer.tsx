'use client';

import { useState, useRef } from 'react';
import { Meal, FoodItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Camera, X, Loader2, Utensils } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { createMeal } from '@/lib/supabase-actions';

interface MealAnalyzerProps {
  userId: string;
  onMealAdded: (meal: Meal) => void;
  onClose: () => void;
}

export function MealAnalyzer({ userId, onMealAdded, onClose }: MealAnalyzerProps) {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<Meal | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeMeal = async () => {
    if (!image) return;

    setAnalyzing(true);
    
    // Simular análise de IA (em produção, usar OpenAI Vision API)
    setTimeout(() => {
      // Dados simulados - em produção, isso viria da análise de IA
      const mockFoods: FoodItem[] = [
        {
          name: 'Arroz Branco',
          calories: 206,
          protein: 4.3,
          carbs: 45,
          fat: 0.4,
          portion: '1 xícara (158g)',
        },
        {
          name: 'Frango Grelhado',
          calories: 165,
          protein: 31,
          carbs: 0,
          fat: 3.6,
          portion: '100g',
        },
        {
          name: 'Feijão Preto',
          calories: 132,
          protein: 8.9,
          carbs: 23.7,
          fat: 0.5,
          portion: '1/2 xícara (86g)',
        },
        {
          name: 'Salada Verde',
          calories: 25,
          protein: 2,
          carbs: 5,
          fat: 0.3,
          portion: '1 tigela',
        },
      ];

      const totalCalories = mockFoods.reduce((sum, food) => sum + food.calories, 0);
      const totalProtein = mockFoods.reduce((sum, food) => sum + food.protein, 0);
      const totalCarbs = mockFoods.reduce((sum, food) => sum + food.carbs, 0);
      const totalFat = mockFoods.reduce((sum, food) => sum + food.fat, 0);

      const meal: Meal = {
        id: Date.now().toString(),
        timestamp: new Date(),
        imageUrl: image,
        foods: mockFoods,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
      };

      setResult(meal);
      setAnalyzing(false);
    }, 2000);
  };

  const handleSaveMeal = async () => {
    if (!result) return;

    setSaving(true);
    try {
      // Salvar no Supabase
      const { data, error } = await createMeal(userId, result);

      if (error) {
        console.error('Erro ao salvar refeição:', error);
        alert('Erro ao salvar refeição. Tente novamente.');
        setSaving(false);
        return;
      }

      // Atualizar o resultado com o ID do Supabase
      if (data) {
        result.id = data.id;
      }

      onMealAdded(result);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar refeição:', error);
      alert('Erro ao salvar refeição. Verifique sua conexão.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">Analisar Refeição</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image Upload Area */}
          {!image && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center cursor-pointer hover:border-green-500 transition-colors"
              >
                <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-white font-medium mb-2">Tire uma foto da sua refeição</p>
                <p className="text-gray-400 text-sm">ou clique para fazer upload</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Image Preview */}
          {image && !result && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden">
                <img src={image} alt="Refeição" className="w-full h-auto" />
                <button
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <Button
                onClick={analyzeMeal}
                disabled={analyzing}
                className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white hover:opacity-90"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  'Analisar Refeição'
                )}
              </Button>
            </div>
          )}

          {/* Analysis Result */}
          {result && (
            <div className="space-y-6">
              <div className="relative rounded-xl overflow-hidden">
                <img src={image!} alt="Refeição" className="w-full h-auto" />
              </div>

              {/* Total Macros */}
              <Card className="bg-black border-gray-800 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Resumo Nutricional</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{result.totalCalories}</div>
                    <div className="text-sm text-gray-400">Calorias</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">{result.totalProtein.toFixed(1)}g</div>
                    <div className="text-sm text-gray-400">Proteína</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">{result.totalCarbs.toFixed(1)}g</div>
                    <div className="text-sm text-gray-400">Carboidratos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400">{result.totalFat.toFixed(1)}g</div>
                    <div className="text-sm text-gray-400">Gorduras</div>
                  </div>
                </div>
              </Card>

              {/* Food Items */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white">Alimentos Detectados</h3>
                {result.foods.map((food, index) => (
                  <Card key={index} className="bg-black border-gray-800 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-white">{food.name}</h4>
                        <p className="text-sm text-gray-400">{food.portion}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">{food.calories} kcal</div>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-blue-400">P: {food.protein}g</span>
                      <span className="text-yellow-400">C: {food.carbs}g</span>
                      <span className="text-orange-400">G: {food.fat}g</span>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setImage(null);
                    setResult(null);
                  }}
                  variant="outline"
                  className="flex-1 bg-black border-gray-700 text-white hover:bg-gray-800"
                  disabled={saving}
                >
                  Analisar Outra
                </Button>
                <Button
                  onClick={handleSaveMeal}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 text-white hover:opacity-90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Refeição'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
