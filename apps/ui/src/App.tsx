import './App.css';
import {
  Container,
  createListCollection,
  Field,
  Flex,
  Heading,
  Input,
  Button,
  Stack,
  useDisclosure,
  Table,
} from '@chakra-ui/react';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectValueText,
} from './components/ui/select';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
} from './components/ui/dialog';
import { formatDistance } from 'date-fns';

const timestamps = createListCollection({
  items: Array.from({ length: 10 }, (_, i) => ({
    label: `${i}:00`,
    value: `${i}:00`,
  })),
});

const mockData = [
  {
    chainId: 'solana',
    dexId: 'meteora',
    url: 'https://dexscreener.com/solana/gsbepxh4skvn1rzdk1usxthp11zceg5cdhxnuvk72ujq',
    pairAddress: 'GSbePXh4skvN1RZDK1Usxthp11zcEG5cdHxnUvK72uJq',
    labels: ['DLMM'],
    baseToken: {
      address: 'J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr',
      name: 'SPX6900 (Wormhole)',
      symbol: 'SPX',
    },
    quoteToken: {
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      name: 'USD Coin',
      symbol: 'USDC',
    },
    priceNative: '0.7659',
    priceUsd: '0.7659',
    txns: {
      m5: {
        buys: 0,
        sells: 7,
      },
      h1: {
        buys: 40,
        sells: 27,
      },
      h6: {
        buys: 116,
        sells: 62,
      },
      h24: {
        buys: 299,
        sells: 256,
      },
    },
    volume: {
      h24: 17039.94,
      h6: 5981.15,
      h1: 2671.48,
      m5: 78.62,
    },
    priceChange: {
      m5: -0.54,
      h1: 2.74,
      h6: 11.85,
      h24: 15.53,
    },
    liquidity: {
      usd: 1283.05,
      base: 1038.9586,
      quote: 487.2852,
      meteora: 1283.422375931011,
    },
    fdv: 92686238,
    marketCap: 92686238,
    pairCreatedAt: 1738704641000,
    info: {
      imageUrl:
        'https://dd.dexscreener.com/ds-data/tokens/solana/J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr.png?key=655313',
      header:
        'https://dd.dexscreener.com/ds-data/tokens/solana/J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr/header.png?key=655313',
      openGraph:
        'https://cdn.dexscreener.com/token-images/og/solana/J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr?timestamp=1739255700000',
      websites: [
        {
          label: 'Website',
          url: 'https://www.spx6900.com/',
        },
      ],
      socials: [
        {
          type: 'twitter',
          url: 'https://twitter.com/spx6900',
        },
        {
          type: 'telegram',
          url: 'https://t.me/SPX6900Portal',
        },
      ],
    },
    strict: true,
    bin_step: 25,
    base_fee: 0.0025,
    volume24h: {
      h24: 17039.94,
      h6: 23924.6,
      h1: 64115.520000000004,
      m5: 22642.56,
      min: 17039.94,
      max: 64115.520000000004,
    },
    fees24h: {
      h24: 42.599849999999996,
      h6: 59.811499999999995,
      h1: 160.2888,
      m5: 56.60640000000001,
      min: 42.599849999999996,
      max: 160.2888,
    },
    feeToTvl: {
      h24: 0.033202018627489185,
      h6: 0.046616655625267914,
      h1: 0.12492794513074316,
      m5: 0.04411862359222167,
      min: 0.033202018627489185,
      max: 0.12492794513074316,
    },
    trend: 'Up',
    meteoraPair: {
      address: 'GSbePXh4skvN1RZDK1Usxthp11zcEG5cdHxnUvK72uJq',
      name: 'SPX-USDC',
      mint_x: 'J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr',
      mint_y: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      reserve_x: 'BFhcCftEXjqrRe3d4K4WmytbH5WnZRPmVVBCZsBvNQ9d',
      reserve_y: '3ajwTKpgTG1LiRaa1DJWUKNauCxEHhiGn1bmRCn9zDjw',
      reserve_x_amount: 103895863675,
      reserve_y_amount: 487285282,
      bin_step: 25,
      base_fee_percentage: '0.25',
      max_fee_percentage: '1.3984375',
      protocol_fee_percentage: '5',
      liquidity: '1283.422375931011',
      reward_mint_x: '11111111111111111111111111111111',
      reward_mint_y: '11111111111111111111111111111111',
      fees_24h: 41.07741856849188,
      today_fees: 14.394754244772027,
      trade_volume_24h: 17056.118437215508,
      cumulative_trade_volume: '101834.8400',
      cumulative_fee_volume: '250.5800',
      current_price: 0.7662528430044659,
      apr: 3.200615739513953,
      apy: 9863496.503708906,
      farm_apr: 0,
      farm_apy: 0,
      hide: false,
      is_blacklisted: false,
      fees: {
        min_30: 2.1896342318646527,
        hour_1: 6.450237919862543,
        hour_2: 10.958894588392663,
        hour_4: 11.386114616951815,
        hour_12: 15.118903239252592,
        hour_24: 41.07741856849188,
      },
      fee_tvl_ratio: {
        min_30: 0.17060901172743417,
        hour_1: 0.5025810708016881,
        hour_2: 0.8538805925401559,
        hour_4: 0.8871681552764095,
        hour_12: 1.1780146211246432,
        hour_24: 3.200615739513953,
      },
    },
  },
  {
    chainId: 'solana',
    dexId: 'meteora',
    url: 'https://dexscreener.com/solana/hjess3qcwdw2pwnqaibag8utdqnyt7qaxaffbjaxytud',
    pairAddress: 'HJesS3qcwDW2PWNqaiBaG8UTdqNyT7qaxaffbJAXYTUD',
    labels: ['DLMM'],
    baseToken: {
      address: 'Fxm6tJ2khHbLVcSgnYUqg9FiBduVRLEvdQR67dvQ3eGp',
      name: 'Naitzsche',
      symbol: 'NAI',
    },
    quoteToken: {
      address: 'Bz4MhmVRQENiCou7ZpJ575wpjNFjBjVBSiVhuNg1pump',
      name: 'Project89',
      symbol: 'Project89',
    },
    priceNative: '0.1199',
    priceUsd: '0.0006027',
    txns: {
      m5: {
        buys: 0,
        sells: 0,
      },
      h1: {
        buys: 0,
        sells: 0,
      },
      h6: {
        buys: 6,
        sells: 6,
      },
      h24: {
        buys: 26,
        sells: 27,
      },
    },
    volume: {
      h24: 788.21,
      h6: 236.35,
      h1: 0,
      m5: 0,
    },
    priceChange: {
      h6: 17.88,
      h24: -2.05,
    },
    liquidity: {
      usd: 983.53,
      base: 1265333,
      quote: 43925,
      meteora: 1009.2432774680701,
    },
    fdv: 602688,
    marketCap: 602688,
    pairCreatedAt: 1738184090000,
    info: {
      imageUrl:
        'https://dd.dexscreener.com/ds-data/tokens/solana/Fxm6tJ2khHbLVcSgnYUqg9FiBduVRLEvdQR67dvQ3eGp.png?key=7532f1',
      header:
        'https://dd.dexscreener.com/ds-data/tokens/solana/Fxm6tJ2khHbLVcSgnYUqg9FiBduVRLEvdQR67dvQ3eGp/header.png?key=7532f1',
      openGraph:
        'https://cdn.dexscreener.com/token-images/og/solana/Fxm6tJ2khHbLVcSgnYUqg9FiBduVRLEvdQR67dvQ3eGp?timestamp=1739255700000',
      websites: [
        {
          label: 'Website',
          url: 'https://naitzsche.com/',
        },
      ],
      socials: [
        {
          type: 'twitter',
          url: 'https://x.com/naitzsche',
        },
        {
          type: 'telegram',
          url: 'https://t.me/naitzsche',
        },
      ],
    },
    strict: false,
    bin_step: 250,
    base_fee: 0.02,
    volume24h: {
      h24: 788.21,
      h6: 945.4,
      h1: 0,
      m5: 0,
      min: 0,
      max: 945.4,
    },
    fees24h: {
      h24: 15.7642,
      h6: 18.908,
      h1: 0,
      m5: 0,
      min: 0,
      max: 18.908,
    },
    feeToTvl: {
      h24: 0.01602818419366974,
      h6: 0.01922462965034112,
      h1: 0,
      m5: 0,
      min: 0,
      max: 0.01922462965034112,
    },
    trend: 'Up',
    meteoraPair: {
      address: 'HJesS3qcwDW2PWNqaiBaG8UTdqNyT7qaxaffbJAXYTUD',
      name: 'Project89-NAI',
      mint_x: 'Bz4MhmVRQENiCou7ZpJ575wpjNFjBjVBSiVhuNg1pump',
      mint_y: 'Fxm6tJ2khHbLVcSgnYUqg9FiBduVRLEvdQR67dvQ3eGp',
      reserve_x: 'GK4worwweZwouo6Ddyvj24U73zJEn7XxCY6NuWg88iaw',
      reserve_y: '2MwUeTJKCg4kVhz251ybVPhc2jXSRTSUcSytdXx2gY1o',
      reserve_x_amount: 43925208416,
      reserve_y_amount: 1265333228073,
      bin_step: 250,
      base_fee_percentage: '2',
      max_fee_percentage: '10',
      protocol_fee_percentage: '5',
      liquidity: '1009.2432774680701',
      reward_mint_x: '11111111111111111111111111111111',
      reward_mint_y: '11111111111111111111111111111111',
      fees_24h: 15.991050096285148,
      today_fees: 5.010804152617509,
      trade_volume_24h: 785.1778994244072,
      cumulative_trade_volume: '14914.2300',
      cumulative_fee_volume: '315.3900',
      current_price: 8.156964238673943,
      apr: 1.5844594116497412,
      apy: 30942.37508256922,
      farm_apr: 0,
      farm_apy: 0,
      hide: false,
      is_blacklisted: false,
      fees: {
        min_30: 0,
        hour_1: 0,
        hour_2: 0,
        hour_4: 1.9975446081088557,
        hour_12: 11.088549093390224,
        hour_24: 15.991050096285148,
      },
      fee_tvl_ratio: {
        min_30: 0,
        hour_1: 0,
        hour_2: 0,
        hour_4: 0.19792498525431626,
        hour_12: 1.0986993266091918,
        hour_24: 1.5844594116497412,
      },
    },
  },
];

function App() {
  const { open, onOpen, onClose, onToggle } = useDisclosure();

  return (
    <Container border="1px solid white" p={4}>
      <Heading size="2xl" mb={4} textTransform={'uppercase'}>
        {/* Meteora backtester */}
      </Heading>

      <Heading size="lg" mb={2}>
        Start parameters
      </Heading>

      <Flex width={'20rem'} direction={'column'} gap={4}>
        <Field.Root>
          <Field.Label fontSize={'sm'}>Date</Field.Label>
          <Input min="2023-01-01" max="2023-12-31" type="date" />
        </Field.Root>

        <SelectRoot collection={timestamps}>
          <SelectLabel alignSelf={'start'}>Start timestamp</SelectLabel>
          <SelectTrigger>
            <SelectValueText />
          </SelectTrigger>
          <SelectContent>
            {timestamps.items.map((timestamp) => (
              <SelectItem key={timestamp.value} item={timestamp}>
                {timestamp.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>

        <Field.Root>
          <Field.Label fontSize={'sm'}>SOL amount</Field.Label>
          <Input min="0" max="100" type="number" />
        </Field.Root>

        <Field.Root>
          <Field.Label fontSize={'sm'}>Pool</Field.Label>
          <Input placeholder="Search by name" />
          <Button mt={2} onClick={onOpen}>
            Filter
          </Button>

          <DialogRoot open={open} onOpenChange={onToggle}>
            <DialogContent>
              <DialogHeader>Filter Options</DialogHeader>
              <DialogCloseTrigger />
              <DialogBody>
                <Stack gap={2}>
                  {[
                    { label: 'Liquidity', unit: '$' },
                    { label: 'Market Cap', unit: '$' },
                    { label: 'FDV', unit: '$' },
                    { label: 'Pair Age', unit: 'hours' },
                    { label: '24H Txns', unit: 'txns' },
                    { label: '24H Buys', unit: 'txns' },
                    { label: '24H Sells', unit: 'txns' },
                    { label: '24H Volume', unit: '$' },
                    { label: '24H Change', unit: '%' },
                    { label: '6H Txns', unit: 'txns' },
                    { label: '6H Buys', unit: 'txns' },
                    { label: '6H Sells', unit: 'txns' },
                    { label: '6H Volume', unit: '$' },
                    { label: '6H Change', unit: '%' },
                    { label: '1H Txns', unit: 'txns' },
                    { label: '1H Buys', unit: 'txns' },
                    { label: '1H Sells', unit: 'txns' },
                    { label: '1H Volume', unit: '$' },
                    { label: '1H Change', unit: '%' },
                    { label: '5M Txns', unit: 'txns' },
                    { label: '5M Buys', unit: 'txns' },
                    { label: '5M Sells', unit: 'txns' },
                    { label: '5M Volume', unit: '$' },
                    { label: '5M Change', unit: '%' },
                  ].map(({ label, unit }) => (
                    <Flex key={label} align="center" gap={2}>
                      <Field.Label width={'16rem'}>{label}</Field.Label>
                      <Input type="number" placeholder={`Min ${unit}`} />
                      <Input type="number" placeholder={`Max ${unit}`} />
                    </Flex>
                  ))}
                </Stack>
              </DialogBody>
              <DialogFooter>
                <Button colorScheme="blue" mr={3} onClick={onClose}>
                  Apply
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogRoot>

          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Pair Name</Table.ColumnHeader>
                <Table.ColumnHeader>Liquidity</Table.ColumnHeader>
                <Table.ColumnHeader>Pair Age</Table.ColumnHeader>
                <Table.ColumnHeader>24H Txns</Table.ColumnHeader>
                <Table.ColumnHeader>24H Volume</Table.ColumnHeader>
                <Table.ColumnHeader>24H Change</Table.ColumnHeader>
                <Table.ColumnHeader>6H Txns</Table.ColumnHeader>
                <Table.ColumnHeader>6H Change</Table.ColumnHeader>
                <Table.ColumnHeader>1H Txns</Table.ColumnHeader>
                <Table.ColumnHeader>1H Change</Table.ColumnHeader>
                <Table.ColumnHeader>5M Txns</Table.ColumnHeader>
                <Table.ColumnHeader>5M Change</Table.ColumnHeader>
                <Table.ColumnHeader>Market Cap</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {mockData.map((data) => (
                <Table.Row key={data.pairAddress}>
                  <Table.Cell>
                    {data.baseToken.name} - {data.quoteToken.symbol}
                  </Table.Cell>
                  <Table.Cell>
                    {data.liquidity.usd.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </Table.Cell>
                  <Table.Cell>
                    {formatDistance(data.pairCreatedAt, new Date(), {
                      // addSuffix: true,
                    })}
                  </Table.Cell>
                  <Table.Cell>
                    {data.txns.h24.buys + data.txns.h24.sells}
                  </Table.Cell>
                  <Table.Cell>
                    {data.volume.h24.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </Table.Cell>
                  <Table.Cell>{data.priceChange.h24}%</Table.Cell>
                  <Table.Cell>
                    {data.txns.h6.buys + data.txns.h6.sells}
                  </Table.Cell>
                  <Table.Cell>{data.priceChange.h6}%</Table.Cell>
                  <Table.Cell>
                    {data.txns.h1.buys + data.txns.h1.sells}
                  </Table.Cell>
                  <Table.Cell>{data.priceChange.h1}%</Table.Cell>
                  <Table.Cell>
                    {data.txns.m5.buys + data.txns.m5.sells}
                  </Table.Cell>
                  <Table.Cell>{data.priceChange.m5}%</Table.Cell>
                  <Table.Cell>
                    {data.marketCap.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          <Button>Run</Button>
        </Field.Root>
      </Flex>
    </Container>
  );
}

export default App;
