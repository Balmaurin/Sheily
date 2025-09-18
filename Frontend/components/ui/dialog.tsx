import React from 'react';

export const Dialog = ({ children, open, onOpenChange }: { 
  children: React.ReactNode; 
  open?: boolean; 
  onOpenChange?: (open: boolean) => void; 
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => onOpenChange?.(false)}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      {children}
    </div>
  );
};

export const DialogContent = ({ children, className = '' }: { 
  children: React.ReactNode; 
  className?: string; 
}) => (
  <div 
    className={`relative bg-black/90 backdrop-blur-xl border border-cyan-500/40 rounded-3xl p-8 w-full max-w-lg ${className}`}
    onClick={(e) => e.stopPropagation()}
  >
    {children}
  </div>
);

export const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="text-center mb-8">{children}</div>
);

export const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-2xl font-bold text-white mb-2">{children}</h2>
);

export const DialogTrigger = ({ children, onClick }: { 
  children: React.ReactNode; 
  onClick?: () => void; 
}) => (
  <div onClick={onClick}>{children}</div>
);
