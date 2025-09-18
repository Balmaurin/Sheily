'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Wallet,
  Coins,
  Send,
  Receive,
  Lock,
  Unlock,
  Shield,
  TrendingUp,
  Award,
  Target,
  Key,
  Zap,
  Globe,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff
} from "lucide-react";

interface TokenTransaction {
  id: string;
  type: 'earned' | 'sent' | 'received' | 'staked' | 'unstaked';
  amount: number;
  fromAddress?: string;
  toAddress?: string;
  timestamp: Date;
  txHash?: string;
  status: 'pending' | 'confirmed' | 'failed';
  description: string;
}

interface TokenBalance {
  available: number;
  staked: number;
  pending: number;
  total: number;
}

interface VaultSettings {
  isLocked: boolean;
  passwordHash?: string;
  twoFactorEnabled: boolean;
  autoStakingEnabled: boolean;
  minStakingAmount: number;
  emergencyContact?: string;
}

interface StakingPool {
  id: string;
  name: string;
  apy: number;
  totalStaked: number;
  userStaked: number;
  lockPeriod: number; // días
  minStake: number;
  rewards: number;
}

export function TokenVaultBlockchain() {
  const [balance, setBalance] = useState<TokenBalance>({
    available: 0,
    staked: 0,
    pending: 0,
    total: 0
  });
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [vaultSettings, setVaultSettings] = useState<VaultSettings>({
    isLocked: true,
    twoFactorEnabled: false,
    autoStakingEnabled: false,
    minStakingAmount: 100
  });
  const [stakingPools, setStakingPools] = useState<StakingPool[]>([]);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [vaultPassword, setVaultPassword] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedPool, setSelectedPool] = useState<string>('');
  const [showBalance, setShowBalance] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    if (isVaultUnlocked) {
      loadBalance();
      loadTransactions();
      loadStakingPools();
    }
  }, [isVaultUnlocked]);

  const loadBalance = async () => {
    try {
      const response = await fetch('/api/tokens/balance');
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance);
      }
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await fetch('/api/tokens/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadStakingPools = async () => {
    try {
      const response = await fetch('/api/tokens/staking-pools');
      if (response.ok) {
        const data = await response.json();
        setStakingPools(data.pools || []);
      }
    } catch (error) {
      console.error('Error loading staking pools:', error);
    }
  };

  const unlockVault = async () => {
    if (!vaultPassword.trim()) {
      alert('Por favor ingresa la contraseña de la caja fuerte');
      return;
    }

    try {
      const response = await fetch('/api/tokens/vault/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: vaultPassword })
      });

      if (response.ok) {
        setIsVaultUnlocked(true);
        setVaultPassword('');
        alert('Caja fuerte desbloqueada exitosamente');
      } else {
        alert('Contraseña incorrecta');
      }
    } catch (error) {
      console.error('Error unlocking vault:', error);
      alert('Error al desbloquear la caja fuerte');
    }
  };

  const lockVault = () => {
    setIsVaultUnlocked(false);
    setVaultPassword('');
    setBalance({ available: 0, staked: 0, pending: 0, total: 0 });
    setTransactions([]);
  };

  const sendTokens = async () => {
    if (!sendAmount || !sendAddress) {
      alert('Por favor completa todos los campos');
      return;
    }

    const amount = parseFloat(sendAmount);
    if (amount <= 0 || amount > balance.available) {
      alert('Monto inválido');
      return;
    }

    try {
      const response = await fetch('/api/tokens/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          toAddress: sendAddress
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Tokens enviados exitosamente. TX Hash: ${data.txHash}`);
        setSendAmount('');
        setSendAddress('');
        loadBalance();
        loadTransactions();
      } else {
        const error = await response.text();
        alert(`Error al enviar tokens: ${error}`);
      }
    } catch (error) {
      console.error('Error sending tokens:', error);
      alert('Error al enviar tokens');
    }
  };

  const stakeTokens = async () => {
    if (!stakeAmount || !selectedPool) {
      alert('Por favor selecciona un pool y cantidad');
      return;
    }

    const amount = parseFloat(stakeAmount);
    if (amount <= 0 || amount > balance.available) {
      alert('Monto inválido');
      return;
    }

    const pool = stakingPools.find(p => p.id === selectedPool);
    if (!pool || amount < pool.minStake) {
      alert(`Monto mínimo para este pool: ${pool?.minStake} SHEILY`);
      return;
    }

    try {
      const response = await fetch('/api/tokens/stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          poolId: selectedPool
        })
      });

      if (response.ok) {
        alert('Tokens staked exitosamente');
        setStakeAmount('');
        setSelectedPool('');
        loadBalance();
        loadTransactions();
        loadStakingPools();
      } else {
        const error = await response.text();
        alert(`Error al staked tokens: ${error}`);
      }
    } catch (error) {
      console.error('Error staking tokens:', error);
      alert('Error al staked tokens');
    }
  };

  const unstakeTokens = async (poolId: string, amount: number) => {
    try {
      const response = await fetch('/api/tokens/unstake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolId,
          amount
        })
      });

      if (response.ok) {
        alert('Tokens unstaked exitosamente');
        loadBalance();
        loadTransactions();
        loadStakingPools();
      }
    } catch (error) {
      console.error('Error unstaking tokens:', error);
      alert('Error al unstaked tokens');
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned': return <Award className="h-4 w-4 text-green-600" />;
      case 'sent': return <Send className="h-4 w-4 text-red-600" />;
      case 'received': return <Receive className="h-4 w-4 text-green-600" />;
      case 'staked': return <Lock className="h-4 w-4 text-blue-600" />;
      case 'unstaked': return <Unlock className="h-4 w-4 text-orange-600" />;
      default: return <Coins className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned': return 'text-green-600';
      case 'received': return 'text-green-600';
      case 'sent': return 'text-red-600';
      case 'staked': return 'text-blue-600';
      case 'unstaked': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  if (!isVaultUnlocked) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Lock className="h-6 w-6" />
              Caja Fuerte SHEILY
            </h2>
            <p className="text-muted-foreground">
              Gestiona tus tokens SHEILY ganados por completar ejercicios de IA
            </p>
          </div>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Desbloquear Caja Fuerte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                Tu caja fuerte SHEILY está protegida por contraseña para mantener seguros tus tokens blockchain.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="vaultPassword">Contraseña de la caja fuerte</Label>
              <Input
                id="vaultPassword"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={vaultPassword}
                onChange={(e) => setVaultPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && unlockVault()}
              />
            </div>

            <Button onClick={unlockVault} className="w-full">
              <Unlock className="h-4 w-4 mr-2" />
              Desbloquear Caja Fuerte
            </Button>

            <div className="text-center">
              <Button variant="link" className="text-sm">
                ¿Olvidaste tu contraseña?
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Caja Fuerte SHEILY
          </h2>
          <p className="text-muted-foreground">
            Gestiona tus tokens SHEILY en la blockchain de Solana
          </p>
        </div>
        <Button onClick={lockVault} variant="outline">
          <Lock className="h-4 w-4 mr-2" />
          Bloquear
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="send">Enviar</TabsTrigger>
          <TabsTrigger value="stake">Staking</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Balance principal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  Balance SHEILY
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                >
                  {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {showBalance ? balance.available.toLocaleString() : '****'}
                  </div>
                  <div className="text-sm text-muted-foreground">Disponible</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {showBalance ? balance.staked.toLocaleString() : '****'}
                  </div>
                  <div className="text-sm text-muted-foreground">Staked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {showBalance ? balance.pending.toLocaleString() : '****'}
                  </div>
                  <div className="text-sm text-muted-foreground">Pendiente</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {showBalance ? balance.total.toLocaleString() : '****'}
                  </div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-500" />
                  Tokens Ganados Hoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {transactions
                    .filter(tx => tx.type === 'earned' &&
                      new Date(tx.timestamp).toDateString() === new Date().toDateString())
                    .reduce((sum, tx) => sum + tx.amount, 0)
                  }
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  APY Promedio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stakingPools.length > 0
                    ? (stakingPools.reduce((sum, pool) => sum + pool.apy, 0) / stakingPools.length).toFixed(1)
                    : 0}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  Ranking Global
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">#1,247</div>
                <div className="text-xs text-muted-foreground">Top 5%</div>
              </CardContent>
            </Card>
          </div>

          {/* Actividad reciente */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(tx.type)}
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {tx.timestamp.toLocaleDateString()} • {tx.txHash ? formatAddress(tx.txHash) : 'Local'}
                        </p>
                      </div>
                    </div>
                    <div className={`font-bold ${getTransactionColor(tx.type)}`}>
                      {tx.type === 'sent' ? '-' : '+'}{tx.amount} SHEILY
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Enviar Tokens SHEILY
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  Los envíos de SHEILY se procesan en la blockchain de Solana y tienen tarifas de red.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sendAddress">Dirección del destinatario</Label>
                  <Input
                    id="sendAddress"
                    placeholder="Dirección de wallet Solana"
                    value={sendAddress}
                    onChange={(e) => setSendAddress(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sendAmount">Cantidad de SHEILY</Label>
                  <Input
                    id="sendAmount"
                    type="number"
                    placeholder="0.00"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Disponible: {balance.available.toLocaleString()} SHEILY
                  </p>
                </div>

                <Button onClick={sendTokens} className="w-full" disabled={!sendAmount || !sendAddress}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Tokens
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stake" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Staking de SHEILY
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  Stakea tus SHEILY en pools de liquidez para ganar recompensas pasivas.
                  Los tokens staked no pueden ser transferidos hasta el final del período de lock.
                </AlertDescription>
              </Alert>

              {/* Pools disponibles */}
              <div className="space-y-4">
                <h4 className="font-semibold">Pools Disponibles</h4>
                <div className="grid grid-cols-1 gap-4">
                  {stakingPools.map(pool => (
                    <Card key={pool.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-semibold">{pool.name}</h5>
                            <p className="text-sm text-muted-foreground">
                              Lock: {pool.lockPeriod} días • Mín: {pool.minStake} SHEILY
                            </p>
                          </div>
                          <Badge variant="outline" className="text-green-600">
                            {pool.apy}% APY
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm">Total staked: {pool.totalStaked.toLocaleString()}</span>
                          <span className="text-sm">Tus staked: {pool.userStaked.toLocaleString()}</span>
                        </div>

                        {pool.userStaked > 0 && (
                          <Button
                            onClick={() => unstakeTokens(pool.id, pool.userStaked)}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            Unstake {pool.userStaked} SHEILY
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Stake nuevo */}
              <Card>
                <CardHeader>
                  <CardTitle>Stake Nuevos Tokens</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Seleccionar Pool</Label>
                    <Select value={selectedPool} onValueChange={setSelectedPool}>
                      <SelectTrigger>
                        <SelectValue placeholder="Elige un pool de staking" />
                      </SelectTrigger>
                      <SelectContent>
                        {stakingPools.map(pool => (
                          <SelectItem key={pool.id} value={pool.id}>
                            {pool.name} - {pool.apy}% APY
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stakeAmount">Cantidad a stake</Label>
                    <Input
                      id="stakeAmount"
                      type="number"
                      placeholder="0.00"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Disponible: {balance.available.toLocaleString()} SHEILY
                    </p>
                  </div>

                  <Button onClick={stakeTokens} className="w-full" disabled={!stakeAmount || !selectedPool}>
                    <Lock className="h-4 w-4 mr-2" />
                    Stake Tokens
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Historial de Transacciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(tx.type)}
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {tx.timestamp.toLocaleString()} • {tx.txHash ? `TX: ${formatAddress(tx.txHash)}` : 'Transacción local'}
                        </p>
                        {tx.fromAddress && (
                          <p className="text-xs text-muted-foreground">
                            De: {formatAddress(tx.fromAddress)}
                          </p>
                        )}
                        {tx.toAddress && (
                          <p className="text-xs text-muted-foreground">
                            Para: {formatAddress(tx.toAddress)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${getTransactionColor(tx.type)}`}>
                        {tx.type === 'sent' ? '-' : '+'}{tx.amount.toLocaleString()} SHEILY
                      </div>
                      <Badge variant={tx.status === 'confirmed' ? 'default' : 'secondary'}>
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
