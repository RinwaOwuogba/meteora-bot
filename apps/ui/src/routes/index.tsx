import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import type { ColumnDef, Row } from '@tanstack/react-table';
import type { LiquidityPool } from '../types';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd'),
  );
  const [selectedTime, setSelectedTime] = useState<string>('00:00');
  const [selectedPool, setSelectedPool] = useState<string>('');

  // Generate time options in 30-minute intervals
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2)
      .toString()
      .padStart(2, '0');
    const minute = (i % 2) * 30;
    return `${hour}:${minute.toString().padStart(2, '0')}`;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      date: selectedDate,
      time: selectedTime,
      pool: selectedPool,
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="container mx-auto">
        <CardHeader>
          <CardTitle>Liquidity Pool Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Date
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Timestamp
                </label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Liquidity Pool
              </label>
              <DataTable
                columns={columns}
                data={liquidityPools}
                onRowClick={(row) => setSelectedPool(row.pairAddress)}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

const columns: ColumnDef<LiquidityPool>[] = [
  {
    header: 'Pair',
    cell: ({ row }: { row: Row<LiquidityPool> }) => {
      return (
        <div className="text-left font-medium">
          {row.original.baseToken.symbol} / {row.original.quoteToken.symbol}
        </div>
      );
    },
  },
  {
    accessorKey: 'liquidity.usd',
    header: 'Liquidity (USD)',
    cell: ({ row }: { row: Row<LiquidityPool> }) => {
      const amount = row.original.liquidity?.usd;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
      return (
        <div className="text-left font-medium">
          {amount ? formatted : '$ --'}
        </div>
      );
    },
  },
  {
    accessorKey: 'marketCap',
    header: 'Market Cap',
    cell: ({ row }: { row: Row<LiquidityPool> }) => {
      const amount = parseFloat(row.getValue('marketCap'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
      return <div className="text-left font-medium">{formatted}</div>;
    },
  },
  {
    id: 'pairAge',
    header: 'Pair Age',
    cell: ({ row }: { row: Row<LiquidityPool> }) => {
      const pairCreatedAt = row.original.pairCreatedAt;
      const days = Math.floor(
        (Date.now() - pairCreatedAt) / (1000 * 60 * 60 * 24),
      );
      return <div>{days} days</div>;
    },
  },
  {
    id: 'txns24h',
    header: '24h Transactions',
    cell: ({ row }: { row: Row<LiquidityPool> }) => {
      const txns = row.original.txns.h24;
      return <div>{(txns.buys ?? 0) + (txns.sells ?? 0)}</div>;
    },
  },
];

// Mock data array - in real app this would come from an API
const liquidityPools: LiquidityPool[] = [
  {
    chainId: 'solana',
    dexId: 'meteora',
    url: 'https://dexscreener.com/solana/hbxlehpj7ax6hrpdupezrtj9jlqpwzg6z3pzzgnpnvww',
    pairAddress: 'HBXLeHpj7Ax6HRpdUPEZRTJ9jLqpWZG6z3PzZGNpnvWW',
    baseToken: {
      address: 'EZSAERYLEPGuzdvEvtGqee18mNPNgFaiwbHs8pPRpump',
      name: 'JAILED TRUMP',
      symbol: 'JTRUMP',
    },
    quoteToken: {
      address: 'So11111111111111111111111111111111111111112',
      name: 'Wrapped SOL',
      symbol: 'SOL',
    },
    liquidity: {
      usd: 50.32,
      base: 34355,
      quote: 0.1063,
      meteora: 0.5430033151931382,
    },
    marketCap: 764942,
    pairCreatedAt: 1738098316000,
    txns: {
      m5: { buys: 0, sells: 0 },
      h1: { buys: 0, sells: 0 },
      h6: { buys: 0, sells: 0 },
      h24: { buys: 7, sells: 15 },
    },
  },
];
