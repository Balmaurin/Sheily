"use client";

import React from 'react';
import { HeroOrb } from '../components/hero-orb';
import { FeatureGrid } from '../components/feature-grid';
import { CTA } from '../components/cta';
import { FAQ } from '../components/faq';
import { Footer } from '../components/footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section con Orb */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <HeroOrb />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <FeatureGrid />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <CTA />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <FAQ />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
