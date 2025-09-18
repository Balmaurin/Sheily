"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { MainNav } from "@/components/main-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

export function SiteHeader() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      // Usar la función de logout del contexto
      logout();
      
      // Redirigir a la página de inicio
      router.push('/');
    } catch (error) {
      toast({
        title: "Error de Cierre de Sesión",
        description: "No se pudo cerrar la sesión. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return null; // Eliminar completamente el encabezado
}
