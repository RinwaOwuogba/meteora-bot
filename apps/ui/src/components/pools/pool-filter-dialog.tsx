import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { filterSchema, type FilterValues } from '@/schemas/pool-schemas';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from '@/components/ui/form';

interface PoolFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: FilterValues) => void;
  onClearFilters: () => void;
  initialFilters: FilterValues | null;
  activeFilterCount: number;
}

export function PoolFilterDialog({
  open,
  onOpenChange,
  onApplyFilters,
  onClearFilters,
  initialFilters,
  activeFilterCount,
}: PoolFilterDialogProps) {
  const filterForm = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: initialFilters || {
      sortBy: 'volume_24h',
      sortOrder: 'desc',
      minLiquidity: undefined,
      maxLiquidity: undefined,
      minMarketCap: undefined,
      maxMarketCap: undefined,
      minAgeDays: undefined,
      maxAgeDays: undefined,
      minTxns24h: undefined,
    },
  });

  const handleSubmit = () => {
    onApplyFilters(filterForm.getValues());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Filter className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Filter pools by various criteria</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Filter Pools</DialogTitle>
        </DialogHeader>

        <div>
          <Form {...filterForm}>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Liquidity (USD)
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          name="minLiquidity"
                          control={filterForm.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="minLiquidity">Min</FormLabel>
                              <FormControl>
                                <Input
                                  id="minLiquidity"
                                  type="number"
                                  placeholder="Min"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name="maxLiquidity"
                          control={filterForm.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="maxLiquidity">Max</FormLabel>
                              <FormControl>
                                <Input
                                  id="maxLiquidity"
                                  type="number"
                                  placeholder="Max"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Market Cap</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          name="minMarketCap"
                          control={filterForm.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="minMarketCap">Min</FormLabel>
                              <FormControl>
                                <Input
                                  id="minMarketCap"
                                  type="number"
                                  placeholder="Min"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name="maxMarketCap"
                          control={filterForm.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="maxMarketCap">Max</FormLabel>
                              <FormControl>
                                <Input
                                  id="maxMarketCap"
                                  type="number"
                                  placeholder="Max"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Pair Age (days)
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          name="minAgeDays"
                          control={filterForm.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="minAgeDays">Min</FormLabel>
                              <FormControl>
                                <Input
                                  id="minAgeDays"
                                  type="number"
                                  placeholder="Min"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name="maxAgeDays"
                          control={filterForm.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="maxAgeDays">Max</FormLabel>
                              <FormControl>
                                <Input
                                  id="maxAgeDays"
                                  type="number"
                                  placeholder="Max"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Transactions (24h)
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          name="minTxns24h"
                          control={filterForm.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="minTxns24h">Min</FormLabel>
                              <FormControl>
                                <Input
                                  id="minTxns24h"
                                  type="number"
                                  placeholder="Min"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name="maxTxns24h"
                          control={filterForm.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="maxTxns24h">Max</FormLabel>
                              <FormControl>
                                <Input
                                  id="maxTxns24h"
                                  type="number"
                                  placeholder="Max"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Volume (24h)</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          name="minVolume24h"
                          control={filterForm.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="minVolume24h">Min</FormLabel>
                              <FormControl>
                                <Input
                                  id="minVolume24h"
                                  type="number"
                                  placeholder="Min"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name="maxVolume24h"
                          control={filterForm.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="maxVolume24h">Max</FormLabel>
                              <FormControl>
                                <Input
                                  id="maxVolume24h"
                                  type="number"
                                  placeholder="Max"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Sorting</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          name="sortBy"
                          control={filterForm.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="sortBy">Sort By</FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select field" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="liquidity_usd">
                                      Liquidity
                                    </SelectItem>
                                    <SelectItem value="market_cap">
                                      Market Cap
                                    </SelectItem>
                                    <SelectItem value="pair_created_at">
                                      Pair Age
                                    </SelectItem>
                                    <SelectItem value="txns_24h">
                                      Transactions (24h)
                                    </SelectItem>
                                    <SelectItem value="volume_24h">
                                      Volume (24h)
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name="sortOrder"
                          control={filterForm.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="sortOrder">Order</FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select order" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="asc">
                                      Ascending
                                    </SelectItem>
                                    <SelectItem value="desc">
                                      Descending
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClearFilters}
                >
                  Clear Filters
                </Button>
                <Button type="submit">Apply Filters</Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
