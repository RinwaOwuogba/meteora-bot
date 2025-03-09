import { DataTable } from '@/components/data-table';
import { columns } from '@/components/pools/pool-columns';
import type { IndexedLiquidityPool } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PoolTableProps {
  pools: IndexedLiquidityPool[];
  isLoading: boolean;
  isError: boolean;
  onRowClick: (pool: IndexedLiquidityPool) => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

export function PoolTable({
  pools,
  isLoading,
  isError,
  onRowClick,
  onClearFilters,
  hasActiveFilters,
}: PoolTableProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Liquidity Pools
        </label>
        {hasActiveFilters && onClearFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={onClearFilters}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load pools. Please try again later.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {pools.length === 0 ? (
            <div className="flex h-64 items-center justify-center border rounded-md">
              <div className="text-center">
                <p className="text-muted-foreground">No pools found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            </div>
          ) : (
            <DataTable columns={columns} data={pools} onRowClick={onRowClick} />
          )}
        </>
      )}
    </div>
  );
}
