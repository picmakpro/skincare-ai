'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // 🆕 État de montage
  
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const redirect = searchParams.get('redirect');

  // 🆕 Éviter l'hydratation mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 🆕 Ne pas afficher le formulaire tant que le composant n'est pas monté
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border border-pink-100">
          <div className="animate-pulse">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="space-y-6">
              <div className="h-12 bg-gray-300 rounded-xl"></div>
              <div className="h-12 bg-gray-300 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const actionText = {
    save: 'sauvegarder votre diagnostic',
    shop: 'accéder à la boutique complète'
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implémenter l'authentification
      console.log('Auth:', { email, action, redirect });
      
      // Simuler l'authentification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Rediriger après authentification
      window.location.href = redirect || '/dashboard';
    } catch (error) {
      console.error('Erreur auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border border-pink-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">✨</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Presque fini !
          </h2>
          <p className="text-gray-600">
            Entrez votre email pour {actionText[action as keyof typeof actionText] || 'continuer'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
              placeholder="votre@email.com"
              // 🆕 Éviter les conflits avec Dashlane
              suppressHydrationWarning
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            // 🆕 Éviter les conflits avec Dashlane
            suppressHydrationWarning
          >
            {isLoading ? 'Connexion...' : 'Continuer'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
          </p>
        </div>
      </div>
    </div>
  );
}