import React, { useReducer, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";

// Tipos básicos
interface UserState {
  users: any[];
  currentUser: any | null;
  loading: boolean;
  error: string | null;
}

// Estado inicial
const initialState: UserState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null
};

// Reducer
const userReducer = (state: UserState, action: any): UserState => {
  switch (action.type) {
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
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

const UserProviders: React.FC = () => {
  const [userState, dispatch] = useReducer(userReducer, initialState);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem('user_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'HYDRATE', state: parsedState });
      }
    } catch (error) {
      toast({
        title: "Error de Usuario",
        description: "No se pudieron cargar los datos del usuario",
        variant: "destructive"
      });
    }
  }, []);

  return null; // Este es un provider, no renderiza nada
};

export default UserProviders;
