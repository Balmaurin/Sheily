import React, { useReducer, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";

// Tipos básicos
interface DatasetState {
  datasets: any[];
  loading: boolean;
  error: string | null;
}

// Estado inicial
const initialState: DatasetState = {
  datasets: [],
  loading: false,
  error: null
};

// Reducer
const datasetReducer = (state: DatasetState, action: any): DatasetState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_DATASETS':
      return { ...state, datasets: action.payload };
    case 'HYDRATE':
      return { ...state, ...action.state };
    default:
      return state;
  }
};

const DatasetProviders: React.FC = () => {
  const [datasetState, dispatch] = useReducer(datasetReducer, initialState);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem('dataset_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'HYDRATE', state: parsedState });
      }
    } catch (error) {
      toast({
        title: "Error de Dataset",
        description: "No se pudieron cargar los datos del dataset",
        variant: "destructive"
      });
    }
  }, []);

  const saveDatasetState = (state: DatasetState) => {
    try {
      localStorage.setItem('dataset_state', JSON.stringify(state));
    } catch (error) {
      toast({
        title: "Error de Dataset",
        description: "No se pudieron guardar los datos del dataset",
        variant: "destructive"
      });
    }
  };

  return null; // Este es un provider, no renderiza nada
};

export default DatasetProviders;
