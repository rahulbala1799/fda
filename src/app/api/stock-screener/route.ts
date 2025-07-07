import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

interface ScreeningCriteria {
  minVolume?: number;
  maxRSI?: number;
  minRSI?: number;
  volatilityThreshold?: number;
  priceRange?: {
    min: number;
    max: number;
  };
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
  score: number;
  reasoning: string[];
}

// Popular stocks to screen - you can expand this list
const STOCKS_TO_SCREEN = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC',
  'BABA', 'CRM', 'ORCL', 'ADBE', 'PYPL', 'UBER', 'LYFT', 'SNAP', 'TWTR', 'SPOT',
  'ZM', 'ROKU', 'SQ', 'SHOP', 'PINS', 'DOCU', 'ZOOM', 'PLTR', 'COIN', 'RBLX',
  'GME', 'AMC', 'BB', 'NOK', 'SPCE', 'PLUG', 'FCEL', 'RIOT', 'MARA', 'DKNG',
  'PENN', 'WYNN', 'MGM', 'LVS', 'NCLH', 'CCL', 'RCL', 'DAL', 'UAL', 'AAL'
];

async function getStockData(symbol: string): Promise<ScreenedStock | null> {
  try {
    // Get quote data
    const quote = await yahooFinance.quote(symbol);
    
    if (!quote || !quote.regularMarketPrice) {
      return null;
    }

    // Get historical data for technical analysis
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 60); // 60 days of data

    const historical = await yahooFinance.historical(symbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d'
    });

    if (!historical || historical.length < 20) {
      return null;
    }

    // Calculate technical indicators
    const prices = historical.map(h => h.close);
    const volumes = historical.map(h => h.volume);
    const highs = historical.map(h => h.high);
    const lows = historical.map(h => h.low);

    // Calculate moving averages
    const sma20 = calculateSMA(prices, 20);
    const sma50 = calculateSMA(prices, 50);
    
    // Calculate volatility (standard deviation of returns)
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    const volatility = calculateStandardDeviation(returns) * 100;

    // Calculate RSI
    const rsi = calculateRSI(prices, 14);

    // Calculate volume metrics
    const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    const currentVolume = quote.regularMarketVolume || 0;
    const volumeRatio = currentVolume / avgVolume;

    // Calculate price positions relative to MAs
    const currentPrice = quote.regularMarketPrice;
    const priceVsSMA20 = ((currentPrice - sma20) / sma20) * 100;
    const priceVsSMA50 = ((currentPrice - sma50) / sma50) * 100;

    // Technical signals
    const technicalSignals = {
      volumeSpike: volumeRatio > 2.0, // Volume is 2x normal
      nearSupport: priceVsSMA20 > -5 && priceVsSMA20 < 0, // Near but above SMA20
      nearResistance: priceVsSMA20 < 5 && priceVsSMA20 > 0, // Near but below resistance
      oversold: rsi < 30,
      overbought: rsi > 70,
      breakoutCandidate: volatility > 3 && volumeRatio > 1.5 // High volatility + volume
    };

    // Calculate score based on probability of 10% movement
    let score = 0;
    const reasoning: string[] = [];

    // High volatility increases chance of big moves
    if (volatility > 5) {
      score += 30;
      reasoning.push(`High volatility (${volatility.toFixed(1)}%) indicates potential for large price movements`);
    } else if (volatility > 3) {
      score += 20;
      reasoning.push(`Moderate volatility (${volatility.toFixed(1)}%) suggests active trading`);
    }

    // Volume analysis
    if (technicalSignals.volumeSpike) {
      score += 25;
      reasoning.push(`Volume spike (${volumeRatio.toFixed(1)}x normal) suggests institutional interest`);
    } else if (volumeRatio > 1.5) {
      score += 15;
      reasoning.push(`Above-average volume (${volumeRatio.toFixed(1)}x normal) indicates increased activity`);
    }

    // RSI analysis
    if (technicalSignals.oversold) {
      score += 20;
      reasoning.push(`Oversold RSI (${rsi.toFixed(1)}) suggests potential bounce`);
    } else if (technicalSignals.overbought) {
      score += 20;
      reasoning.push(`Overbought RSI (${rsi.toFixed(1)}) suggests potential pullback`);
    }

    // Moving average analysis
    if (technicalSignals.nearSupport || technicalSignals.nearResistance) {
      score += 15;
      reasoning.push(`Price near key moving average level - potential breakout or reversal`);
    }

    // Breakout candidate
    if (technicalSignals.breakoutCandidate) {
      score += 20;
      reasoning.push(`High volatility + volume spike = breakout candidate`);
    }

    // Price momentum
    const changePercent = quote.regularMarketChangePercent || 0;
    if (Math.abs(changePercent) > 3) {
      score += 15;
      reasoning.push(`Strong daily momentum (${changePercent.toFixed(1)}%) may continue`);
    }

    return {
      symbol,
      name: quote.longName || quote.shortName || symbol,
      currentPrice,
      change: quote.regularMarketChange || 0,
      changePercent,
      volume: currentVolume,
      avgVolume,
      volumeRatio,
      rsi,
      volatility,
      movingAverages: {
        sma20,
        sma50,
        priceVsSMA20,
        priceVsSMA50
      },
      technicalSignals,
      score,
      reasoning
    };

  } catch (error) {
    console.error(`Error screening ${symbol}:`, error);
    return null;
  }
}

function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];
  const slice = prices.slice(-period);
  return slice.reduce((sum, price) => sum + price, 0) / period;
}

function calculateRSI(prices: number[], period: number): number {
  if (prices.length < period + 1) return 50;

  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  const avgGain = gains.slice(-period).reduce((sum, gain) => sum + gain, 0) / period;
  const avgLoss = losses.slice(-period).reduce((sum, loss) => sum + loss, 0) / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const minScore = parseInt(searchParams.get('minScore') || '50');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sector = searchParams.get('sector');

    console.log('Starting stock screening...');
    
    // Screen stocks in batches to avoid rate limiting
    const screenedStocks: ScreenedStock[] = [];
    const batchSize = 5;
    
    for (let i = 0; i < STOCKS_TO_SCREEN.length; i += batchSize) {
      const batch = STOCKS_TO_SCREEN.slice(i, i + batchSize);
      const batchPromises = batch.map(symbol => getStockData(symbol));
      
      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(result => result !== null) as ScreenedStock[];
      
      screenedStocks.push(...validResults);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < STOCKS_TO_SCREEN.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Filter and sort results
    const filteredStocks = screenedStocks
      .filter(stock => stock.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    console.log(`Screened ${screenedStocks.length} stocks, found ${filteredStocks.length} candidates`);

    return NextResponse.json({
      success: true,
      totalScreened: screenedStocks.length,
      candidatesFound: filteredStocks.length,
      criteria: {
        minScore,
        limit,
        sector
      },
      stocks: filteredStocks,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Stock screening error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Stock screening failed',
        details: 'Please try again later'
      },
      { status: 500 }
    );
  }
} 