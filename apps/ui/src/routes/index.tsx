import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { format, parse } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  formSchema,
  type FilterValues,
  type FormValues,
} from '@/schemas/pool-schemas';
import { fetchDateRange, fetchTimestamps, fetchPools } from '@/api/pools';
import { PoolFilterDialog } from '@/components/pools/pool-filter-dialog';
import { PoolSearch } from '@/components/pools/pool-search';
import { PoolTable } from '@/components/pools/pool-table';
import type { IndexedLiquidityPool } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  // State for filter dialog
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterValues | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch date range
  const dateRangeQuery = useQuery({
    queryKey: ['dateRange'],
    queryFn: fetchDateRange,
  });

  // Setup main form with React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: '',
      timestamp: '',
      selectedPool: '',
      searchTerm: '',
    },
  });

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = form;

  const selectedDate = watch('date');
  const selectedTimestamp = watch('timestamp');

  // Fetch timestamps for selected date
  const timestampsQuery = useQuery({
    queryKey: ['timestamps', selectedDate],
    queryFn: () => fetchTimestamps(selectedDate),
    enabled: !!selectedDate,
  });

  // Fetch pools for selected timestamp
  const poolsQuery = useQuery({
    queryKey: ['pools', selectedTimestamp, searchTerm, activeFilters],
    queryFn: () =>
      fetchPools(selectedTimestamp, searchTerm, activeFilters || undefined),
    enabled: !!selectedTimestamp,
  });

  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      setValue('date', formattedDate);
      setValue('timestamp', '');
    }
  };

  // Handle timestamp change
  const handleTimestampChange = (value: string) => {
    setValue('timestamp', value);
  };

  // Handle row click
  const handleRowClick = (pool: IndexedLiquidityPool) => {
    setValue('selectedPool', pool.pair_address);
  };

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    console.log('Form submitted:', data);
    // Handle form submission logic here
  };

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Handle filter application
  const handleApplyFilters = (filters: FilterValues) => {
    setActiveFilters(filters);
  };

  // Handle filter clearing
  const clearFilters = () => {
    setActiveFilters(null);
  };

  // Count active filters
  const countActiveFilters = () => {
    if (!activeFilters) return 0;

    let count = 0;
    if (activeFilters.minLiquidity !== undefined) count++;
    if (activeFilters.maxLiquidity !== undefined) count++;
    if (activeFilters.minMarketCap !== undefined) count++;
    if (activeFilters.maxMarketCap !== undefined) count++;
    if (activeFilters.minAgeDays !== undefined) count++;
    if (activeFilters.maxAgeDays !== undefined) count++;
    if (activeFilters.minTxns24h !== undefined) count++;
    if (activeFilters.maxTxns24h !== undefined) count++;
    if (activeFilters.minVolume24h !== undefined) count++;
    if (activeFilters.maxVolume24h !== undefined) count++;
    if (activeFilters.sortBy !== 'volume_24h') count++;
    if (activeFilters.sortOrder !== 'desc') count++;

    return count;
  };

  // Calculate date range for the calendar
  const getDateRange = () => {
    if (!dateRangeQuery.data?.startDate || !dateRangeQuery.data?.endDate) {
      return { from: undefined, to: undefined };
    }

    const startDate = new Date(dateRangeQuery.data.startDate);
    const endDate = new Date(dateRangeQuery.data.endDate);

    return {
      from: startDate,
      to: endDate,
    };
  };

  // Get the selected date as a Date object
  const getSelectedDateObject = () => {
    if (!selectedDate) return undefined;
    return parse(selectedDate, 'yyyy-MM-dd', new Date());
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Liquidity Pool Explorer</CardTitle>
        </CardHeader>
        <CardContent>
          {dateRangeQuery.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : dateRangeQuery.isError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load date range. Please try again later.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !selectedDate && 'text-muted-foreground',
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(getSelectedDateObject() as Date, 'PPP')
                        ) : (
                          <span>Select date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={getSelectedDateObject()}
                        onSelect={handleDateChange}
                        disabled={(date) => {
                          const { from, to } = getDateRange();
                          if (!from || !to) return true;

                          // Disable dates outside the available range
                          return date < from || date > to;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.date && (
                    <p className="text-sm text-red-500">
                      {errors.date.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Timestamp
                  </label>
                  <Select
                    value={selectedTimestamp}
                    onValueChange={handleTimestampChange}
                    disabled={!selectedDate || timestampsQuery.isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timestamp" />
                    </SelectTrigger>
                    <SelectContent>
                      {timestampsQuery.data?.map((timestamp) => (
                        <SelectItem
                          key={timestamp.id}
                          value={timestamp.timestamp}
                        >
                          {format(new Date(timestamp.timestamp), 'p')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.timestamp && (
                    <p className="text-sm text-red-500">
                      {errors.timestamp.message}
                    </p>
                  )}
                </div>
              </div>

              {selectedTimestamp && (
                <div className="flex items-center gap-2">
                  <PoolSearch
                    onSearch={handleSearch}
                    initialValue={searchTerm}
                  />
                  <PoolFilterDialog
                    open={filterDialogOpen}
                    onOpenChange={setFilterDialogOpen}
                    onApplyFilters={handleApplyFilters}
                    onClearFilters={clearFilters}
                    initialFilters={activeFilters}
                    activeFilterCount={countActiveFilters()}
                  />
                </div>
              )}

              <div className="mt-4">
                {selectedTimestamp && (
                  <PoolTable
                    pools={poolsQuery.data?.pools || []}
                    isLoading={poolsQuery.isLoading}
                    isError={poolsQuery.isError}
                    onRowClick={handleRowClick}
                    onClearFilters={clearFilters}
                    hasActiveFilters={countActiveFilters() > 0}
                  />
                )}
                <Controller
                  name="selectedPool"
                  control={control}
                  render={({ field }) => <input type="hidden" {...field} />}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={poolsQuery.isLoading || !selectedTimestamp}
                >
                  Submit
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
