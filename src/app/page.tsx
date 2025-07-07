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
  macd: {
    macd: number;
    signal: number;
    histogram: number;
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

export default function Home() {
  const [symbol, setSymbol] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [error, setError] = useState<string | null>(null);

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

        {/* Search Section */}
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

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
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
                  <h4 className="text-sm font-medium text-gray-300 mb-2">MACD</h4>
                  <p className={`text-xl font-bold ${
                    financialData.macd.histogram >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {financialData.macd.macd.toFixed(4)}
                  </p>
                  <p className="text-sm text-gray-400">
                    Signal: {financialData.macd.signal.toFixed(4)}
                  </p>
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
              Advanced technical analysis of stocks with real-time data, RSI, MACD indicators, 
              and comprehensive market insights.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <Bitcoin className="h-8 w-8 text-orange-400" />
              <h3 className="text-xl font-semibold text-white">Crypto Insights</h3>
            </div>
            <p className="text-gray-300">
              Real-time cryptocurrency analysis with daily price movements, volume tracking,
              and market sentiment indicators.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="h-8 w-8 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">Technical Indicators</h3>
            </div>
            <p className="text-gray-300">
              Professional-grade technical analysis with RSI, MACD, volume analysis,
              and price action insights.
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
