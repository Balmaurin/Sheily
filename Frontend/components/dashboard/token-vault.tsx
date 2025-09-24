"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TokenBalance {
  total: number;
  available: number;
  staked: number;
  pending: number;
  currency?: string;
}

interface TokenTransaction {
  id: string | number;
  type: string;
  amount: number;
  date: string;
  status: string;
  memo?: string;
}

async function parseResponse<T>(response: Response, defaultValue: T): Promise<T> {
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error parsing response", error);
    return defaultValue;
  }
}

function formatAmount(amount: number, currency = "SHEILY") {
  return `${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency}`;
}

const statusColors: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-rose-100 text-rose-700",
};

export function TokenVault() {
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadVault = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [balanceResponse, transactionsResponse] = await Promise.all([
        fetch('/api/tokens/balance'),
        fetch('/api/tokens/transactions'),
      ]);

      const balanceData = await parseResponse(balanceResponse, {
        total: 0,
        available: 0,
        staked: 0,
        pending: 0,
        currency: 'SHEILY',
      });

      const transactionData = await parseResponse<{ transactions?: TokenTransaction[] }>(
        transactionsResponse,
        { transactions: [] },
      );

      setBalance(balanceData);
      setTransactions(Array.isArray(transactionData.transactions) ? transactionData.transactions : []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading token vault', err);
      setError(err instanceof Error ? err.message : 'No se pudo cargar la información de la caja fuerte');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVault();
  }, [loadVault]);

  const balanceSummary = useMemo(() => {
    if (!balance) {
      return [] as Array<{ label: string; value: string }>;
    }

    return [
      { label: 'Total', value: formatAmount(balance.total, balance.currency) },
      { label: 'Disponible', value: formatAmount(balance.available, balance.currency) },
      { label: 'En staking', value: formatAmount(balance.staked, balance.currency) },
      { label: 'Pendiente', value: formatAmount(balance.pending, balance.currency) },
    ];
  }, [balance]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Caja fuerte de tokens SHEILY</h2>
          <p className="text-sm text-muted-foreground">
            La información proviene de los endpoints reales del backend (`/api/tokens`). No se utilizan mocks ni datos sintéticos.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void loadVault()} disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar datos'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {balanceSummary.map((item) => (
          <Card key={item.label} className="border-border/40 bg-card/60">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
                {item.label}
              </CardDescription>
              <CardTitle className="text-2xl">{item.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="border-border/40 bg-card/60">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl">Movimientos recientes</CardTitle>
            <CardDescription>Historial consolidado de envíos, recompensas y staking.</CardDescription>
          </div>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Última sincronización: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && (
            <p className="text-sm text-muted-foreground">Consultando movimientos...</p>
          )}

          {!loading && transactions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No se registran transacciones en la caja fuerte. Genera actividad enviando tokens o activando staking.
            </p>
          )}

          {!loading && transactions.length > 0 && (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex flex-col gap-2 rounded-xl border border-border/40 bg-background/40 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold capitalize">{tx.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.date).toLocaleString()} {tx.memo ? `• ${tx.memo}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm">
                      {formatAmount(tx.amount, balance?.currency)}
                    </span>
                    <Badge className={statusColors[tx.status] ?? 'bg-slate-200 text-slate-700'}>{tx.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TokenVault;
