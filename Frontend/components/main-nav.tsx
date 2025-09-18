"use client";

import * as React from "react";
// Link reemplazado por elemento <a> nativo para evitar problemas de compilación
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";
// Tooltips reemplazados por tooltips nativos del navegador para evitar problemas de compilación
import { Badge } from "@/components/ui/badge";

export interface NavItem {
  title: string;
  href: string;
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  disabled?: boolean;
  external?: boolean;
  requiresAuth?: boolean;
  permissions?: string[];
  beta?: boolean;
  comingSoon?: boolean;
}

interface MainNavProps {
  items?: NavItem[];
  className?: string;
  session?: any; // Ajusta según tu tipo de sesión
  userPermissions?: string[];
}

export function MainNav({ 
  items = [], 
  className, 
  session, 
  userPermissions = [] 
}: MainNavProps) {
  const pathname = usePathname();

  const canAccessItem = (item: NavItem) => {
    // Verificación de autenticación
    if (item.requiresAuth && !session) return false;

    // Verificación de permisos
    if (item.permissions) {
      return item.permissions.some(perm => 
        userPermissions.includes(perm)
      );
    }

    return true;
  };

  const renderNavItem = (item: NavItem) => {
    // No renderizar si no se puede acceder
    if (!canAccessItem(item)) return null;

    const Icon = item.icon ? Icons[item.icon] : null;
    const isActive = pathname === item.href;

    const navItemContent = (
      <div className={cn(
        "group relative flex items-center gap-2 text-sm font-medium",
        isActive ? "text-foreground" : "text-muted-foreground",
        item.disabled && "opacity-50 cursor-not-allowed"
      )}>
        {Icon && <span className="w-4 h-4 flex items-center justify-center">📱</span>}
        {item.title}
        {item.beta && (
          <Badge variant="secondary" className="ml-2 text-xs">
            Beta
          </Badge>
        )}
        {item.comingSoon && (
          <Badge variant="outline" className="ml-2 text-xs">
            Próximamente
          </Badge>
        )}
      </div>
    );

    const linkProps = {
      href: item.disabled ? "#" : item.href,
      target: item.external ? "_blank" : undefined,
      rel: item.external ? "noopener noreferrer" : undefined,
    };

    return (
      <a 
        key={item.href}
        href={linkProps.href}
        target={linkProps.target}
        rel={linkProps.rel}
        className={cn(
          "transition-colors hover:text-foreground/80",
          item.disabled && "pointer-events-none"
        )}
        title={item.description} // Tooltip nativo del navegador
      >
        {navItemContent}
      </a>
    );
  };

  return (
    <nav 
      className={cn(
        "flex items-center space-x-4 lg:space-x-6", 
        className
      )}
      aria-label="Main Navigation"
    >
      {items.map(renderNavItem).filter(Boolean)}
    </nav>
  );
}

// Ejemplo de uso en siteConfig
export const generateMainNavItems = (session?: any): NavItem[] => [
  {
    title: "Inicio",
    href: "/",
    icon: "home",
    description: "Página principal del sistema"
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    description: "Panel de control principal",
    requiresAuth: true
  },
  {
    title: "Entrenamiento",
    href: "/training",
    icon: "brain",
    description: "Módulo de entrenamiento y ejercicios",
    requiresAuth: true,
    beta: true
  },
  {
    title: "Chat IA",
    href: "/chat",
    icon: "chat",
    description: "Interactúa con nuestra IA",
    requiresAuth: true
  },
  {
    title: "Proyectos",
    href: "/projects",
    icon: "folder",
    description: "Gestiona tus proyectos",
    requiresAuth: true,
    comingSoon: true
  },
  {
    title: "Documentación",
    href: "/docs",
    icon: "book",
    description: "Documentación del sistema",
    external: true
  }
];
