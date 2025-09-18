import React from "react";

// Iconos reemplazados por emojis para evitar problemas de compilación
export const Icons = {
  home: "🏠",
  dashboard: "📊",
  brain: "🧠",
  chat: "💬",
  folder: "📁",
  book: "📚",
  user: "👤",
  settings: "⚙️",
  logout: "🚪",
  chevronDown: "⬇️",
  chevronUp: "⬆️",
  chevronRight: "➡️",
  chevronLeft: "⬅️",
  search: "🔍",
  close: "❌",
  check: "✅",
  warning: "⚠️",
  info: "ℹ️",

  // Icono por defecto si no se encuentra
  default: "📱",
};

// Componente de icono genérico simplificado
interface IconProps {
  name?: keyof typeof Icons;
  size?: number;
  className?: string;
}

export function Icon({ 
  name = "default", 
  size = 24, 
  className = ""
}: IconProps) {
  const iconEmoji = Icons[name] || Icons.default;
  
  return (
    <span 
      className={className}
      style={{ fontSize: size }}
      role="img"
      aria-label={name}
    >
      {iconEmoji}
    </span>
  );
}
