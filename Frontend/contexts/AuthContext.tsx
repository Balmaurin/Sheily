'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import axiosInstance from '@/services/axiosConfig';
import { toast } from "@/components/ui/use-toast";

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  tokens: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('🔄 AuthContext: Verificando estado guardado...');
    
    // Verificar si hay un token guardado al cargar la página
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    console.log('🔍 Token guardado:', !!savedToken, 'Usuario guardado:', !!savedUser);
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('✅ Datos de usuario válidos encontrados:', userData.username);
        
        setToken(savedToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Configurar el token en axios para todas las peticiones
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        
        console.log('🔑 Estado de autenticación restaurado exitosamente');
      } catch (error) {
        toast({
          title: "Error de Autenticación",
          description: "No se pudieron cargar los datos de usuario guardados",
          variant: "destructive"
        });
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        console.log('🧹 Datos corruptos eliminados del localStorage');
      }
    } else {
      console.log('ℹ️ No hay datos de autenticación guardados');
    }
    
    // Marcar como inicializado
    setIsInitialized(true);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Iniciando proceso de login para:', username);

      const response = await axiosInstance.post('/api/auth/login', {
        username,
        password
      });

      console.log('📡 Respuesta del servidor:', response.status, response.data);

      if (response.data.token) {
        const userData = response.data.user;
        const authToken = response.data.token;
        
        console.log('✅ Login exitoso, configurando usuario:', userData);
        
        // Guardar en estado y localStorage
        setToken(authToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Configurar el token en axios para todas las peticiones
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        
        console.log('🔑 Token configurado en axios, estado actualizado');
        return true;
      }
      
      console.log('❌ No se recibió token en la respuesta');
      toast({
        title: "Error de Login",
        description: "No se pudo iniciar sesión. Verifica tus credenciales.",
        variant: "destructive"
      });
      return false;
    } catch (error) {
      console.error('💥 Error durante el login:', error);
      toast({
        title: "Error de Login",
        description: "No se pudo iniciar sesión. Verifica tus credenciales.",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Remover el token de axios
    delete axios.defaults.headers.common['Authorization'];
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    isInitialized
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
