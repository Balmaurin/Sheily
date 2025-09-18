"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function TokenVault() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [tokens, setTokens] = useState([
    { id: "t1", name: "Entrenamiento T5 Base", value: 500 },
    { id: "t2", name: "Generación Semántica", value: 750 },
    { id: "t3", name: "Modelo Light", value: 250 }
  ]);

  const handleUnlock = () => {
    if (password === "0000") {
      setIsUnlocked(true);
    } else {
      alert("Contraseña incorrecta");
    }
  };

  const totalTokens = tokens.reduce((sum, token) => sum + token.value, 0);

  return (
    <div>
      {!isUnlocked ? (
        <div className="space-y-4">
          <div className="bg-card/60 p-4 rounded-xl">
            <label className="block text-white/70 mb-2">Ingresa la contraseña de la Caja Fuerte</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bg/50 border border-border rounded-xl px-3 py-2 text-fg"
              placeholder="Contraseña (0000)"
            />
          </div>
          <Button onClick={handleUnlock} className="w-full">
            Desbloquear Caja Fuerte
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-card/60 p-4 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Total de Tokens</h3>
              <p className="text-primary text-3xl font-bold">{totalTokens}</p>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setIsUnlocked(false)}
            >
              Bloquear
            </Button>
          </div>
          
          <div className="space-y-2">
            {tokens.map((token) => (
              <Card key={token.id} className="bg-card/40">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{token.name}</h4>
                    <p className="text-white/70 text-sm">Token de entrenamiento</p>
                  </div>
                  <span className="text-primary font-bold">{token.value}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
