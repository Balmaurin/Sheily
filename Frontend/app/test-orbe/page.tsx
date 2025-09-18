"use client";

import React from 'react';
import { HeroOrb } from '../../components/hero-orb';

export default function TestOrbe() {
  return (
    <div className="min-h-screen bg-background">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-white mb-4">Página de Prueba del Orbe</h1>
        <p className="text-white/70 mb-8">Esta es una página de prueba para verificar que el componente HeroOrb funcione correctamente</p>
      </div>
      
      {/* Hero Section con Orb */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <HeroOrb />
      </section>
    </div>
  );
}
