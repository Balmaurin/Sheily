"use client";

import React from "react";

export function Rewards() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Recompensas</h2>
      <p className="text-muted-foreground">
        Explora y gestiona tus tokens y recompensas.
      </p>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-4">
          <h3 className="text-lg font-semibold mb-2">Tokens Disponibles</h3>
          <div className="text-4xl font-bold text-primary">0</div>
          <p className="text-muted-foreground mt-2">
            Completa tareas para ganar más tokens
          </p>
        </div>

        <div className="rounded-2xl border p-4">
          <h3 className="text-lg font-semibold mb-2">Historial de Recompensas</h3>
          <ul className="space-y-2">
            <li className="text-muted-foreground">
              No hay recompensas recientes
            </li>
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border p-4">
        <h3 className="text-lg font-semibold mb-2">Cómo Ganar Tokens</h3>
        <ul className="list-disc list-inside space-y-2">
          <li>Completar entrenamientos de modelos</li>
          <li>Crear y evaluar datasets</li>
          <li>Participar en proyectos de investigación</li>
        </ul>
      </div>
    </div>
  );
}

export default Rewards;
