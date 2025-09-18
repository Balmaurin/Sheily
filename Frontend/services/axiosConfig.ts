import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

// Configuración global de Axios
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  timeout: 10000,
});

// Interceptor de solicitudes
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Manejar errores de solicitud
    toast({
      title: "Error de Solicitud",
      description: "No se pudo preparar la solicitud",
      variant: "destructive"
    });
    return Promise.reject(error);
  }
);

// Interceptor de respuestas
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar errores de respuesta
    const errorMessage = error.response?.data?.message || 'Error desconocido';
    
    toast({
      title: "Error de Servidor",
      description: errorMessage,
      variant: "destructive"
    });

    return Promise.reject(error);
  }
);

export default axiosInstance;
