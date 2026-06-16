/**
 * L'Agora - Homepage (Landing Page)
 */
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Share2, Lock, MessageSquare, CheckCircle,
  BookOpen, Lightbulb, Heart,
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: BookOpen,
      title: 'Soutien Académique',
      description: 'Accédez à des ressources pédagogiques, des conseils d\'étude et du tutorat entre pairs.',
    },
    {
      icon: Heart,
      title: 'Solidarité Étudiante',
      description: 'Entraider partage vos expériences et bénéficiez du soutien de la communauté.',
    },
    {
      icon: Lock,
      title: 'Partage Anonyme',
      description: 'Posez vos questions sans révéler votre identité pour plus de liberté d\'expression.',
    },
    {
      icon: MessageSquare,
      title: 'Discussions Sûres',
      description: 'Un environnement modéré où le respect et l\'inclusivité sont garantis.',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Créer votre compte',
      description: 'Inscrivez-vous en quelques secondes avec votre email universitaire.',
    },
    {
      number: '2',
      title: 'Connectez-vous',
      description: 'Explorez la communauté et découvrez les publications des autres étudiants.',
    },
    {
      number: '3',
      title: 'Partagez et aidez',
      description: 'Publiez vos annonces, posez des questions, et aidez les autres membres.',
    },
  ];

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden -mx-4 -mt-6 px-4">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=2000&q=80')",
            backgroundAttachment: 'fixed',
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            L'Agora
          </h1>
          <p className="text-xl sm:text-2xl mb-8 text-gray-100 font-light leading-relaxed">
            La plateforme d'entraide et de solidarité des étudiants tunisiens
          </p>
          <p className="text-lg text-gray-200 mb-10 max-w-2xl mx-auto">
            Partagez vos connaissances, trouvez du soutien, et construisez une communauté universitaire forte.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Créer un compte
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg transition-all backdrop-blur-sm border border-white/30"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            À propos de L'Agora
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Aide Mutuelle</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Les étudiants s'entraident, se conseillent et partagent leurs expériences pour réussir ensemble.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Partage de Ressources</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Accédez à des ressources éducatives, des cours, des conseils et des bons plans partagés par la communauté.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Soutien Communautaire</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Trouvez du soutien émotionnel et académique dans une communauté bienveillante et solidaire.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Environnement Sûr</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Un espace modéré et inclusif où chacun peut s'exprimer librement en toute sécurité.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Nos Fonctionnalités
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:shadow-lg"
                >
                  <Icon className="w-10 h-10 text-indigo-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Comment ça marche ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {steps.map((step, idx) => (
              <div key={idx} className="relative">
                {/* Connector line */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-1/2 h-1 bg-gradient-to-r from-indigo-300 to-indigo-100 dark:from-indigo-700 dark:to-indigo-900"></div>
                )}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-2 text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-900 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/10 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/10 rounded-full -ml-48 -mb-48"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Prêt à rejoindre la communauté ?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Devenez membre de L'Agora et commencez à partager, apprendre et aider les autres étudiants.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              Créer mon compte
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-indigo-600/30 hover:bg-indigo-600/50 text-white font-bold rounded-lg transition-all border border-white/30"
            >
              J'ai un compte
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
