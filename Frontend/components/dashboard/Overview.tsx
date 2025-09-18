"use client";

import React from "react";
import { Stat, Bar } from "../utils/ui";
import { useDataset } from "../providers/DatasetProvider";
import { useVault } from "../providers/VaultProvider";
import { createSampleSFT } from "../utils/test-utils";

export function Overview({ onGoTraining }:{ onGoTraining: ()=>void }) {
  const { state, dispatch } = useDataset();
  const { vault, award } = useVault();

  const addSampleData = () => {
    const newSample = createSampleSFT();
    dispatch({ type: 'ADD', sample: newSample });
    
    // Simular recompensa por agregar un sample
    award({
      id: newSample.id,
      type: newSample.type,
      score: newSample.meta?.score || 0,
      tokens: newSample.meta?.tokens || 0,
      ts: new Date().toISOString()
    });
  };

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total Muestras" value={state.samples.length} />
        <Stat label="Tokens" value={vault.tokens} />
        <Stat label="Proyectos" value={0} />
        <Stat label="Modelos" value={0} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border p-4">
          <h3 className="text-base font-semibold mb-3">Actividad Reciente</h3>
          {state.samples.length === 0 ? (
            <p className="text-muted-foreground">No hay actividad reciente.</p>
          ) : (
            <ul className="space-y-2">
              {state.samples.slice(0, 3).map((sample) => (
                <li key={sample.id} className="flex justify-between items-center">
                  <span>{sample.type}</span>
                  <span className="text-sm text-muted-foreground">
                    {sample.meta?.score}/10 · {sample.meta?.tokens} tokens
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-between mt-4">
            <button 
              className="px-3 py-2 rounded-xl bg-primary text-primary-foreground" 
              onClick={onGoTraining}
            >
              Ir a Training Studio
            </button>
            <button 
              className="px-3 py-2 rounded-xl bg-secondary text-secondary-foreground" 
              onClick={addSampleData}
            >
              Agregar Muestra
            </button>
          </div>
        </div>

        <div className="rounded-2xl border p-4">
          <h3 className="text-base font-semibold mb-3">Uso de Recursos</h3>
          <div className="space-y-3">
            <Bar label="CPU" value={50} />
            <Bar label="RAM" value={60} />
            <Bar label="GPU" value={40} />
            <Bar label="Disco" value={30} />
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Último evento de tokens: {vault.history[0]?.type || 'N/A'}</p>
            <p>Total de eventos: {vault.history.length}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Overview;
