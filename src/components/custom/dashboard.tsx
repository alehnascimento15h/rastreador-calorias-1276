'use client';

import { useState, useEffect } from 'react';
import { UserProfile, DailyProgress, Meal, RunningActivity, SmartWatchConnection } from '@/lib/types';
import { calculateProgress, calculateRemainingCalories } from '@/lib/calories';
import { formatPace, formatDuration } from '@/lib/running';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Camera, 
  TrendingDown, 
  TrendingUp, 
  Target, 
  Flame, 
  Activity,
  Calendar,
  Award,
  Plus,
  Crown,
  Clock,
  MapPin,
  Zap,
  Watch,
  Bluetooth,
  Share2
} from 'lucide-react';
import { MealAnalyzer } from './meal-analyzer';
import { RunningTracker } from './running-tracker';
import { SmartWatchConnector } from './smartwatch-connector';
import { getTrialTimeRemaining, isTrialActive } from '@/lib/subscription';
import { getMealsByDate, getDailyProgress, getUserStats } from '@/lib/supabase-actions';

interface DashboardProps {
  profile: UserProfile;
  userId: string;
  onResetProfile: () => void;
}

export function Dashboard({ profile, userId, onResetProfile }: DashboardProps) {
  const [showMealAnalyzer, setShowMealAnalyzer] = useState(false);
  const [showRunningTracker, setShowRunningTracker] = useState(false);
  const [showSmartWatchConnector, setShowSmartWatchConnector] = useState(false);
  const [smartWatchConnection, setSmartWatchConnection] = useState<SmartWatchConnection>({
    isConnected: false,
  });
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({
    date: new Date().toISOString().split('T')[0],
    caloriesConsumed: 0,
    caloriesGoal: profile.dailyCalorieGoal,
    meals: [],
    runningActivities: [],
    totalRunningCalories: 0,
    totalDistance: 0,
  });
  const [stats, setStats] = useState({
    totalMeals: 0,
    averageCalories: 0,
    currentStreak: 0,
    totalDays: 0,
  });
  const [loading, setLoading] = useState(true);

  // Carregar dados do Supabase
  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date();

      // Carregar refeições de hoje
      const { data: meals, error: mealsError } = await getMealsByDate(userId, today);
      
      if (mealsError) {
        console.error('Erro ao carregar refeições:', mealsError);
      }

      // Carregar progresso diário
      const { data: progress, error: progressError } = await getDailyProgress(userId, today);
      
      if (progressError && progressError.code !== 'PGRST116') { // PGRST116 = não encontrado
        console.error('Erro ao carregar progresso:', progressError);
      }

      // Carregar estatísticas
      const userStats = await getUserStats(userId);

      // Converter meals do Supabase para formato Meal
      const convertedMeals: Meal[] = meals ? meals.map((meal: any) => ({
        id: meal.id,
        timestamp: new Date(meal.timestamp),
        imageUrl: meal.image_url,
        totalCalories: meal.total_calories,
        totalProtein: meal.total_protein,
        totalCarbs: meal.total_carbs,
        totalFat: meal.total_fat,
        foods: meal.food_items.map((item: any) => ({
          name: item.name,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          portion: item.portion,
        })),
      })) : [];

      setDailyProgress({
        date: today.toISOString().split('T')[0],
        caloriesConsumed: progress?.calories_consumed || 0,
        caloriesGoal: progress?.calories_goal || profile.dailyCalorieGoal,
        meals: convertedMeals,
        runningActivities: [],
        totalRunningCalories: 0,
        totalDistance: 0,
      });

      setStats(userStats);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar conexão do smartwatch do localStorage
  useEffect(() => {
    const savedConnection = localStorage.getItem('brAiSmartWatch');
    if (savedConnection) {
      setSmartWatchConnection(JSON.parse(savedConnection));
    }
  }, []);

  const handleMealAdded = (meal: Meal) => {
    setDailyProgress({
      ...dailyProgress,
      caloriesConsumed: dailyProgress.caloriesConsumed + meal.totalCalories,
      meals: [...dailyProgress.meals, meal],
    });
    
    // Recarregar estatísticas
    getUserStats(userId).then(setStats);
  };

  const handleRunningActivityAdded = (activity: RunningActivity) => {
    const newActivities = [...(dailyProgress.runningActivities || []), activity];
    const totalCalories = newActivities.reduce((sum, act) => sum + act.caloriesBurned, 0);
    const totalDist = newActivities.reduce((sum, act) => sum + act.distance, 0);

    setDailyProgress({
      ...dailyProgress,
      runningActivities: newActivities,
      totalRunningCalories: totalCalories,
      totalDistance: totalDist,
      caloriesConsumed: Math.max(0, dailyProgress.caloriesConsumed - activity.caloriesBurned),
    });
  };

  const handleSmartWatchConnect = (connection: SmartWatchConnection) => {
    setSmartWatchConnection(connection);
  };

  const handleShareResults = () => {
    const weightLost = profile.weight - profile.targetWeight;
    const message = `🎉 Meu progresso no BR AI:\n\n📊 ${stats.totalDays} dias registrados\n🔥 ${stats.currentStreak} dias de sequência\n⚖️ ${Math.abs(weightLost).toFixed(1)}kg ${weightLost > 0 ? 'para perder' : 'perdidos'}\n💪 ${stats.totalMeals} refeições registradas\n\n#BRAI #Fitness #Saúde`;

    if (navigator.share) {
      navigator.share({
        title: 'Meu Progresso - BR AI',
        text: message,
      }).catch(() => {
        // Fallback para copiar para clipboard
        navigator.clipboard.writeText(message);
        alert('Mensagem copiada! Cole nas suas redes sociais.');
      });
    } else {
      // Fallback para copiar para clipboard
      navigator.clipboard.writeText(message);
      alert('Mensagem copiada! Cole nas suas redes sociais.');
    }
  };

  const progress = calculateProgress(dailyProgress.caloriesConsumed, dailyProgress.caloriesGoal);
  const remaining = calculateRemainingCalories(dailyProgress.caloriesConsumed, dailyProgress.caloriesGoal);
  const weightDiff = profile.weight - profile.targetWeight;
  
  // Verificar status da assinatura
  const isTrial = profile.subscriptionStatus === 'trial';
  const trialActive = isTrial && isTrialActive(profile.trialStartDate);
  const timeRemaining = isTrial ? getTrialTimeRemaining(profile.trialStartDate) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando seu progresso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-400 to-blue-500 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Olá, {profile.name}! 👋</h1>
              <p className="text-white/80 text-sm">
                {new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleShareResults}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Compartilhar Resultados"
              >
                <Share2 className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={onResetProfile}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <Activity className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Trial Banner */}
          {isTrial && trialActive && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-300" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">Período de Teste</p>
                <p className="text-white/70 text-xs">{timeRemaining}</p>
              </div>
              <Crown className="w-5 h-5 text-yellow-300" />
            </div>
          )}

          {/* SmartWatch Status */}
          {smartWatchConnection.isConnected ? (
            <button
              onClick={() => setShowSmartWatchConnector(true)}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 flex items-center gap-3 hover:bg-white/20 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-green-400/20 rounded-full flex items-center justify-center">
                <Watch className="w-5 h-5 text-green-300" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium text-sm">{smartWatchConnection.deviceName}</p>
                <p className="text-white/70 text-xs">Conectado</p>
              </div>
              <Bluetooth className="w-5 h-5 text-green-300" />
            </button>
          ) : (
            <button
              onClick={() => setShowSmartWatchConnector(true)}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 flex items-center gap-3 hover:bg-white/20 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-blue-400/20 rounded-full flex items-center justify-center">
                <Watch className="w-5 h-5 text-blue-300" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium text-sm">Conectar Relógio</p>
                <p className="text-white/70 text-xs">Sincronize suas atividades</p>
              </div>
              <Plus className="w-5 h-5 text-white/70" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6 pb-24">
        {/* Calorie Progress Card */}
        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-400" />
              <h2 className="text-xl font-bold text-white">Calorias Hoje</h2>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{dailyProgress.caloriesConsumed}</div>
              <div className="text-sm text-gray-400">de {dailyProgress.caloriesGoal} kcal</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden mb-4">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Progresso: {progress}%</span>
            <span className={remaining >= 0 ? 'text-green-400' : 'text-orange-400'}>
              {remaining >= 0 ? `${remaining} kcal restantes` : `${Math.abs(remaining)} kcal acima`}
            </span>
          </div>

          {/* Running Calories */}
          {dailyProgress.totalRunningCalories! > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-400 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Calorias queimadas correndo
                </span>
                <span className="text-green-400 font-bold">-{dailyProgress.totalRunningCalories} kcal</span>
              </div>
            </div>
          )}
        </Card>

        {/* Running Stats */}
        {dailyProgress.runningActivities && dailyProgress.runningActivities.length > 0 && (
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Corrida Hoje</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold text-white">{dailyProgress.totalDistance?.toFixed(2)}</div>
                <div className="text-sm text-gray-400">km</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{dailyProgress.runningActivities.length}</div>
                <div className="text-sm text-gray-400">corridas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{dailyProgress.totalRunningCalories}</div>
                <div className="text-sm text-gray-400">kcal</div>
              </div>
            </div>
          </Card>
        )}

        {/* Goal Card */}
        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-xl ${
              profile.goal === 'lose' ? 'bg-orange-500/20' :
              profile.goal === 'gain' ? 'bg-green-500/20' :
              'bg-blue-500/20'
            }`}>
              {profile.goal === 'lose' ? (
                <TrendingDown className="w-8 h-8 text-orange-400" />
              ) : profile.goal === 'gain' ? (
                <TrendingUp className="w-8 h-8 text-green-400" />
              ) : (
                <Target className="w-8 h-8 text-blue-400" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">
                {profile.goal === 'lose' ? 'Perder Peso' :
                 profile.goal === 'gain' ? 'Ganhar Peso' :
                 'Manter Peso'}
              </h3>
              <p className="text-gray-400">
                Peso atual: {profile.weight}kg → Meta: {profile.targetWeight}kg
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {Math.abs(weightDiff).toFixed(1)}kg
              </div>
              <div className="text-sm text-gray-400">
                {profile.goal === 'lose' ? 'para perder' : 
                 profile.goal === 'gain' ? 'para ganhar' : 
                 'diferença'}
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800 p-4 text-center">
            <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.totalDays}</div>
            <div className="text-sm text-gray-400">Dias</div>
          </Card>
          <Card className="bg-gray-900 border-gray-800 p-4 text-center">
            <Award className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.currentStreak}</div>
            <div className="text-sm text-gray-400">Sequência</div>
          </Card>
          <Card className="bg-gray-900 border-gray-800 p-4 text-center">
            <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {stats.averageCalories || dailyProgress.caloriesGoal}
            </div>
            <div className="text-sm text-gray-400">Média Diária</div>
          </Card>
          <Card className="bg-gray-900 border-gray-800 p-4 text-center">
            <Activity className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {stats.totalMeals}
            </div>
            <div className="text-sm text-gray-400">Refeições</div>
          </Card>
        </div>

        {/* Running Activities List */}
        {dailyProgress.runningActivities && dailyProgress.runningActivities.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Corridas de Hoje</h2>
            <div className="space-y-3">
              {dailyProgress.runningActivities.map((activity) => (
                <Card key={activity.id} className="bg-gray-900 border-gray-800 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-medium">
                        {new Date(activity.date).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {activity.source === 'smartwatch' ? '⌚ Relógio' : '📱 Manual'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div>
                      <div className="text-lg font-bold text-white">{activity.distance.toFixed(2)}</div>
                      <div className="text-xs text-gray-400">km</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{formatDuration(activity.duration)}</div>
                      <div className="text-xs text-gray-400">tempo</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{formatPace(activity.pace)}</div>
                      <div className="text-xs text-gray-400">pace</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-400">{activity.caloriesBurned}</div>
                      <div className="text-xs text-gray-400">kcal</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Meals Today */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Refeições de Hoje</h2>
          {dailyProgress.meals.length === 0 ? (
            <Card className="bg-gray-900 border-gray-800 p-8 text-center">
              <Camera className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">Nenhuma refeição registrada ainda</p>
              <Button
                onClick={() => setShowMealAnalyzer(true)}
                className="bg-gradient-to-r from-green-400 to-blue-500 text-white hover:opacity-90"
              >
                <Plus className="w-5 h-5 mr-2" />
                Adicionar Primeira Refeição
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {dailyProgress.meals.map((meal) => (
                <Card key={meal.id} className="bg-gray-900 border-gray-800 p-4">
                  <div className="flex gap-4">
                    {meal.imageUrl && (
                      <img
                        src={meal.imageUrl}
                        alt="Refeição"
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-white">
                            {new Date(meal.timestamp).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {meal.foods.length} {meal.foods.length === 1 ? 'item' : 'itens'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-400">
                            {meal.totalCalories} kcal
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 text-sm">
                        <span className="text-blue-400">P: {meal.totalProtein.toFixed(0)}g</span>
                        <span className="text-yellow-400">C: {meal.totalCarbs.toFixed(0)}g</span>
                        <span className="text-orange-400">G: {meal.totalFat.toFixed(0)}g</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <button
          onClick={() => setShowRunningTracker(true)}
          className="p-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full shadow-2xl hover:scale-110 transition-transform"
          title="Rastrear Corrida"
        >
          <MapPin className="w-6 h-6 text-white" />
        </button>
        
        {dailyProgress.meals.length > 0 && (
          <button
            onClick={() => setShowMealAnalyzer(true)}
            className="p-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full shadow-2xl hover:scale-110 transition-transform"
            title="Adicionar Refeição"
          >
            <Camera className="w-6 h-6 text-white" />
          </button>
        )}
      </div>

      {/* Modals */}
      {showMealAnalyzer && (
        <MealAnalyzer
          userId={userId}
          onMealAdded={handleMealAdded}
          onClose={() => setShowMealAnalyzer(false)}
        />
      )}

      {showRunningTracker && (
        <RunningTracker
          userWeight={profile.weight}
          onActivityAdded={handleRunningActivityAdded}
          onClose={() => setShowRunningTracker(false)}
        />
      )}

      {showSmartWatchConnector && (
        <SmartWatchConnector
          currentConnection={smartWatchConnection}
          onConnect={handleSmartWatchConnect}
          onClose={() => setShowSmartWatchConnector(false)}
        />
      )}
    </div>
  );
}
