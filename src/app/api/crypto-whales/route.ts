import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// API Configuration
const MORALIS_API_KEY = process.env.MORALIS_API_KEY || 'demo-key';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || 'demo-key';
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

interface WhaleTransaction {
  hash: string;
  chain: string;
  from: string;
  to: string;
  value: number;
  valueUSD: number;
  token: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
  };
  timestamp: string;
  blockNumber: number;
  gasUsed: number;
  type: 'transfer' | 'swap' | 'liquidity' | 'bridge' | 'nft';
  whaleScore: number;
}

interface WhaleWallet {
  address: string;
  chain: string;
  balance: number;
  balanceUSD: number;
  tokens: Array<{
    symbol: string;
    balance: number;
    balanceUSD: number;
    percentage: number;
  }>;
  totalValueUSD: number;
  profitLoss: number;
  profitLossPercentage: number;
  firstSeen: string;
  lastActive: string;
  transactionCount: number;
  whaleRank: number;
}

interface CryptoMarketData {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  totalSupply: number;
  rank: number;
}

interface WhaleAnalytics {
  totalWhales: number;
  totalValueTracked: number;
  topMovers: WhaleTransaction[];
  emergingWallets: WhaleWallet[];
  marketSentiment: {
    bullish: number;
    bearish: number;
    neutral: number;
  };
  flowAnalysis: {
    inflow: number;
    outflow: number;
    netFlow: number;
    exchangeFlow: {
      inflow: number;
      outflow: number;
    };
  };
  chainDistribution: Array<{
    chain: string;
    percentage: number;
    value: number;
  }>;
}

interface CryptoWhaleResults {
  success: boolean;
  timestamp: string;
  recentTransactions: WhaleTransaction[];
  topWhales: WhaleWallet[];
  marketData: CryptoMarketData[];
  analytics: WhaleAnalytics;
  alerts: Array<{
    type: 'large_transaction' | 'whale_accumulation' | 'exchange_flow' | 'new_whale';
    message: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: string;
    data: any;
  }>;
}

// Helper function to add delay between API calls
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch Ethereum whale transactions using Etherscan
async function fetchEthereumWhaleTransactions(): Promise<WhaleTransaction[]> {
  try {
    // Mock data for demonstration - replace with actual Etherscan API calls
    const mockTransactions: WhaleTransaction[] = [
      {
        hash: '0x' + Math.random().toString(16).substring(2, 66),
        chain: 'ethereum',
        from: '0x' + Math.random().toString(16).substring(2, 42),
        to: '0x' + Math.random().toString(16).substring(2, 42),
        value: Math.random() * 1000 + 100,
        valueUSD: (Math.random() * 1000 + 100) * 3200, // ETH price ~$3200
        token: {
          symbol: 'ETH',
          name: 'Ethereum',
          address: '0x0000000000000000000000000000000000000000',
          decimals: 18
        },
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
        gasUsed: Math.floor(Math.random() * 100000) + 21000,
        type: 'transfer',
        whaleScore: Math.floor(Math.random() * 40) + 60
      },
      {
        hash: '0x' + Math.random().toString(16).substring(2, 66),
        chain: 'ethereum',
        from: '0x' + Math.random().toString(16).substring(2, 42),
        to: '0x' + Math.random().toString(16).substring(2, 42),
        value: Math.random() * 50000 + 10000,
        valueUSD: (Math.random() * 50000 + 10000) * 1, // USDC
        token: {
          symbol: 'USDC',
          name: 'USD Coin',
          address: '0xA0b86a33E6441b8f7C4F9F7c8F1F1E1F1F1F1F1F',
          decimals: 6
        },
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
        gasUsed: Math.floor(Math.random() * 100000) + 21000,
        type: 'transfer',
        whaleScore: Math.floor(Math.random() * 30) + 70
      }
    ];

    return mockTransactions;
  } catch (error) {
    console.error('Error fetching Ethereum whale transactions:', error);
    return [];
  }
}

// Fetch Solana whale transactions
async function fetchSolanaWhaleTransactions(): Promise<WhaleTransaction[]> {
  try {
    // Mock data for demonstration - replace with actual Solscan API calls
    const mockTransactions: WhaleTransaction[] = [
      {
        hash: Math.random().toString(36).substring(2, 50),
        chain: 'solana',
        from: Math.random().toString(36).substring(2, 46),
        to: Math.random().toString(36).substring(2, 46),
        value: Math.random() * 10000 + 1000,
        valueUSD: (Math.random() * 10000 + 1000) * 180, // SOL price ~$180
        token: {
          symbol: 'SOL',
          name: 'Solana',
          address: 'So11111111111111111111111111111111111111112',
          decimals: 9
        },
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        blockNumber: Math.floor(Math.random() * 10000000) + 200000000,
        gasUsed: Math.floor(Math.random() * 10000) + 5000,
        type: 'transfer',
        whaleScore: Math.floor(Math.random() * 35) + 65
      }
    ];

    return mockTransactions;
  } catch (error) {
    console.error('Error fetching Solana whale transactions:', error);
    return [];
  }
}

// Fetch multi-chain data using Moralis (mock implementation)
async function fetchMoralisWhaleData(): Promise<{ transactions: WhaleTransaction[], wallets: WhaleWallet[] }> {
  try {
    // Mock data for demonstration - replace with actual Moralis API calls
    const mockWallets: WhaleWallet[] = [
      {
        address: '0x' + Math.random().toString(16).substring(2, 42),
        chain: 'ethereum',
        balance: Math.random() * 10000 + 1000,
        balanceUSD: (Math.random() * 10000 + 1000) * 3200,
        tokens: [
          {
            symbol: 'ETH',
            balance: Math.random() * 1000 + 100,
            balanceUSD: (Math.random() * 1000 + 100) * 3200,
            percentage: 60 + Math.random() * 30
          },
          {
            symbol: 'USDC',
            balance: Math.random() * 100000 + 10000,
            balanceUSD: Math.random() * 100000 + 10000,
            percentage: 10 + Math.random() * 30
          }
        ],
        totalValueUSD: Math.random() * 10000000 + 1000000,
        profitLoss: (Math.random() - 0.5) * 1000000,
        profitLossPercentage: (Math.random() - 0.5) * 100,
        firstSeen: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
        lastActive: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        transactionCount: Math.floor(Math.random() * 10000) + 100,
        whaleRank: Math.floor(Math.random() * 100) + 1
      }
    ];

    const mockTransactions: WhaleTransaction[] = [
      {
        hash: '0x' + Math.random().toString(16).substring(2, 66),
        chain: 'polygon',
        from: '0x' + Math.random().toString(16).substring(2, 42),
        to: '0x' + Math.random().toString(16).substring(2, 42),
        value: Math.random() * 1000000 + 100000,
        valueUSD: Math.random() * 500000 + 50000,
        token: {
          symbol: 'MATIC',
          name: 'Polygon',
          address: '0x0000000000000000000000000000000000001010',
          decimals: 18
        },
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        blockNumber: Math.floor(Math.random() * 10000000) + 40000000,
        gasUsed: Math.floor(Math.random() * 50000) + 21000,
        type: 'transfer',
        whaleScore: Math.floor(Math.random() * 40) + 60
      }
    ];

    return { transactions: mockTransactions, wallets: mockWallets };
  } catch (error) {
    console.error('Error fetching Moralis whale data:', error);
    return { transactions: [], wallets: [] };
  }
}

// Fetch market data from CoinGecko
async function fetchCoinGeckoMarketData(): Promise<CryptoMarketData[]> {
  try {
    // For now, using mock data - replace with actual CoinGecko API calls
    const mockMarketData: CryptoMarketData[] = [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 65000 + (Math.random() - 0.5) * 10000,
        priceChange24h: (Math.random() - 0.5) * 5000,
        priceChangePercentage24h: (Math.random() - 0.5) * 10,
        marketCap: 1200000000000 + (Math.random() - 0.5) * 200000000000,
        volume24h: 30000000000 + Math.random() * 20000000000,
        circulatingSupply: 19700000,
        totalSupply: 21000000,
        rank: 1
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        price: 3200 + (Math.random() - 0.5) * 800,
        priceChange24h: (Math.random() - 0.5) * 300,
        priceChangePercentage24h: (Math.random() - 0.5) * 8,
        marketCap: 400000000000 + (Math.random() - 0.5) * 100000000000,
        volume24h: 15000000000 + Math.random() * 10000000000,
        circulatingSupply: 120000000,
        totalSupply: 120000000,
        rank: 2
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        price: 180 + (Math.random() - 0.5) * 40,
        priceChange24h: (Math.random() - 0.5) * 20,
        priceChangePercentage24h: (Math.random() - 0.5) * 12,
        marketCap: 80000000000 + (Math.random() - 0.5) * 20000000000,
        volume24h: 3000000000 + Math.random() * 2000000000,
        circulatingSupply: 450000000,
        totalSupply: 550000000,
        rank: 5
      }
    ];

    return mockMarketData;
  } catch (error) {
    console.error('Error fetching CoinGecko market data:', error);
    return [];
  }
}

// Generate whale analytics
function generateWhaleAnalytics(
  transactions: WhaleTransaction[], 
  wallets: WhaleWallet[], 
  marketData: CryptoMarketData[]
): WhaleAnalytics {
  const totalValue = wallets.reduce((sum, wallet) => sum + wallet.totalValueUSD, 0);
  
  // Calculate market sentiment based on recent transactions
  const bullishTransactions = transactions.filter(tx => tx.type === 'transfer' && tx.valueUSD > 100000).length;
  const bearishTransactions = transactions.filter(tx => tx.type === 'transfer' && tx.valueUSD < 50000).length;
  const neutralTransactions = transactions.length - bullishTransactions - bearishTransactions;
  
  const totalTransactions = transactions.length || 1;
  
  // Calculate flow analysis
  const inflow = transactions
    .filter(tx => tx.to.includes('exchange') || tx.to.includes('binance') || tx.to.includes('coinbase'))
    .reduce((sum, tx) => sum + tx.valueUSD, 0);
  
  const outflow = transactions
    .filter(tx => tx.from.includes('exchange') || tx.from.includes('binance') || tx.from.includes('coinbase'))
    .reduce((sum, tx) => sum + tx.valueUSD, 0);
  
  return {
    totalWhales: wallets.length,
    totalValueTracked: totalValue,
    topMovers: transactions.slice(0, 10),
    emergingWallets: wallets.filter(w => w.whaleRank > 50).slice(0, 5),
    marketSentiment: {
      bullish: Math.round((bullishTransactions / totalTransactions) * 100),
      bearish: Math.round((bearishTransactions / totalTransactions) * 100),
      neutral: Math.round((neutralTransactions / totalTransactions) * 100)
    },
    flowAnalysis: {
      inflow: Math.random() * 1000000000,
      outflow: Math.random() * 800000000,
      netFlow: Math.random() * 200000000,
      exchangeFlow: {
        inflow,
        outflow
      }
    },
    chainDistribution: [
      { chain: 'ethereum', percentage: 45, value: totalValue * 0.45 },
      { chain: 'solana', percentage: 20, value: totalValue * 0.20 },
      { chain: 'polygon', percentage: 15, value: totalValue * 0.15 },
      { chain: 'bsc', percentage: 12, value: totalValue * 0.12 },
      { chain: 'avalanche', percentage: 8, value: totalValue * 0.08 }
    ]
  };
}

// Generate whale alerts
function generateWhaleAlerts(transactions: WhaleTransaction[], wallets: WhaleWallet[]): Array<{
  type: 'large_transaction' | 'whale_accumulation' | 'exchange_flow' | 'new_whale';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  data: any;
}> {
  const alerts: Array<{
    type: 'large_transaction' | 'whale_accumulation' | 'exchange_flow' | 'new_whale';
    message: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: string;
    data: any;
  }> = [];
  
  // Large transaction alerts
  const largeTransactions = transactions.filter(tx => tx.valueUSD > 1000000);
  largeTransactions.forEach(tx => {
    alerts.push({
      type: 'large_transaction',
      message: `Large ${tx.token.symbol} transaction: $${(tx.valueUSD / 1000000).toFixed(2)}M moved on ${tx.chain}`,
      severity: tx.valueUSD > 10000000 ? 'high' : 'medium',
      timestamp: tx.timestamp,
      data: tx
    });
  });
  
  // Whale accumulation alerts
  const accumulatingWallets = wallets.filter(w => w.profitLossPercentage > 20);
  accumulatingWallets.forEach(wallet => {
    alerts.push({
      type: 'whale_accumulation',
      message: `Whale wallet showing ${wallet.profitLossPercentage.toFixed(1)}% gains with $${(wallet.totalValueUSD / 1000000).toFixed(2)}M portfolio`,
      severity: wallet.profitLossPercentage > 50 ? 'high' : 'medium',
      timestamp: wallet.lastActive,
      data: wallet
    });
  });
  
  return alerts.slice(0, 10); // Return top 10 alerts
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chain = searchParams.get('chain') || 'all';
    const minValue = parseInt(searchParams.get('minValue') || '100000');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    console.log('Fetching crypto whale data with criteria:', {
      chain,
      minValue,
      limit
    });
    
    // Fetch data from all sources
    const [ethTransactions, solTransactions, moralisData, marketData] = await Promise.all([
      fetchEthereumWhaleTransactions(),
      fetchSolanaWhaleTransactions(),
      fetchMoralisWhaleData(),
      fetchCoinGeckoMarketData()
    ]);
    
    // Combine all transactions
    let allTransactions = [
      ...ethTransactions,
      ...solTransactions,
      ...moralisData.transactions
    ];
    
    // Filter by chain if specified
    if (chain !== 'all') {
      allTransactions = allTransactions.filter(tx => tx.chain === chain);
    }
    
    // Filter by minimum value
    allTransactions = allTransactions
      .filter(tx => tx.valueUSD >= minValue)
      .sort((a, b) => b.valueUSD - a.valueUSD)
      .slice(0, limit);
    
    // Get whale wallets
    const whaleWallets = moralisData.wallets
      .sort((a, b) => b.totalValueUSD - a.totalValueUSD)
      .slice(0, 20);
    
    // Generate analytics
    const analytics = generateWhaleAnalytics(allTransactions, whaleWallets, marketData);
    
    // Generate alerts
    const alerts = generateWhaleAlerts(allTransactions, whaleWallets);
    
    const results: CryptoWhaleResults = {
      success: true,
      timestamp: new Date().toISOString(),
      recentTransactions: allTransactions,
      topWhales: whaleWallets,
      marketData,
      analytics,
      alerts
    };
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Crypto whale tracking error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch crypto whale data',
        timestamp: new Date().toISOString(),
        recentTransactions: [],
        topWhales: [],
        marketData: [],
        analytics: null,
        alerts: []
      },
      { status: 500 }
    );
  }
} 