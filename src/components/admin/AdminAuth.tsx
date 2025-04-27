'use client';

import { useState, useEffect } from 'react';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';

interface AdminAuthProps {
  children: React.ReactNode;
}

export default function AdminAuth({ children }: AdminAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const { isDark } = useThemeLanguage();
  
  // Sayfa yüklendiğinde oturum kontrolü yap
  useEffect(() => {
    const authStatus = sessionStorage.getItem('adminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);
  
  // Şifre kontrolü
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuthenticated', 'true');
      setError('');
    } else {
      setError('Yanlış şifre. Lütfen tekrar deneyin.');
      setPassword('');
    }
  };
  
  // Yükleniyor ekranı
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-blue"></div>
      </div>
    );
  }
  
  // Kimlik doğrulama başarılıysa children'ı göster
  if (isAuthenticated) {
    return children;
  }
  
  // Kimlik doğrulama ekranı
  return (
    <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-dark-grey' : 'bg-very-light-grey'}`}>
      <div className={`w-full max-w-md p-8 space-y-6 rounded-lg shadow-lg ${isDark ? 'bg-graphite' : 'bg-white'}`}>
        <div className="space-y-2 text-center">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-dark-grey'}`}>
            PadokClub Admin Panel
          </h1>
          <p className={`text-sm ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
            Devam etmek için şifre giriniz
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label 
              htmlFor="password" 
              className={`text-sm font-medium ${isDark ? 'text-silver' : 'text-medium-grey'}`}
            >
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                isDark
                  ? 'bg-carbon-grey border-dark-grey text-white'
                  : 'bg-white border-light-grey text-dark-grey'
              }`}
              required
              autoFocus
            />
            {error && (
              <p className="text-f1-red text-sm mt-1">
                {error}
              </p>
            )}
          </div>
          
          <button
            type="submit"
            className={`w-full px-4 py-2 font-medium rounded-md transition-colors ${
              isDark
                ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
                : 'bg-race-blue text-white hover:bg-race-blue/80'
            }`}
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}