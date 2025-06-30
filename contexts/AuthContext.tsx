import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/services/api';

interface User {
  id: string;
  email: string;
  name: string;
  grade?: number;
  completedLessons?: string[];
  totalLessons?: number;
  subjects?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Auto-login for demo purposes
    const autoLogin = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Attempting auto-login...');
        
        // Try to login with demo credentials
        const response = await apiService.login('student@edukins.com', 'password123');
        
        console.log('Auto-login successful:', response.user.name);
        
        setToken(response.token);
        setUser(response.user);
        
      } catch (error: any) {
        console.error('Auto-login failed:', error.message);
        setError('Failed to connect. Using demo mode.');
        
        // Set demo user even if login fails
        setUser({
          id: '1',
          email: 'student@edukins.com',
          name: 'Alex Student'
        });
        setToken('demo-token');
        
      } finally {
        setIsLoading(false);
      }
    };

    autoLogin();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.login(email, password);
      
      setToken(response.token);
      setUser(response.user);
      
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.register(email, password, name);
      
      setToken(response.token);
      setUser(response.user);
      
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    apiService.setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout, 
      isLoading, 
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}