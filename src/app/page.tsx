import { ArrowRight, Zap, Shield, Sparkles, Check } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/10 backdrop-blur-md border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <span className="text-xl font-bold text-white">MeuApp</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
                Recursos
              </Link>
              <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">
                Preços
              </Link>
              <Link href="#about" className="text-gray-300 hover:text-white transition-colors">
                Sobre
              </Link>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full hover:scale-105 transition-transform">
                Começar
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8 border border-white/20">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-200">Novidade: Versão 2.0 disponível</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Transforme suas ideias em
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> realidade</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            A plataforma completa para criar, gerenciar e escalar seus projetos com tecnologia de ponta e design moderno.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-all shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center gap-2">
              Começar Gratuitamente
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-all border border-white/20">
              Ver Demonstração
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Recursos Poderosos
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Tudo que você precisa para criar experiências incríveis
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8 text-yellow-400" />,
                title: "Ultra Rápido",
                description: "Performance otimizada para carregar em milissegundos e proporcionar a melhor experiência."
              },
              {
                icon: <Shield className="w-8 h-8 text-blue-400" />,
                title: "Seguro",
                description: "Proteção de dados de nível empresarial com criptografia de ponta a ponta."
              },
              {
                icon: <Sparkles className="w-8 h-8 text-purple-400" />,
                title: "Intuitivo",
                description: "Interface moderna e fácil de usar, projetada para máxima produtividade."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all hover:scale-105 hover:shadow-2xl"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Planos Simples
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Escolha o plano perfeito para suas necessidades
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Básico",
                price: "Grátis",
                features: ["5 projetos", "1GB armazenamento", "Suporte por email"],
                highlight: false
              },
              {
                name: "Pro",
                price: "R$ 49/mês",
                features: ["Projetos ilimitados", "100GB armazenamento", "Suporte prioritário", "Recursos avançados"],
                highlight: true
              },
              {
                name: "Enterprise",
                price: "Personalizado",
                features: ["Tudo do Pro", "Armazenamento ilimitado", "Suporte 24/7", "SLA garantido"],
                highlight: false
              }
            ].map((plan, index) => (
              <div
                key={index}
                className={`p-8 rounded-2xl border transition-all hover:scale-105 ${
                  plan.highlight
                    ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400 shadow-2xl shadow-purple-500/30"
                    : "bg-white/5 backdrop-blur-sm border-white/10"
                }`}
              >
                {plan.highlight && (
                  <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm px-3 py-1 rounded-full mb-4">
                    Mais Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-white mb-6">{plan.price}</div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <Check className="w-5 h-5 text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-full font-semibold transition-all ${
                    plan.highlight
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 shadow-lg"
                      : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                  }`}
                >
                  Começar Agora
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <span className="text-lg font-bold text-white">MeuApp</span>
              </div>
              <p className="text-gray-400 text-sm">
                Transformando ideias em realidade desde 2024.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Recursos</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Preços</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Atualizações</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Sobre</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Carreiras</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Ajuda</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contato</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 text-center text-gray-400 text-sm">
            © 2024 MeuApp. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
