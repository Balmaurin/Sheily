import React, { useReducer, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";

// Tipos básicos
interface VaultState {
  vaults: any[];
  currentVault: any | null;
  loading: boolean;
  error: string | null;
}

// Estado inicial
const initialState: VaultState = {
  vaults: [],
  currentVault: null,
  loading: false,
  error: null
};

// Reducer
const vaultReducer = (state: VaultState, action: any): VaultState => {
  switch (action.type) {
    case 'SET_VAULTS':
      return { ...state, vaults: action.payload };
    case 'SET_CURRENT_VAULT':
      return { ...state, currentVault: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'HYDRATE':
      return { ...state, ...action.state };
    default:
      return state;
  }
};

const VaultProviders: React.FC = () => {
  const [vaultState, dispatch] = useReducer(vaultReducer, initialState);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem('vault_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'HYDRATE', state: parsedState });
      }
    } catch (error) {
      toast({
        title: "Error de Vault",
        description: "No se pudieron cargar los datos del vault",
        variant: "destructive"
      });
    }
  }, []);

  return null; // Este es un provider, no renderiza nada
};

export default VaultProviders;
