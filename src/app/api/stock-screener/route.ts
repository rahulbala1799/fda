import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

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

    // Calculate Fibonacci levels
    const fibonacci = calculateFibonacciLevels(highs, lows, prices);

    // Generate trading recommendation
    const tradingRecommendation = generateTradingRecommendation(
      currentPrice,
      rsi,
      volatility,
      volumeRatio,
      fibonacci,
      technicalSignals,
      priceVsSMA20,
      priceVsSMA50
    );

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
      fibonacci,
      tradingRecommendation,
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

function calculateFibonacciLevels(highs: number[], lows: number[], prices: number[]): FibonacciLevels {
  // Find swing high and low over the last 20 periods
  const recentHighs = highs.slice(-20);
  const recentLows = lows.slice(-20);
  
  const swingHigh = Math.max(...recentHighs);
  const swingLow = Math.min(...recentLows);
  const range = swingHigh - swingLow;
  
  // Calculate Fibonacci retracement levels
  const fibLevels = [0.236, 0.382, 0.500, 0.618, 0.786];
  
  return {
    support: {
      level_236: swingHigh - (range * 0.236),
      level_382: swingHigh - (range * 0.382),
      level_500: swingHigh - (range * 0.500),
      level_618: swingHigh - (range * 0.618),
      level_786: swingHigh - (range * 0.786)
    },
    resistance: {
      level_236: swingLow + (range * 0.236),
      level_382: swingLow + (range * 0.382),
      level_500: swingLow + (range * 0.500),
      level_618: swingLow + (range * 0.618),
      level_786: swingLow + (range * 0.786)
    },
    swingHigh,
    swingLow
  };
}

function generateTradingRecommendation(
  currentPrice: number,
  rsi: number,
  volatility: number,
  volumeRatio: number,
  fibonacci: FibonacciLevels,
  technicalSignals: any,
  priceVsSMA20: number,
  priceVsSMA50: number
): TradingRecommendation {
  let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  let entryPrice = currentPrice;
  let stopLoss = currentPrice;
  let takeProfit1 = currentPrice;
  let takeProfit2 = currentPrice;
  let maxHoldingDays = 5;
  let confidence: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
  let strategy = 'Technical Analysis';
  const reasoning: string[] = [];

  // Determine action based on technical signals
  if (technicalSignals.oversold && priceVsSMA20 > -10) {
    action = 'BUY';
    entryPrice = Math.max(currentPrice * 0.99, fibonacci.support.level_618);
    stopLoss = Math.min(fibonacci.support.level_786, currentPrice * 0.95);
    takeProfit1 = Math.min(fibonacci.resistance.level_382, currentPrice * 1.08);
    takeProfit2 = Math.min(fibonacci.resistance.level_618, currentPrice * 1.15);
    maxHoldingDays = volatility > 4 ? 3 : 7;
    strategy = 'Oversold Bounce';
    reasoning.push('RSI oversold condition with price near Fibonacci support');
    reasoning.push('Entry near current price with stop below key Fibonacci level');
  } else if (technicalSignals.overbought && priceVsSMA20 < 10) {
    action = 'SELL';
    entryPrice = Math.min(currentPrice * 1.01, fibonacci.resistance.level_618);
    stopLoss = Math.max(fibonacci.resistance.level_786, currentPrice * 1.05);
    takeProfit1 = Math.max(fibonacci.support.level_382, currentPrice * 0.92);
    takeProfit2 = Math.max(fibonacci.support.level_618, currentPrice * 0.85);
    maxHoldingDays = volatility > 4 ? 3 : 7;
    strategy = 'Overbought Reversal';
    reasoning.push('RSI overbought condition with price near Fibonacci resistance');
    reasoning.push('Short entry with stop above key resistance level');
  } else if (technicalSignals.breakoutCandidate && volumeRatio > 2) {
    action = 'BUY';
    entryPrice = currentPrice * 1.005; // Slight premium for breakout
    stopLoss = Math.max(fibonacci.support.level_500, currentPrice * 0.96);
    takeProfit1 = currentPrice * 1.10;
    takeProfit2 = currentPrice * 1.18;
    maxHoldingDays = volatility > 5 ? 2 : 5;
    strategy = 'Volume Breakout';
    reasoning.push('High volume breakout with increased volatility');
    reasoning.push('Quick trade targeting 10%+ move within days');
  } else if (technicalSignals.nearSupport && rsi < 40) {
    action = 'BUY';
    entryPrice = Math.max(fibonacci.support.level_618, currentPrice * 0.995);
    stopLoss = Math.max(fibonacci.support.level_786, currentPrice * 0.94);
    takeProfit1 = fibonacci.resistance.level_382;
    takeProfit2 = fibonacci.resistance.level_618;
    maxHoldingDays = 10;
    strategy = 'Support Bounce';
    reasoning.push('Price near key support with RSI showing oversold conditions');
    reasoning.push('Conservative entry with Fibonacci-based targets');
  }

  // Calculate risk-reward ratio
  const risk = Math.abs(entryPrice - stopLoss);
  const reward = Math.abs(takeProfit1 - entryPrice);
  const riskRewardRatio = risk > 0 ? reward / risk : 0;

  // Adjust confidence based on multiple factors
  if (riskRewardRatio > 2 && volumeRatio > 1.5 && Math.abs(priceVsSMA20) < 5) {
    confidence = 'HIGH';
  } else if (riskRewardRatio > 1.5 && volumeRatio > 1.2) {
    confidence = 'MEDIUM';
  } else {
    confidence = 'LOW';
  }

  // Add risk-reward reasoning
  reasoning.push(`Risk-reward ratio: ${riskRewardRatio.toFixed(2)}:1`);
  reasoning.push(`Max holding period: ${maxHoldingDays} days based on volatility`);

  return {
    action,
    entryPrice,
    stopLoss,
    takeProfit1,
    takeProfit2,
    riskRewardRatio,
    maxHoldingDays,
    confidence,
    strategy,
    reasoning
  };
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