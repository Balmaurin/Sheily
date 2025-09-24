"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const PIN_STORAGE_KEY = "sheily_security_pin_hash";

const textEncoder = new TextEncoder();

async function sha256Hex(value: string) {
  const data = textEncoder.encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(digest));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function isValidPin(pin: string) {
  return /^\d{6}$/.test(pin);
}

type PinAccessDialogProps = {
  open: boolean;
  sectionLabel: string;
  onUnlock: () => void;
  onOpenChange: (open: boolean) => void;
};

export function PinAccessDialog({ open, onOpenChange, sectionLabel, onUnlock }: PinAccessDialogProps) {
  const [storedHash, setStoredHash] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const mode: "create" | "verify" = useMemo(() => (storedHash ? "verify" : "create"), [storedHash]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const savedHash = window.localStorage.getItem(PIN_STORAGE_KEY);
    setStoredHash(savedHash);
    setPin("");
    setConfirmPin("");
    setError(null);
  }, [open]);

  const closeDialog = () => {
    setPin("");
    setConfirmPin("");
    setError(null);
    onOpenChange(false);
  };

  const handleCreate = async () => {
    if (!isValidPin(pin) || !isValidPin(confirmPin)) {
      setError("El PIN debe contener exactamente 6 dígitos numéricos.");
      return;
    }

    if (pin !== confirmPin) {
      setError("Los PIN ingresados no coinciden.");
      return;
    }

    const hash = await sha256Hex(pin);
    window.localStorage.setItem(PIN_STORAGE_KEY, hash);
    setStoredHash(hash);
    setPin("");
    setConfirmPin("");
    setError(null);
    onUnlock();
    closeDialog();
  };

  const handleVerify = async () => {
    if (!isValidPin(pin)) {
      setError("Ingresa un PIN válido de 6 dígitos.");
      return;
    }

    const hash = await sha256Hex(pin);
    if (hash !== storedHash) {
      setError("PIN incorrecto. Intenta de nuevo.");
      return;
    }

    setError(null);
    setPin("");
    onUnlock();
    closeDialog();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isProcessing) {
      return;
    }

    try {
      setIsProcessing(true);
      if (mode === "create") {
        await handleCreate();
      } else {
        await handleVerify();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetPin = () => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(PIN_STORAGE_KEY);
    setStoredHash(null);
    setPin("");
    setConfirmPin("");
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "verify" ? `Ingresa tu PIN para ${sectionLabel}` : `Configura el PIN para ${sectionLabel}`}
          </DialogTitle>
          <DialogDescription>
            {mode === "verify"
              ? "Protegemos la información sensible con un PIN cifrado. Introduce tu clave de seis dígitos para continuar."
              : "Define un PIN de seis dígitos. Lo ciframos con SHA-256 en tu navegador antes de guardarlo."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === "create" ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">PIN de 6 dígitos</label>
                <Input
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  minLength={6}
                  autoComplete="one-time-code"
                  value={pin}
                  onChange={(event) => setPin(event.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="••••••"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirma el PIN</label>
                <Input
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  minLength={6}
                  autoComplete="off"
                  value={confirmPin}
                  onChange={(event) => setConfirmPin(event.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="••••••"
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">PIN de acceso</label>
              <Input
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                minLength={6}
                autoComplete="one-time-code"
                value={pin}
                onChange={(event) => setPin(event.target.value.replace(/[^0-9]/g, ""))}
                placeholder="••••••"
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button type="submit" disabled={isProcessing} className="flex-1">
              {mode === "verify" ? "Desbloquear" : "Guardar PIN"}
            </Button>
            {mode === "verify" && (
              <Button type="button" variant="outline" disabled={isProcessing} onClick={handleResetPin}>
                Actualizar PIN
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PinAccessDialog;
