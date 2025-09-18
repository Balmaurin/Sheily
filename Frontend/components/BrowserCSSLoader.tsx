'use client';

import { useEffect } from 'react';

export default function BrowserCSSLoader() {
  useEffect(() => {
    // Cargar CSS específico del navegador solo en el cliente
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/browser-config.css';
    link.type = 'text/css';
    
    document.head.appendChild(link);
    
    // Cleanup al desmontar
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  return null; // Este componente no renderiza nada
}
