import type { ColumnDef, Row } from '@tanstack/react-table';
import { formatDistanceToNowStrict } from 'date-fns';
import { formatNumber } from '@/lib/utils';
import type { IndexedLiquidityPool } from '@/types';

export const columns: ColumnDef<IndexedLiquidityPool>[] = [
  {
    header: 'Pair',
    cell: ({ row }: { row: Row<IndexedLiquidityPool> }) => {
      return (
        <div className="text-left font-medium">
          {row.original.base_symbol || 'Unknown'} /{' '}
          {row.original.quote_symbol || 'Unknown'}
        </div>
      );
    },
  },
  {
    accessorKey: 'liquidity_usd',
    header: 'Liquidity (USD)',
    cell: ({ row }: { row: Row<IndexedLiquidityPool> }) => {
      const amount = parseFloat(row.original.liquidity_usd);
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
      return <div className="text-left font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'market_cap',
    header: 'Market Cap',
    cell: ({ row }: { row: Row<IndexedLiquidityPool> }) => {
      const amount = parseFloat(row.original.market_cap);
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
    cell: ({ row }: { row: Row<IndexedLiquidityPool> }) => {
      const pairCreatedAt = row.original.pair_created_at
        ? new Date(row.original.pair_created_at).getTime()
        : 0;
      return <div>{formatDistanceToNowStrict(pairCreatedAt)}</div>;
    },
  },
  {
    id: 'txns24h',
    header: '24h Transactions',
    cell: ({ row }: { row: Row<IndexedLiquidityPool> }) => {
      const txns =
        Number(row.original.buys_24h) + Number(row.original.sells_24h);
      return <div>{formatNumber(txns)}</div>;
    },
  },
  {
    id: 'volume24h',
    header: 'Volume (24h)',
    cell: ({ row }: { row: Row<IndexedLiquidityPool> }) => {
      const volume = parseFloat(String(row.original.volume_24h));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(volume);
      return <div>{formatted}</div>;
    },
  },
];
