'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Search, BarChart3, DollarSign, Bitcoin, AlertCircle } from 'lucide-react';

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

export default function Home() {
  const [symbol, setSymbol] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analyze' | 'screen'>('analyze');
  const [isScreening, setIsScreening] = useState(false);
  const [screeningResults, setScreeningResults] = useState<ScreeningResults | null>(null);
  const [minScore, setMinScore] = useState(50);
  const [maxResults, setMaxResults] = useState(10);

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
        <div className="max-w-4xl mx-auto mb-8">
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
        <div className="grid md:grid-cols-3 gap-8 mb-12">
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
              <BarChart3 className="h-8 w-8 text-orange-400" />
              <h3 className="text-xl font-semibold text-white">Technical Indicators</h3>
            </div>
            <p className="text-gray-300">
              Professional-grade technical analysis with RSI, moving averages, volume analysis,
              volatility metrics, and trend direction insights.
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
