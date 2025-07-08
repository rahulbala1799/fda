'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Search, BarChart3, DollarSign, Bitcoin, AlertCircle, Brain } from 'lucide-react';

interface FinancialData {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  rsi: number;
  movingAverages: {
    sma20: number;
    sma50: number;
    trend: string;
  };
  hourlyData: Array<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

interface FibonacciLevels {
  support: {
    level_236: number;
    level_382: number;
    level_500: number;
    level_618: number;
    level_786: number;
  };
  resistance: {
    level_236: number;
    level_382: number;
    level_500: number;
    level_618: number;
    level_786: number;
  };
  swingHigh: number;
  swingLow: number;
}

interface TradingRecommendation {
  action: 'BUY' | 'SELL' | 'HOLD';
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  riskRewardRatio: number;
  maxHoldingDays: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  strategy: string;
  reasoning: string[];
}

interface ScreenedStock {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  volumeRatio: number;
  rsi?: number;
  volatility: number;
  movingAverages: {
    sma20: number;
    sma50: number;
    priceVsSMA20: number;
    priceVsSMA50: number;
  };
  technicalSignals: {
    volumeSpike: boolean;
    nearSupport: boolean;
    nearResistance: boolean;
    oversold: boolean;
    overbought: boolean;
    breakoutCandidate: boolean;
  };
  fibonacci: FibonacciLevels;
  tradingRecommendation: TradingRecommendation;
  score: number;
  reasoning: string[];
}

interface ScreeningResults {
  success: boolean;
  totalScreened: number;
  candidatesFound: number;
  criteria: {
    minScore: number;
    limit: number;
    sector?: string;
  };
  stocks: ScreenedStock[];
  timestamp: string;
}

interface AccumulationMetrics {
  onBalanceVolume: {
    current: number;
    trend: 'RISING' | 'FALLING' | 'NEUTRAL';
    divergence: boolean;
  };
  accumulationDistribution: {
    current: number;
    trend: 'ACCUMULATION' | 'DISTRIBUTION' | 'NEUTRAL';
    strength: number;
  };
  volumePriceTrend: {
    current: number;
    trend: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  };
  consolidation: {
    isConsolidating: boolean;
    rangeTightness: number;
    duration: number;
    supportLevel: number;
    resistanceLevel: number;
  };
  wyckoffPhase: {
    phase: 'ACCUMULATION' | 'MARKUP' | 'DISTRIBUTION' | 'MARKDOWN' | 'UNKNOWN';
    confidence: number;
    characteristics: string[];
  };
  volumeProfile: {
    highVolumeAtLows: boolean;
    averageVolumeAtLows: number;
    averageVolumeAtHighs: number;
    volumeRatio: number;
  };
}

interface AccumulationStock {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  accumulationMetrics: AccumulationMetrics;
  accumulationScore: number;
  accumulationSignals: {
    volumeDivergence: boolean;
    priceConsolidation: boolean;
    smartMoneyFlow: boolean;
    wyckoffAccumulation: boolean;
    highVolumeAtSupport: boolean;
  };
  timeframe: {
    consolidationStart: string;
    daysInConsolidation: number;
  };
  reasoning: string[];
}

interface AccumulationResults {
  success: boolean;
  totalAnalyzed: number;
  accumulationCandidates: number;
  criteria: {
    minScore: number;
    limit: number;
    includeETFs: boolean;
  };
  stocks: AccumulationStock[];
  timestamp: string;
}

interface InvestmentRecommendation {
  recommendedStock: {
    symbol: string;
    name: string;
    currentPrice: number;
    accumulationScore: number;
  };
  investmentStrategy: {
    weeklyAmount: number;
    sharesPerWeek: number;
    totalShares: number;
    timeHorizon: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  reasoning: {
    whyThisStock: string[];
    marketAnalysis: string[];
    riskAssessment: string[];
    timeframePrediction: string[];
  };
  alternatives: {
    symbol: string;
    name: string;
    reason: string;
  }[];
  confidence: number;
  lastUpdated: string;
}

interface AIAnalysisResult {
  success: boolean;
  recommendation: InvestmentRecommendation;
  analysisDate: string;
  stocksAnalyzed: number;
}

interface IndianStock {
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  peRatio: number;
  pbRatio: number;
  dividendYield: number;
  sector: string;
  industry: string;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  rsi: number;
  movingAverages: {
    sma20: number;
    sma50: number;
    sma200: number;
    trend: string;
  };
  technicalSignals: {
    nearSupport: boolean;
    nearResistance: boolean;
    oversold: boolean;
    overbought: boolean;
    breakoutCandidate: boolean;
    volumeSpike: boolean;
  };
  fundamentals: {
    revenue: number;
    netIncome: number;
    eps: number;
    bookValue: number;
    roe: number;
    debt: number;
  };
  score: number;
  reasoning: string[];
}

interface IndianStockResults {
  success: boolean;
  totalScreened: number;
  candidatesFound: number;
  criteria: {
    minScore: number;
    limit: number;
    exchange?: string;
    sector?: string;
    minPrice?: number;
    maxPrice?: number;
  };
  stocks: IndianStock[];
  timestamp: string;
}

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

export default function Home() {
  const [symbol, setSymbol] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analyze' | 'screen' | 'accumulation' | 'ai-analysis' | 'indian-stocks' | 'crypto-whales'>('analyze');
  const [isScreening, setIsScreening] = useState(false);
  const [screeningResults, setScreeningResults] = useState<ScreeningResults | null>(null);
  const [minScore, setMinScore] = useState(50);
  const [maxResults, setMaxResults] = useState(10);
  const [isAccumulationScanning, setIsAccumulationScanning] = useState(false);
  const [accumulationResults, setAccumulationResults] = useState<AccumulationResults | null>(null);
  const [accumulationMinScore, setAccumulationMinScore] = useState(50);
  const [accumulationMaxResults, setAccumulationMaxResults] = useState(100);
  const [includeETFs, setIncludeETFs] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [aiAnalysisResult, setAIAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [isIndianStockScreening, setIsIndianStockScreening] = useState(false);
  const [indianStockResults, setIndianStockResults] = useState<IndianStockResults | null>(null);
  const [indianMinScore, setIndianMinScore] = useState(60);
  const [indianMaxResults, setIndianMaxResults] = useState(20);
  const [selectedExchange, setSelectedExchange] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [isCryptoWhaleTracking, setIsCryptoWhaleTracking] = useState(false);
  const [cryptoWhaleResults, setCryptoWhaleResults] = useState<CryptoWhaleResults | null>(null);
  const [selectedChain, setSelectedChain] = useState<string>('all');
  const [minWhaleValue, setMinWhaleValue] = useState<number>(100000);
  const [whaleLimit, setWhaleLimit] = useState<number>(50);

  const handleAnalyze = async () => {
    if (!symbol.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    setFinancialData(null);
    
    try {
      const response = await fetch(`/api/financial-data?symbol=${encodeURIComponent(symbol)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch data');
      }
      
      setFinancialData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleScreenStocks = async () => {
    setIsScreening(true);
    setError(null);
    setScreeningResults(null);
    
    try {
      const response = await fetch(`/api/stock-screener?minScore=${minScore}&limit=${maxResults}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to screen stocks');
      }
      
      setScreeningResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during screening');
    } finally {
      setIsScreening(false);
    }
  };

  const handleAccumulationScan = async () => {
    setIsAccumulationScanning(true);
    setError(null);
    setAccumulationResults(null);
    
    try {
      const response = await fetch(`/api/accumulation-scanner?minScore=${accumulationMinScore}&limit=${accumulationMaxResults}&includeETFs=${includeETFs}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan for accumulation patterns');
      }
      
      setAccumulationResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during accumulation scanning');
    } finally {
      setIsAccumulationScanning(false);
    }
  };

  const handleAIAnalysis = async () => {
    if (!accumulationResults || !accumulationResults.stocks.length) {
      setError('Please run accumulation scan first to get AI investment recommendations');
      return;
    }

    setIsAIAnalyzing(true);
    setError(null);
    setAIAnalysisResult(null);
    
    try {
      const response = await fetch('/api/ai-investment-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stocks: accumulationResults.stocks
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate AI investment analysis');
      }
      
      setAIAnalysisResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during AI analysis');
    } finally {
      setIsAIAnalyzing(false);
    }
  };

  const handleIndianStockScreen = async () => {
    setIsIndianStockScreening(true);
    setError(null);
    setIndianStockResults(null);
    
    try {
      const params = new URLSearchParams({
        minScore: indianMinScore.toString(),
        limit: indianMaxResults.toString(),
      });
      
      if (selectedExchange) params.append('exchange', selectedExchange);
      if (selectedSector) params.append('sector', selectedSector);
      if (minPrice > 0) params.append('minPrice', minPrice.toString());
      if (maxPrice < 10000) params.append('maxPrice', maxPrice.toString());
      
      const response = await fetch(`/api/indian-stocks?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to screen Indian stocks');
      }
      
      setIndianStockResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during Indian stock screening');
    } finally {
      setIsIndianStockScreening(false);
    }
  };

  const handleCryptoWhaleTrack = async () => {
    setIsCryptoWhaleTracking(true);
    setError(null);
    setCryptoWhaleResults(null);
    
    try {
      const params = new URLSearchParams({
        chain: selectedChain,
        minValue: minWhaleValue.toString(),
        limit: whaleLimit.toString(),
      });
      
      const response = await fetch(`/api/crypto-whales?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to track crypto whales');
      }
      
      setCryptoWhaleResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during crypto whale tracking');
    } finally {
      setIsCryptoWhaleTracking(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatIndianPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatPercentage = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getRSIColor = (rsi: number) => {
    if (rsi > 70) return 'text-red-400';
    if (rsi < 30) return 'text-green-400';
    return 'text-yellow-400';
  };

  const getRSILabel = (rsi: number) => {
    if (rsi > 70) return 'Overbought';
    if (rsi < 30) return 'Oversold';
    return 'Neutral';
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'Bullish': return 'text-green-400';
      case 'Bearish': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'text-green-400 bg-green-500/20';
      case 'SELL': return 'text-red-400 bg-red-500/20';
      default: return 'text-yellow-400 bg-yellow-500/20';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'HIGH': return 'text-green-400';
      case 'MEDIUM': return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-emerald-400" />
              <h1 className="text-2xl font-bold text-white">FinanceAI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-emerald-400">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-medium">Market Analysis</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            AI-Powered
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              {' '}Investment{' '}
            </span>
            Analysis
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get intelligent insights on stocks and cryptocurrencies with advanced AI analysis. 
            Discover optimal entry and exit points based on real-time market data.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex justify-center space-x-1 bg-white/10 backdrop-blur-md rounded-xl p-1 border border-white/20">
            <button
              onClick={() => setActiveTab('analyze')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'analyze'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Individual Analysis
            </button>
            <button
              onClick={() => setActiveTab('screen')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'screen'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Stock Screener
            </button>
            <button
              onClick={() => setActiveTab('accumulation')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'accumulation'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Accumulation Scanner
            </button>
            <button
              onClick={() => setActiveTab('ai-analysis')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'ai-analysis'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              AI Investment Advisor
            </button>
            <button
              onClick={() => setActiveTab('indian-stocks')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'indian-stocks'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Indian Stocks
            </button>
            <button
              onClick={() => setActiveTab('crypto-whales')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'crypto-whales'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Crypto Whales
            </button>
          </div>
        </div>

        {/* Individual Analysis Tab */}
        {activeTab === 'analyze' && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-6">
                <DollarSign className="h-6 w-6 text-emerald-400" />
                <h3 className="text-xl font-semibold text-white">Analyze Asset</h3>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter stock symbol (e.g., TSLA, AAPL) or crypto pair (e.g., BTC, ETH)"
                    className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                  />
                  <Search className="absolute right-4 top-4 h-6 w-6 text-gray-400" />
                </div>
                
                <button
                  onClick={handleAnalyze}
                  disabled={!symbol.trim() || isAnalyzing}
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    'Analyze Asset'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stock Screener Tab */}
        {activeTab === 'screen' && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-6">
                <BarChart3 className="h-6 w-6 text-emerald-400" />
                <h3 className="text-xl font-semibold text-white">Stock Screener</h3>
                <div className="text-sm text-gray-400">Find stocks prone to 10%+ moves</div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Minimum Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={minScore}
                    onChange={(e) => setMinScore(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Results
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={maxResults}
                    onChange={(e) => setMaxResults(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  />
                </div>
              </div>
              
              <button
                onClick={handleScreenStocks}
                disabled={isScreening}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
              >
                {isScreening ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Screening Stocks...</span>
                  </div>
                ) : (
                  'Screen Stocks'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Accumulation Scanner Tab */}
        {activeTab === 'accumulation' && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-6">
                <Bitcoin className="h-6 w-6 text-purple-400" />
                <h3 className="text-xl font-semibold text-white">Accumulation Scanner</h3>
                <div className="text-sm text-gray-400">Find stocks being accumulated at lower prices</div>
              </div>
              
              <div className="grid md:grid-cols-4 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Minimum Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={accumulationMinScore}
                    onChange={(e) => setAccumulationMinScore(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Results
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={accumulationMaxResults}
                    onChange={(e) => setAccumulationMaxResults(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Include ETFs
                  </label>
                  <div className="flex items-center space-x-3 mt-3">
                    <input
                      type="checkbox"
                      checked={includeETFs}
                      onChange={(e) => setIncludeETFs(e.target.checked)}
                      className="w-5 h-5 text-purple-400 bg-white/10 border-white/20 rounded focus:ring-purple-400"
                    />
                    <span className="text-white">Include ETFs in analysis</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    View Mode
                  </label>
                  <div className="flex items-center space-x-2 mt-3">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                        viewMode === 'cards'
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      Cards
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                        viewMode === 'table'
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      Table
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleAccumulationScan}
                disabled={isAccumulationScanning}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
              >
                {isAccumulationScanning ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Scanning for Accumulation...</span>
                  </div>
                ) : (
                  'Scan for Accumulation'
                )}
              </button>
            </div>
          </div>
        )}

        {/* AI Investment Analysis Tab */}
        {activeTab === 'ai-analysis' && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-6">
                <Brain className="h-6 w-6 text-orange-400" />
                <h3 className="text-xl font-semibold text-white">AI Investment Advisor</h3>
                <div className="text-sm text-gray-400">GPT-4 powered weekly €200 investment strategy</div>
              </div>
              
              <div className="mb-6">
                <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-500/20">
                  <div className="flex items-center space-x-3 mb-2">
                    <Brain className="h-5 w-5 text-orange-400" />
                    <span className="text-orange-400 font-semibold">How it works:</span>
                  </div>
                  <ol className="text-sm text-gray-300 space-y-1 ml-8">
                    <li>1. First, run the <strong>Accumulation Scanner</strong> to find stocks with smart money patterns</li>
                    <li>2. Our AI analyzes the top accumulation candidates using advanced market intelligence</li>
                    <li>3. Get personalized recommendations for your weekly €200 investment strategy</li>
                    <li>4. Receive detailed reasoning, risk assessment, and alternative options</li>
                  </ol>
                </div>
              </div>
              
              <button
                onClick={handleAIAnalysis}
                disabled={isAIAnalyzing || !accumulationResults?.stocks.length}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
              >
                {isAIAnalyzing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>AI is analyzing accumulation data...</span>
                  </div>
                ) : !accumulationResults?.stocks.length ? (
                  'Run Accumulation Scanner First'
                ) : (
                  'Get AI Investment Recommendation'
                )}
              </button>
              
              {!accumulationResults?.stocks.length && (
                <div className="mt-4 text-center">
                  <p className="text-gray-400 text-sm">
                    Switch to the <strong>Accumulation Scanner</strong> tab to find stocks with smart money patterns first.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-500/20 backdrop-blur-md rounded-2xl p-6 border border-red-500/30">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-red-400" />
                <div>
                  <h3 className="text-lg font-semibold text-red-400">Error</h3>
                  <p className="text-red-300">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Screening Results */}
        {screeningResults && (
          <div className="max-w-6xl mx-auto mb-12">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Screening Results</h3>
                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    Screened {screeningResults.totalScreened} stocks
                  </div>
                  <div className="text-lg font-semibold text-emerald-400">
                    {screeningResults.candidatesFound} candidates found
                  </div>
                </div>
              </div>

              {screeningResults.stocks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg">
                    No stocks met your criteria. Try lowering the minimum score.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {screeningResults.stocks.map((stock, index) => (
                    <div key={stock.symbol} className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="bg-emerald-500/20 text-emerald-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-white">{stock.symbol}</h4>
                            <p className="text-gray-400 text-sm">{stock.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">
                            {formatPrice(stock.currentPrice)}
                          </div>
                          <div className={`text-lg font-semibold ${
                            stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {stock.change >= 0 ? (
                              <TrendingUp className="inline h-4 w-4 mr-1" />
                            ) : (
                              <TrendingDown className="inline h-4 w-4 mr-1" />
                            )}
                            {formatPercentage(stock.changePercent)}
                          </div>
                        </div>
                      </div>

                      {/* Trading Recommendation */}
                      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 mb-4 border border-blue-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getActionColor(stock.tradingRecommendation.action)}`}>
                              {stock.tradingRecommendation.action}
                            </span>
                            <span className="text-sm text-gray-400">{stock.tradingRecommendation.strategy}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-400">Confidence</div>
                            <div className={`text-sm font-bold ${getConfidenceColor(stock.tradingRecommendation.confidence)}`}>
                              {stock.tradingRecommendation.confidence}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Entry Price</div>
                            <div className="text-white font-semibold">{formatPrice(stock.tradingRecommendation.entryPrice)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Stop Loss</div>
                            <div className="text-red-400 font-semibold">{formatPrice(stock.tradingRecommendation.stopLoss)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Take Profit 1</div>
                            <div className="text-green-400 font-semibold">{formatPrice(stock.tradingRecommendation.takeProfit1)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 mb-1">R:R Ratio</div>
                            <div className="text-emerald-400 font-semibold">{stock.tradingRecommendation.riskRewardRatio.toFixed(2)}:1</div>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className="text-gray-400">Max Hold: {stock.tradingRecommendation.maxHoldingDays} days</span>
                          <span className="text-gray-400">Target 2: {formatPrice(stock.tradingRecommendation.takeProfit2)}</span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-xs text-gray-400 mb-1">Score</div>
                          <div className="text-lg font-bold text-emerald-400">{stock.score}/100</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-xs text-gray-400 mb-1">Volatility</div>
                          <div className="text-lg font-bold text-orange-400">{stock.volatility.toFixed(1)}%</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-xs text-gray-400 mb-1">Volume Ratio</div>
                          <div className="text-lg font-bold text-purple-400">{stock.volumeRatio.toFixed(1)}x</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-xs text-gray-400 mb-1">RSI</div>
                          <div className={`text-lg font-bold ${getRSIColor(stock.rsi || 50)}`}>
                            {(stock.rsi || 50).toFixed(1)}
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-sm text-gray-400 mb-2">Technical Signals</div>
                        <div className="flex flex-wrap gap-2">
                          {stock.technicalSignals.volumeSpike && (
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                              Volume Spike
                            </span>
                          )}
                          {stock.technicalSignals.oversold && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                              Oversold
                            </span>
                          )}
                          {stock.technicalSignals.overbought && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                              Overbought
                            </span>
                          )}
                          {stock.technicalSignals.breakoutCandidate && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                              Breakout Candidate
                            </span>
                          )}
                          {stock.technicalSignals.nearSupport && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                              Near Support
                            </span>
                          )}
                          {stock.technicalSignals.nearResistance && (
                            <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">
                              Near Resistance
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Fibonacci Levels */}
                      <div className="mb-4">
                        <div className="text-sm text-gray-400 mb-3">Fibonacci Levels</div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                            <div className="text-xs text-red-400 mb-2 font-semibold">Resistance Levels</div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-400">78.6%:</span>
                                <span className="text-red-300">{formatPrice(stock.fibonacci.resistance.level_786)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">61.8%:</span>
                                <span className="text-red-300">{formatPrice(stock.fibonacci.resistance.level_618)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">50.0%:</span>
                                <span className="text-red-300">{formatPrice(stock.fibonacci.resistance.level_500)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">38.2%:</span>
                                <span className="text-red-300">{formatPrice(stock.fibonacci.resistance.level_382)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">23.6%:</span>
                                <span className="text-red-300">{formatPrice(stock.fibonacci.resistance.level_236)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                            <div className="text-xs text-green-400 mb-2 font-semibold">Support Levels</div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-400">23.6%:</span>
                                <span className="text-green-300">{formatPrice(stock.fibonacci.support.level_236)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">38.2%:</span>
                                <span className="text-green-300">{formatPrice(stock.fibonacci.support.level_382)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">50.0%:</span>
                                <span className="text-green-300">{formatPrice(stock.fibonacci.support.level_500)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">61.8%:</span>
                                <span className="text-green-300">{formatPrice(stock.fibonacci.support.level_618)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">78.6%:</span>
                                <span className="text-green-300">{formatPrice(stock.fibonacci.support.level_786)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-400 text-center">
                          Range: {formatPrice(stock.fibonacci.swingLow)} - {formatPrice(stock.fibonacci.swingHigh)}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-400 mb-2">Analysis Reasoning</div>
                        <div className="space-y-1">
                          {stock.reasoning.map((reason, idx) => (
                            <div key={idx} className="text-sm text-gray-300 flex items-start">
                              <span className="text-emerald-400 mr-2">•</span>
                              {reason}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="text-sm text-gray-400 mb-2">Trading Strategy Reasoning</div>
                        <div className="space-y-1">
                          {stock.tradingRecommendation.reasoning.map((reason, idx) => (
                            <div key={idx} className="text-sm text-blue-300 flex items-start">
                              <span className="text-blue-400 mr-2">→</span>
                              {reason}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Accumulation Results */}
        {accumulationResults && (
          <div className="max-w-6xl mx-auto mb-12">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Accumulation Analysis Results</h3>
                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    Analyzed {accumulationResults.totalAnalyzed} stocks
                  </div>
                  <div className="text-lg font-semibold text-purple-400">
                    {accumulationResults.accumulationCandidates} accumulation candidates
                  </div>
                </div>
              </div>

              {accumulationResults.stocks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg">
                    No accumulation patterns found. Try lowering the minimum score.
                  </div>
                </div>
              ) : viewMode === 'table' ? (
                <div>
                  {/* Signal Legend */}
                  <div className="mb-4 p-4 bg-white/5 rounded-lg">
                    <div className="text-sm text-gray-400 mb-2">Signal Legend:</div>
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="text-gray-300">Volume Divergence</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-gray-300">Price Consolidation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-gray-300">Smart Money Flow</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-gray-300">Wyckoff Accumulation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                        <span className="text-gray-300">High Volume at Support</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left py-4 px-3 text-gray-300 font-semibold">#</th>
                        <th className="text-left py-4 px-3 text-gray-300 font-semibold">Symbol</th>
                        <th className="text-left py-4 px-3 text-gray-300 font-semibold">Name</th>
                        <th className="text-right py-4 px-3 text-gray-300 font-semibold">Price</th>
                        <th className="text-right py-4 px-3 text-gray-300 font-semibold">Change</th>
                        <th className="text-center py-4 px-3 text-gray-300 font-semibold">Score</th>
                        <th className="text-center py-4 px-3 text-gray-300 font-semibold">Days</th>
                        <th className="text-center py-4 px-3 text-gray-300 font-semibold">Vol Ratio</th>
                        <th className="text-center py-4 px-3 text-gray-300 font-semibold">OBV</th>
                        <th className="text-center py-4 px-3 text-gray-300 font-semibold">A/D</th>
                        <th className="text-center py-4 px-3 text-gray-300 font-semibold">Wyckoff</th>
                        <th className="text-center py-4 px-3 text-gray-300 font-semibold">Signals</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accumulationResults.stocks.map((stock, index) => (
                        <tr key={stock.symbol} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-3">
                            <div className="bg-purple-500/20 text-purple-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                          </td>
                          <td className="py-4 px-3">
                            <div className="font-bold text-white">{stock.symbol}</div>
                          </td>
                          <td className="py-4 px-3">
                            <div className="text-gray-300 max-w-xs truncate">{stock.name}</div>
                          </td>
                          <td className="py-4 px-3 text-right">
                            <div className="text-white font-semibold">{formatPrice(stock.currentPrice)}</div>
                          </td>
                          <td className="py-4 px-3 text-right">
                            <div className={`font-semibold ${
                              stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {stock.change >= 0 ? (
                                <TrendingUp className="inline h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="inline h-3 w-3 mr-1" />
                              )}
                              {formatPercentage(stock.changePercent)}
                            </div>
                          </td>
                          <td className="py-4 px-3 text-center">
                            <div className="text-purple-400 font-bold">{stock.accumulationScore}</div>
                          </td>
                          <td className="py-4 px-3 text-center">
                            <div className="text-indigo-400 font-semibold">{stock.timeframe.daysInConsolidation}</div>
                          </td>
                          <td className="py-4 px-3 text-center">
                            <div className="text-cyan-400 font-semibold">{stock.accumulationMetrics.volumeProfile.volumeRatio.toFixed(2)}x</div>
                          </td>
                          <td className="py-4 px-3 text-center">
                            <div className={`text-xs font-semibold ${
                              stock.accumulationMetrics.onBalanceVolume.trend === 'RISING' ? 'text-green-400' : 
                              stock.accumulationMetrics.onBalanceVolume.trend === 'FALLING' ? 'text-red-400' : 'text-yellow-400'
                            }`}>
                              {stock.accumulationMetrics.onBalanceVolume.trend}
                            </div>
                          </td>
                          <td className="py-4 px-3 text-center">
                            <div className={`text-xs font-semibold ${
                              stock.accumulationMetrics.accumulationDistribution.trend === 'ACCUMULATION' ? 'text-green-400' : 
                              stock.accumulationMetrics.accumulationDistribution.trend === 'DISTRIBUTION' ? 'text-red-400' : 'text-yellow-400'
                            }`}>
                              {stock.accumulationMetrics.accumulationDistribution.trend}
                            </div>
                          </td>
                          <td className="py-4 px-3 text-center">
                            <div className={`text-xs font-semibold ${
                              stock.accumulationMetrics.wyckoffPhase.phase === 'ACCUMULATION' ? 'text-green-400' : 'text-yellow-400'
                            }`}>
                              {stock.accumulationMetrics.wyckoffPhase.phase}
                            </div>
                          </td>
                          <td className="py-4 px-3 text-center">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {stock.accumulationSignals.volumeDivergence && (
                                <div className="w-2 h-2 bg-purple-400 rounded-full" title="Volume Divergence"></div>
                              )}
                              {stock.accumulationSignals.priceConsolidation && (
                                <div className="w-2 h-2 bg-blue-400 rounded-full" title="Price Consolidation"></div>
                              )}
                              {stock.accumulationSignals.smartMoneyFlow && (
                                <div className="w-2 h-2 bg-green-400 rounded-full" title="Smart Money Flow"></div>
                              )}
                              {stock.accumulationSignals.wyckoffAccumulation && (
                                <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Wyckoff Accumulation"></div>
                              )}
                              {stock.accumulationSignals.highVolumeAtSupport && (
                                <div className="w-2 h-2 bg-indigo-400 rounded-full" title="High Volume at Support"></div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                                         </tbody>
                   </table>
                 </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {accumulationResults.stocks.map((stock, index) => (
                    <div key={stock.symbol} className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl p-6 border border-purple-500/20">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="bg-purple-500/20 text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-white">{stock.symbol}</h4>
                            <p className="text-gray-400 text-sm">{stock.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">
                            {formatPrice(stock.currentPrice)}
                          </div>
                          <div className={`text-lg font-semibold ${
                            stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {stock.change >= 0 ? (
                              <TrendingUp className="inline h-4 w-4 mr-1" />
                            ) : (
                              <TrendingDown className="inline h-4 w-4 mr-1" />
                            )}
                            {formatPercentage(stock.changePercent)}
                          </div>
                        </div>
                      </div>

                      {/* Accumulation Score and Metrics */}
                      <div className="grid md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-xs text-gray-400 mb-1">Accumulation Score</div>
                          <div className="text-lg font-bold text-purple-400">{stock.accumulationScore}/100</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-xs text-gray-400 mb-1">Consolidation Days</div>
                          <div className="text-lg font-bold text-indigo-400">{stock.timeframe.daysInConsolidation}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-xs text-gray-400 mb-1">Volume Ratio</div>
                          <div className="text-lg font-bold text-cyan-400">{stock.accumulationMetrics.volumeProfile.volumeRatio.toFixed(2)}x</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-xs text-gray-400 mb-1">Wyckoff Phase</div>
                          <div className={`text-sm font-bold ${
                            stock.accumulationMetrics.wyckoffPhase.phase === 'ACCUMULATION' ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {stock.accumulationMetrics.wyckoffPhase.phase}
                          </div>
                        </div>
                      </div>

                      {/* Accumulation Signals */}
                      <div className="mb-4">
                        <div className="text-sm text-gray-400 mb-2">Accumulation Signals</div>
                        <div className="flex flex-wrap gap-2">
                          {stock.accumulationSignals.volumeDivergence && (
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                              Volume Divergence
                            </span>
                          )}
                          {stock.accumulationSignals.priceConsolidation && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                              Price Consolidation
                            </span>
                          )}
                          {stock.accumulationSignals.smartMoneyFlow && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                              Smart Money Flow
                            </span>
                          )}
                          {stock.accumulationSignals.wyckoffAccumulation && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                              Wyckoff Accumulation
                            </span>
                          )}
                          {stock.accumulationSignals.highVolumeAtSupport && (
                            <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs">
                              High Volume at Support
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Technical Metrics */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white/5 rounded-lg p-4">
                          <div className="text-sm text-gray-400 mb-3">Volume Analysis</div>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-400">OBV Trend:</span>
                              <span className={`font-semibold ${
                                stock.accumulationMetrics.onBalanceVolume.trend === 'RISING' ? 'text-green-400' : 
                                stock.accumulationMetrics.onBalanceVolume.trend === 'FALLING' ? 'text-red-400' : 'text-yellow-400'
                              }`}>
                                {stock.accumulationMetrics.onBalanceVolume.trend}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">A/D Line:</span>
                              <span className={`font-semibold ${
                                stock.accumulationMetrics.accumulationDistribution.trend === 'ACCUMULATION' ? 'text-green-400' : 
                                stock.accumulationMetrics.accumulationDistribution.trend === 'DISTRIBUTION' ? 'text-red-400' : 'text-yellow-400'
                              }`}>
                                {stock.accumulationMetrics.accumulationDistribution.trend}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">VPT Trend:</span>
                              <span className={`font-semibold ${
                                stock.accumulationMetrics.volumePriceTrend.trend === 'POSITIVE' ? 'text-green-400' : 
                                stock.accumulationMetrics.volumePriceTrend.trend === 'NEGATIVE' ? 'text-red-400' : 'text-yellow-400'
                              }`}>
                                {stock.accumulationMetrics.volumePriceTrend.trend}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <div className="text-sm text-gray-400 mb-3">Consolidation Analysis</div>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Range Tightness:</span>
                              <span className="text-white font-semibold">
                                {stock.accumulationMetrics.consolidation.rangeTightness.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Support Level:</span>
                              <span className="text-green-400 font-semibold">
                                {formatPrice(stock.accumulationMetrics.consolidation.supportLevel)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Resistance Level:</span>
                              <span className="text-red-400 font-semibold">
                                {formatPrice(stock.accumulationMetrics.consolidation.resistanceLevel)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Wyckoff Characteristics */}
                      {stock.accumulationMetrics.wyckoffPhase.characteristics.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm text-gray-400 mb-2">Wyckoff Characteristics</div>
                          <div className="space-y-1">
                            {stock.accumulationMetrics.wyckoffPhase.characteristics.map((characteristic, idx) => (
                              <div key={idx} className="text-sm text-yellow-300 flex items-start">
                                <span className="text-yellow-400 mr-2">•</span>
                                {characteristic}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Analysis Reasoning */}
                      <div>
                        <div className="text-sm text-gray-400 mb-2">Analysis Reasoning</div>
                        <div className="space-y-1">
                          {stock.reasoning.map((reason, idx) => (
                            <div key={idx} className="text-sm text-gray-300 flex items-start">
                              <span className="text-purple-400 mr-2">•</span>
                              {reason}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Investment Analysis Results */}
        {aiAnalysisResult && (
          <div className="max-w-6xl mx-auto mb-12">
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl p-8 border border-orange-500/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">AI Investment Recommendation</h3>
                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    Analyzed {aiAnalysisResult.stocksAnalyzed} accumulation candidates
                  </div>
                  <div className="text-lg font-semibold text-orange-400">
                    Confidence: {aiAnalysisResult.recommendation.confidence}%
                  </div>
                </div>
              </div>

              {/* Recommended Stock */}
              <div className="bg-white/10 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-2xl font-bold text-white">
                      {aiAnalysisResult.recommendation.recommendedStock.symbol}
                    </h4>
                    <p className="text-gray-300">{aiAnalysisResult.recommendation.recommendedStock.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">
                      €{aiAnalysisResult.recommendation.recommendedStock.currentPrice.toFixed(2)}
                    </div>
                    <div className="text-sm text-purple-400">
                      Score: {aiAnalysisResult.recommendation.recommendedStock.accumulationScore}/100
                    </div>
                  </div>
                </div>

                {/* Investment Strategy */}
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-xs text-gray-400 mb-1">Weekly Investment</div>
                    <div className="text-lg font-bold text-green-400">
                      €{aiAnalysisResult.recommendation.investmentStrategy.weeklyAmount}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-xs text-gray-400 mb-1">Shares per Week</div>
                    <div className="text-lg font-bold text-blue-400">
                      {aiAnalysisResult.recommendation.investmentStrategy.sharesPerWeek.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-xs text-gray-400 mb-1">Time Horizon</div>
                    <div className="text-lg font-bold text-yellow-400">
                      {aiAnalysisResult.recommendation.investmentStrategy.timeHorizon}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-xs text-gray-400 mb-1">Risk Level</div>
                    <div className={`text-lg font-bold ${
                      aiAnalysisResult.recommendation.investmentStrategy.riskLevel === 'LOW' ? 'text-green-400' :
                      aiAnalysisResult.recommendation.investmentStrategy.riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {aiAnalysisResult.recommendation.investmentStrategy.riskLevel}
                    </div>
                  </div>
                </div>

                {/* Reasoning Sections */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                    <h5 className="text-lg font-semibold text-green-400 mb-3">Why This Stock</h5>
                    <div className="space-y-2">
                      {aiAnalysisResult.recommendation.reasoning.whyThisStock.map((reason, idx) => (
                        <div key={idx} className="text-sm text-gray-300 flex items-start">
                          <span className="text-green-400 mr-2">•</span>
                          {reason}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                    <h5 className="text-lg font-semibold text-blue-400 mb-3">Market Analysis</h5>
                    <div className="space-y-2">
                      {aiAnalysisResult.recommendation.reasoning.marketAnalysis.map((analysis, idx) => (
                        <div key={idx} className="text-sm text-gray-300 flex items-start">
                          <span className="text-blue-400 mr-2">•</span>
                          {analysis}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
                    <h5 className="text-lg font-semibold text-red-400 mb-3">Risk Assessment</h5>
                    <div className="space-y-2">
                      {aiAnalysisResult.recommendation.reasoning.riskAssessment.map((risk, idx) => (
                        <div key={idx} className="text-sm text-gray-300 flex items-start">
                          <span className="text-red-400 mr-2">⚠</span>
                          {risk}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                    <h5 className="text-lg font-semibold text-purple-400 mb-3">Timeframe Predictions</h5>
                    <div className="space-y-2">
                      {aiAnalysisResult.recommendation.reasoning.timeframePrediction.map((prediction, idx) => (
                        <div key={idx} className="text-sm text-gray-300 flex items-start">
                          <span className="text-purple-400 mr-2">📈</span>
                          {prediction}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Alternative Options */}
              {aiAnalysisResult.recommendation.alternatives.length > 0 && (
                <div className="bg-white/5 rounded-xl p-6">
                  <h5 className="text-lg font-semibold text-white mb-4">Alternative Investment Options</h5>
                  <div className="space-y-3">
                    {aiAnalysisResult.recommendation.alternatives.map((alt, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h6 className="text-lg font-bold text-white">{alt.symbol}</h6>
                          <span className="text-sm text-gray-400">{alt.name}</span>
                        </div>
                        <p className="text-sm text-gray-300">{alt.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 text-center text-xs text-gray-400">
                Analysis generated on {new Date(aiAnalysisResult.recommendation.lastUpdated).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Indian Stocks Tab */}
        {activeTab === 'indian-stocks' && (
          <div className="max-w-6xl mx-auto mb-12">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-6 w-6 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">₹</span>
                </div>
                <h3 className="text-xl font-semibold text-white">Indian Stock Screener</h3>
                <div className="text-sm text-gray-400">NSE & BSE Markets</div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Minimum Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={indianMinScore}
                    onChange={(e) => setIndianMinScore(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Results
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={indianMaxResults}
                    onChange={(e) => setIndianMaxResults(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Exchange
                  </label>
                  <select
                    value={selectedExchange}
                    onChange={(e) => setSelectedExchange(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  >
                    <option value="">All Exchanges</option>
                    <option value="NSE">NSE</option>
                    <option value="BSE">BSE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sector
                  </label>
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  >
                    <option value="">All Sectors</option>
                    <option value="Banking">Banking</option>
                    <option value="Technology">Technology</option>
                    <option value="FMCG">FMCG</option>
                    <option value="Automobile">Automobile</option>
                    <option value="Pharma">Pharma</option>
                    <option value="Energy">Energy</option>
                    <option value="Steel">Steel</option>
                    <option value="Cement">Cement</option>
                    <option value="Telecom">Telecom</option>
                    <option value="Power">Power</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Min Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseFloat(e.target.value) || 10000)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
              </div>
              
              <button
                onClick={handleIndianStockScreen}
                disabled={isIndianStockScreening}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
              >
                {isIndianStockScreening ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Screening Indian Stocks...</span>
                  </div>
                ) : (
                  'Screen Indian Stocks'
                )}
              </button>
            </div>

            {/* Indian Stock Results */}
            {indianStockResults && (
              <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xl font-semibold text-white">
                    Indian Stock Results
                  </h4>
                  <div className="text-sm text-gray-400">
                    {indianStockResults.candidatesFound} of {indianStockResults.totalScreened} stocks found
                  </div>
                </div>

                <div className="grid gap-6">
                  {indianStockResults.stocks.map((stock, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h5 className="text-lg font-bold text-white">{stock.symbol}</h5>
                          <p className="text-gray-400">{stock.name}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                              {stock.exchange}
                            </span>
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                              {stock.sector}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">
                            {formatIndianPrice(stock.currentPrice)}
                          </div>
                          <div className={`text-sm font-semibold ${
                            stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {stock.change >= 0 ? (
                              <TrendingUp className="inline h-4 w-4 mr-1" />
                            ) : (
                              <TrendingDown className="inline h-4 w-4 mr-1" />
                            )}
                            {formatIndianPrice(Math.abs(stock.change))} ({formatPercentage(stock.changePercent)})
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Score: {stock.score}/100
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-gray-400">Market Cap</p>
                          <p className="text-white font-semibold">
                            ₹{(stock.marketCap / 10000000).toFixed(1)}Cr
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-gray-400">P/E Ratio</p>
                          <p className="text-white font-semibold">{stock.peRatio}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-gray-400">RSI</p>
                          <p className={`font-semibold ${getRSIColor(stock.rsi)}`}>
                            {stock.rsi.toFixed(1)}
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-gray-400">Dividend Yield</p>
                          <p className="text-white font-semibold">{stock.dividendYield}%</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-gray-400">52W High</p>
                          <p className="text-white font-semibold">
                            {formatIndianPrice(stock.fiftyTwoWeekHigh)}
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-gray-400">52W Low</p>
                          <p className="text-white font-semibold">
                            {formatIndianPrice(stock.fiftyTwoWeekLow)}
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-gray-400">Trend</p>
                          <p className={`font-semibold ${getTrendColor(stock.movingAverages.trend)}`}>
                            {stock.movingAverages.trend}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-2">Technical Signals</p>
                        <div className="flex flex-wrap gap-2">
                          {stock.technicalSignals.oversold && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                              Oversold
                            </span>
                          )}
                          {stock.technicalSignals.overbought && (
                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                              Overbought
                            </span>
                          )}
                          {stock.technicalSignals.volumeSpike && (
                            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                              Volume Spike
                            </span>
                          )}
                          {stock.technicalSignals.breakoutCandidate && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                              Breakout Candidate
                            </span>
                          )}
                          {stock.technicalSignals.nearSupport && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                              Near Support
                            </span>
                          )}
                          {stock.technicalSignals.nearResistance && (
                            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                              Near Resistance
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-400 mb-2">Analysis</p>
                        <div className="space-y-1">
                          {stock.reasoning.map((reason, idx) => (
                            <div key={idx} className="text-sm text-gray-300 flex items-start">
                              <span className="text-orange-400 mr-2">•</span>
                              {reason}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center text-xs text-gray-400">
                  Results generated on {new Date(indianStockResults.timestamp).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Crypto Whales Tab */}
        {activeTab === 'crypto-whales' && (
          <div className="max-w-7xl mx-auto mb-12">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-6 w-6 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">🐋</span>
                </div>
                <h3 className="text-xl font-semibold text-white">Crypto Whale Tracker</h3>
                <div className="text-sm text-gray-400">Multi-chain Big Money Flow Analysis</div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Blockchain
                  </label>
                  <select
                    value={selectedChain}
                    onChange={(e) => setSelectedChain(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  >
                    <option value="all">All Chains</option>
                    <option value="ethereum">Ethereum</option>
                    <option value="solana">Solana</option>
                    <option value="polygon">Polygon</option>
                    <option value="bsc">BSC</option>
                    <option value="avalanche">Avalanche</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Min Transaction Value ($)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    value={minWhaleValue}
                    onChange={(e) => setMinWhaleValue(parseInt(e.target.value) || 100000)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Results
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={whaleLimit}
                    onChange={(e) => setWhaleLimit(parseInt(e.target.value) || 50)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleCryptoWhaleTrack}
                    disabled={isCryptoWhaleTracking}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    {isCryptoWhaleTracking ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Tracking...</span>
                      </div>
                    ) : (
                      'Track Whales'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Crypto Whale Results */}
            {cryptoWhaleResults && (
              <div className="mt-8 space-y-8">
                {/* Analytics Overview */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Total Whales</h4>
                    <p className="text-3xl font-bold text-purple-400">{cryptoWhaleResults.analytics.totalWhales}</p>
                    <p className="text-sm text-gray-400">Active whale wallets</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Total Value</h4>
                    <p className="text-3xl font-bold text-blue-400">
                      ${(cryptoWhaleResults.analytics.totalValueTracked / 1000000000).toFixed(2)}B
                    </p>
                    <p className="text-sm text-gray-400">USD tracked</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Net Flow</h4>
                    <p className={`text-3xl font-bold ${cryptoWhaleResults.analytics.flowAnalysis.netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {cryptoWhaleResults.analytics.flowAnalysis.netFlow >= 0 ? '+' : ''}
                      ${(cryptoWhaleResults.analytics.flowAnalysis.netFlow / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-sm text-gray-400">24h flow</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Market Sentiment</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-green-400 h-2 rounded-full" 
                          style={{ width: `${cryptoWhaleResults.analytics.marketSentiment.bullish}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-green-400">{cryptoWhaleResults.analytics.marketSentiment.bullish}%</span>
                    </div>
                    <p className="text-sm text-gray-400">Bullish sentiment</p>
                  </div>
                </div>

                {/* Alerts */}
                {cryptoWhaleResults.alerts.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                    <h4 className="text-xl font-semibold text-white mb-6">🚨 Whale Alerts</h4>
                    <div className="space-y-4">
                      {cryptoWhaleResults.alerts.slice(0, 5).map((alert, index) => (
                        <div key={index} className={`p-4 rounded-xl border-l-4 ${
                          alert.severity === 'high' ? 'bg-red-500/20 border-red-400' :
                          alert.severity === 'medium' ? 'bg-yellow-500/20 border-yellow-400' :
                          'bg-blue-500/20 border-blue-400'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-medium px-2 py-1 rounded ${
                              alert.severity === 'high' ? 'bg-red-500/30 text-red-300' :
                              alert.severity === 'medium' ? 'bg-yellow-500/30 text-yellow-300' :
                              'bg-blue-500/30 text-blue-300'
                            }`}>
                              {alert.type.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-white">{alert.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Large Transactions */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                  <h4 className="text-xl font-semibold text-white mb-6">💰 Recent Whale Transactions</h4>
                  <div className="space-y-4">
                    {cryptoWhaleResults.recentTransactions.slice(0, 10).map((tx, index) => (
                      <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="flex items-center space-x-3">
                              <span className="text-lg font-bold text-white">{tx.token.symbol}</span>
                              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                                {tx.chain.toUpperCase()}
                              </span>
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                                {tx.type.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm mt-1">{tx.token.name}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                              ${(tx.valueUSD / 1000000).toFixed(2)}M
                            </div>
                            <div className="text-sm text-gray-400">
                              {tx.value.toFixed(2)} {tx.token.symbol}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">From:</p>
                            <p className="text-white font-mono text-xs">{tx.from.substring(0, 20)}...</p>
                          </div>
                          <div>
                            <p className="text-gray-400">To:</p>
                            <p className="text-white font-mono text-xs">{tx.to.substring(0, 20)}...</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                          <div className="flex items-center space-x-4 text-xs text-gray-400">
                            <span>Block: {tx.blockNumber}</span>
                            <span>Gas: {tx.gasUsed.toLocaleString()}</span>
                            <span>Score: {tx.whaleScore}/100</span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(tx.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Whale Wallets */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                  <h4 className="text-xl font-semibold text-white mb-6">🐋 Top Whale Wallets</h4>
                  <div className="space-y-4">
                    {cryptoWhaleResults.topWhales.slice(0, 5).map((whale, index) => (
                      <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="flex items-center space-x-3">
                              <span className="text-lg font-bold text-white">#{whale.whaleRank}</span>
                              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                                {whale.chain.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm font-mono">{whale.address.substring(0, 30)}...</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                              ${(whale.totalValueUSD / 1000000).toFixed(2)}M
                            </div>
                            <div className={`text-sm font-semibold ${
                              whale.profitLossPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {whale.profitLossPercentage >= 0 ? '+' : ''}{whale.profitLossPercentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          {whale.tokens.slice(0, 3).map((token, idx) => (
                            <div key={idx} className="bg-white/5 rounded-lg p-3">
                              <p className="text-xs text-gray-400">{token.symbol}</p>
                              <p className="text-white font-semibold">${(token.balanceUSD / 1000).toFixed(1)}K</p>
                              <p className="text-xs text-gray-400">{token.percentage.toFixed(1)}%</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Transactions: {whale.transactionCount.toLocaleString()}</span>
                          <span>Last Active: {new Date(whale.lastActive).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chain Distribution */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                  <h4 className="text-xl font-semibold text-white mb-6">⛓️ Chain Distribution</h4>
                  <div className="space-y-4">
                    {cryptoWhaleResults.analytics.chainDistribution.map((chain, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-white font-medium capitalize">{chain.chain}</span>
                          <div className="flex-1 bg-white/20 rounded-full h-2 w-32">
                            <div 
                              className="bg-purple-400 h-2 rounded-full" 
                              style={{ width: `${chain.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-white font-semibold">{chain.percentage}%</span>
                          <p className="text-xs text-gray-400">${(chain.value / 1000000).toFixed(1)}M</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 text-center text-xs text-gray-400">
                  Data updated: {new Date(cryptoWhaleResults.timestamp).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Financial Data Display */}
        {financialData && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">{financialData.symbol}</h3>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">
                    {formatPrice(financialData.currentPrice)}
                  </div>
                  <div className={`text-lg font-semibold ${
                    financialData.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {financialData.change >= 0 ? (
                      <TrendingUp className="inline h-5 w-5 mr-1" />
                    ) : (
                      <TrendingDown className="inline h-5 w-5 mr-1" />
                    )}
                    {formatPrice(Math.abs(financialData.change))} ({formatPercentage(financialData.changePercent)})
                  </div>
                </div>
              </div>

              {/* Technical Indicators */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Volume</h4>
                  <p className="text-xl font-bold text-white">
                    {financialData.volume.toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">RSI (14)</h4>
                  <p className={`text-xl font-bold ${getRSIColor(financialData.rsi)}`}>
                    {financialData.rsi.toFixed(2)} - {getRSILabel(financialData.rsi)}
                  </p>
                </div>
                
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Trend Analysis</h4>
                  <p className={`text-xl font-bold ${getTrendColor(financialData.movingAverages.trend)}`}>
                    {financialData.movingAverages.trend}
                  </p>
                  <p className="text-sm text-gray-400">
                    SMA20: {formatPrice(financialData.movingAverages.sma20)}
                  </p>
                </div>
              </div>

              {/* Moving Averages Details */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-white mb-4">Moving Averages</h4>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">Current Price</p>
                      <p className="text-white font-semibold text-lg">{formatPrice(financialData.currentPrice)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">SMA 20</p>
                      <p className={`font-semibold text-lg ${
                        financialData.currentPrice > financialData.movingAverages.sma20 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatPrice(financialData.movingAverages.sma20)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">SMA 50</p>
                      <p className={`font-semibold text-lg ${
                        financialData.currentPrice > financialData.movingAverages.sma50 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatPrice(financialData.movingAverages.sma50)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Price Action */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-white mb-4">Recent Price Action</h4>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {financialData.hourlyData.slice(0, 4).map((data, index) => (
                      <div key={index} className="text-center">
                        <p className="text-gray-400">{new Date(data.time).toLocaleTimeString()}</p>
                        <p className="text-white font-semibold">{formatPrice(data.close)}</p>
                        <p className="text-gray-300">Vol: {data.volume.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="h-8 w-8 text-emerald-400" />
              <h3 className="text-xl font-semibold text-white">Stock Analysis</h3>
            </div>
            <p className="text-gray-300">
              Advanced technical analysis of individual stocks with real-time data, RSI, moving averages, 
              and comprehensive market insights.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <Search className="h-8 w-8 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">Stock Screener</h3>
            </div>
            <p className="text-gray-300">
              AI-powered stock screening to identify stocks prone to 10%+ movements using volatility,
              volume spikes, RSI levels, and technical breakout patterns.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <Bitcoin className="h-8 w-8 text-indigo-400" />
              <h3 className="text-xl font-semibold text-white">Accumulation Scanner</h3>
            </div>
            <p className="text-gray-300">
              Detect smart money accumulation patterns using OBV, A/D Line, Wyckoff methodology,
              and volume profile analysis to find stocks being accumulated at lower prices.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <Brain className="h-8 w-8 text-orange-400" />
              <h3 className="text-xl font-semibold text-white">AI Investment Advisor</h3>
            </div>
            <p className="text-gray-300">
              GPT-4 powered investment recommendations for weekly €200 strategies. Get personalized
              stock picks with detailed reasoning, risk assessment, and alternative options.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-8 w-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">₹</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Indian Stocks</h3>
            </div>
            <p className="text-gray-300">
              Comprehensive screening of NSE & BSE listed stocks with technical analysis, 
              fundamental metrics, sector filtering, and detailed Indian market insights.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p className="mb-2">
              <strong className="text-red-400">Disclaimer:</strong> This application provides financial analysis for educational purposes only.
            </p>
            <p className="text-sm">
              Not financial advice. Always conduct your own research and consult with financial professionals before making investment decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
