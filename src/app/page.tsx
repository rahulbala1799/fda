'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Search, BarChart3, DollarSign, Bitcoin } from 'lucide-react';

export default function Home() {
  const [symbol, setSymbol] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!symbol.trim()) return;
    
    setIsAnalyzing(true);
    // TODO: Add API call here
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 3000);
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
                  placeholder="Enter stock symbol (e.g., TSLA, AAPL) or crypto pair (e.g., BTC/USD)"
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

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="h-8 w-8 text-emerald-400" />
              <h3 className="text-xl font-semibold text-white">Stock Analysis</h3>
            </div>
            <p className="text-gray-300">
              Advanced technical analysis of stocks with AI-powered insights on price movements, 
              support/resistance levels, and optimal trading strategies.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <Bitcoin className="h-8 w-8 text-orange-400" />
              <h3 className="text-xl font-semibold text-white">Crypto Insights</h3>
            </div>
            <p className="text-gray-300">
              Real-time cryptocurrency analysis including market sentiment, volatility patterns, 
              and strategic entry/exit recommendations.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="h-8 w-8 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">Smart Recommendations</h3>
            </div>
            <p className="text-gray-300">
              Get precise buy/sell price targets based on multiple timeframes, 
              technical indicators, and market conditions.
            </p>
          </div>
        </div>

        {/* Analysis Results Placeholder */}
        {isAnalyzing && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex items-center space-x-3 mb-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-400"></div>
              <h3 className="text-xl font-semibold text-white">Analyzing {symbol}...</h3>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-white/20 rounded animate-pulse"></div>
              <div className="h-4 bg-white/20 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-white/20 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p className="mb-2">
              <strong className="text-red-400">Disclaimer:</strong> This application provides AI-generated financial analysis for educational purposes only.
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
