import React, { useReducer, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";

// Tipos básicos
interface SecurityState {
  securityLevel: string;
  enabled: boolean;
  error: string | null;
}

// Estado inicial
const initialState: SecurityState = {
  securityLevel: 'medium',
  enabled: true,
  error: null
};

// Reducer
const securityReducer = (state: SecurityState, action: any): SecurityState => {
  switch (action.type) {
    case 'SET_SECURITY_LEVEL':
      return { ...state, securityLevel: action.payload };
    case 'SET_ENABLED':
      return { ...state, enabled: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'HYDRATE':
      return { ...state, ...action.state };
    default:
      return state;
  }
};

const SecurityProviders: React.FC = () => {
  const [securityState, dispatch] = useReducer(securityReducer, initialState);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem('security_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'HYDRATE', state: parsedState });
      }
    } catch (error) {
      toast({
        title: "Error de Seguridad",
        description: "No se pudieron cargar los datos de seguridad",
        variant: "destructive"
      });
    }
  }, []);

  return null; // Este es un provider, no renderiza nada
};

export default SecurityProviders;
