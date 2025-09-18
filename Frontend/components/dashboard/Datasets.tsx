"use client";

import React from "react";

export function Datasets() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Datasets</h2>
      <p className="text-muted-foreground">
        Gestiona y explora tus conjuntos de datos de entrenamiento.
      </p>
      <div className="rounded-2xl border p-4">
        <p>No hay datasets disponibles. Comienza a crear tus primeros conjuntos de datos.</p>
      </div>
    </div>
  );
}

export default Datasets;
