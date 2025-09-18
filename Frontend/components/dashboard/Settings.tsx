"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "../providers/UserProvider";
import { createUserState } from "../utils/test-utils";

export function Settings() {
  const { user, save } = useUser();
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState(user.password);
  const [walletPhantom, setWalletPhantom] = useState(user.walletPhantom);
  const [notifications, setNotifications] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    setEmail(user.email);
    setPassword(user.password);
    setWalletPhantom(user.walletPhantom);
  }, [user]);

  const handleSave = () => {
    save({ email, password, walletPhantom });
    console.log("Configuraciones guardadas");
  };

  const generateRandomUser = () => {
    const newUser = createUserState();
    save(newUser);
    setEmail(newUser.email);
    setPassword(newUser.password);
    setWalletPhantom(newUser.walletPhantom);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Configuración</h2>
      <p className="text-muted-foreground">
        Personaliza tu experiencia en Sheily AI.
      </p>
      
      <div className="rounded-2xl border p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Correo Electrónico</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2"
            placeholder="tu.correo@ejemplo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Contraseña</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2"
            placeholder="Contraseña"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Wallet Phantom</label>
          <input 
            type="text" 
            value={walletPhantom}
            onChange={(e) => setWalletPhantom(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2"
            placeholder="Dirección de Wallet Phantom"
          />
        </div>

        <div>
          <label className="inline-flex items-center">
            <input 
              type="checkbox" 
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="mr-2"
            />
            <span>Recibir notificaciones</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tema</label>
          <select 
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2"
          >
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
          </select>
        </div>

        <div className="flex justify-between">
          <button 
            onClick={handleSave}
            className="flex-1 mr-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl"
          >
            Guardar Configuraciones
          </button>
          <button 
            onClick={generateRandomUser}
            className="flex-1 bg-secondary text-secondary-foreground px-4 py-2 rounded-xl"
          >
            Generar Usuario de Prueba
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
