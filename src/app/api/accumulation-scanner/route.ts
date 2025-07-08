import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

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

// Comprehensive list of stocks for accumulation analysis (100+ stocks)
const ACCUMULATION_STOCKS = [
  // Large Cap Tech
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'NFLX', 'ADBE', 'CRM',
  'ORCL', 'INTC', 'AMD', 'QCOM', 'AVGO', 'TXN', 'MU', 'AMAT', 'LRCX', 'KLAC',
  
  // Growth Stocks
  'SHOP', 'ROKU', 'SQ', 'PLTR', 'SNOW', 'CRWD', 'ZS', 'DDOG', 'NET', 'OKTA',
  'TWLO', 'ZOOM', 'DOCU', 'WORK', 'TEAM', 'ATLASSIAN', 'SPLK', 'WDAY', 'VEEV', 'NOW',
  
  // Crypto-Related
  'COIN', 'RIOT', 'MARA', 'MSTR', 'BITF', 'HUT', 'CLSK', 'BTBT',
  
  // ETFs
  'SPY', 'QQQ', 'IWM', 'XLK', 'ARKK', 'ARKW', 'ARKG', 'VTI', 'VOO', 'VEA',
  
  // Traditional Value
  'BRK-B', 'JPM', 'BAC', 'WMT', 'JNJ', 'PG', 'KO', 'DIS', 'V', 'MA',
  'UNH', 'HD', 'PFE', 'ABBV', 'TMO', 'ABT', 'CVX', 'XOM', 'LLY', 'COST',
  
  // Financial Services
  'GS', 'MS', 'C', 'WFC', 'USB', 'PNC', 'TFC', 'COF', 'AXP', 'BLK',
  'SCHW', 'SPGI', 'ICE', 'CME', 'MCO', 'MSCI', 'PYPL', 'ADYEY',
  
  // Healthcare & Biotech
  'MRNA', 'BNTX', 'GILD', 'REGN', 'VRTX', 'BIIB', 'AMGN', 'CELG', 'BMY', 'MRK',
  'ISRG', 'DXCM', 'ILMN', 'INCY', 'ALXN', 'BMRN', 'TECH', 'SGEN', 'EXAS',
  
  // Consumer & Retail
  'AMZN', 'BABA', 'JD', 'PDD', 'MELI', 'SE', 'BKNG', 'ABNB', 'UBER', 'LYFT',
  'DASH', 'ETSY', 'EBAY', 'PINS', 'SNAP', 'TWTR', 'SPOT', 'NFLX', 'DIS',
  
  // Industrial & Energy
  'CAT', 'DE', 'BA', 'GE', 'HON', 'UPS', 'FDX', 'LMT', 'RTX', 'NOC',
  'TSLA', 'F', 'GM', 'RIVN', 'LCID', 'NIO', 'XPEV', 'LI', 'PLUG', 'FCEL',
  
  // Communication Services
  'GOOG', 'META', 'NFLX', 'DIS', 'CMCSA', 'VZ', 'T', 'TMUS', 'CHTR', 'DISH',
  
  // Emerging Growth & Meme Stocks
  'RBLX', 'U', 'DKNG', 'PENN', 'SOFI', 'AFRM', 'HOOD', 'WISH', 'CLOV', 'AMC',
  'GME', 'BB', 'NOK', 'PLBY', 'SPCE', 'NKLA', 'WKHS', 'RIDE', 'GOEV', 'HYLN',
  
  // Real Estate & REITs
  'REIT', 'AMT', 'PLD', 'CCI', 'EQIX', 'WELL', 'DLR', 'PSA', 'O', 'STOR',
  
  // Utilities & Commodities
  'NEE', 'DUK', 'SO', 'AEP', 'EXC', 'XEL', 'SRE', 'D', 'PCG', 'EIX',
  'GOLD', 'NEM', 'FCX', 'SCCO', 'AA', 'X', 'CLF', 'MT', 'VALE', 'RIO'
];

async function getAccumulationData(symbol: string): Promise<AccumulationStock | null> {
  try {
    // Get quote data
    const quote = await yahooFinance.quote(symbol);
    
    if (!quote || !quote.regularMarketPrice) {
      return null;
    }

    // Get historical data for accumulation analysis (90 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const historical = await yahooFinance.historical(symbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d'
    });

    if (!historical || historical.length < 30) {
      return null;
    }

    // Extract price and volume data
    const prices = historical.map(h => h.close);
    const volumes = historical.map(h => h.volume);
    const highs = historical.map(h => h.high);
    const lows = historical.map(h => h.low);
    const closes = historical.map(h => h.close);

    // Calculate accumulation metrics
    const accumulationMetrics = calculateAccumulationMetrics(
      prices, volumes, highs, lows, closes
    );

    // Calculate accumulation score
    let accumulationScore = 0;
    const reasoning: string[] = [];

    // Score based on OBV trend
    if (accumulationMetrics.onBalanceVolume.trend === 'RISING') {
      accumulationScore += 25;
      reasoning.push('On-Balance Volume showing rising trend indicates accumulation');
    }

    // Score based on A/D Line
    if (accumulationMetrics.accumulationDistribution.trend === 'ACCUMULATION') {
      accumulationScore += 20;
      reasoning.push(`Accumulation/Distribution Line shows ${accumulationMetrics.accumulationDistribution.strength.toFixed(1)} strength`);
    }

    // Score based on consolidation
    if (accumulationMetrics.consolidation.isConsolidating) {
      accumulationScore += 20;
      reasoning.push(`Price consolidating for ${accumulationMetrics.consolidation.duration} days with ${accumulationMetrics.consolidation.rangeTightness.toFixed(1)}% range`);
    }

    // Score based on Wyckoff phase
    if (accumulationMetrics.wyckoffPhase.phase === 'ACCUMULATION') {
      accumulationScore += 25;
      reasoning.push(`Wyckoff analysis indicates ${accumulationMetrics.wyckoffPhase.phase} phase with ${accumulationMetrics.wyckoffPhase.confidence.toFixed(0)}% confidence`);
    }

    // Score based on volume profile
    if (accumulationMetrics.volumeProfile.highVolumeAtLows) {
      accumulationScore += 15;
      reasoning.push(`High volume at lower prices (${accumulationMetrics.volumeProfile.volumeRatio.toFixed(1)}x ratio)`);
    }

    // Score based on OBV divergence
    if (accumulationMetrics.onBalanceVolume.divergence) {
      accumulationScore += 10;
      reasoning.push('Positive divergence between price and volume flow');
    }

    // Determine accumulation signals
    const accumulationSignals = {
      volumeDivergence: accumulationMetrics.onBalanceVolume.divergence,
      priceConsolidation: accumulationMetrics.consolidation.isConsolidating,
      smartMoneyFlow: accumulationMetrics.accumulationDistribution.trend === 'ACCUMULATION',
      wyckoffAccumulation: accumulationMetrics.wyckoffPhase.phase === 'ACCUMULATION',
      highVolumeAtSupport: accumulationMetrics.volumeProfile.highVolumeAtLows
    };

    // Calculate consolidation timeframe
    const consolidationStart = accumulationMetrics.consolidation.duration > 0 
      ? new Date(Date.now() - accumulationMetrics.consolidation.duration * 24 * 60 * 60 * 1000).toISOString()
      : new Date().toISOString();

    return {
      symbol,
      name: quote.longName || quote.shortName || symbol,
      currentPrice: quote.regularMarketPrice,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      volume: quote.regularMarketVolume || 0,
      avgVolume: volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length,
      accumulationMetrics,
      accumulationScore,
      accumulationSignals,
      timeframe: {
        consolidationStart,
        daysInConsolidation: accumulationMetrics.consolidation.duration
      },
      reasoning
    };

  } catch (error) {
    console.error(`Error analyzing accumulation for ${symbol}:`, error);
    return null;
  }
}

function calculateAccumulationMetrics(
  prices: number[],
  volumes: number[],
  highs: number[],
  lows: number[],
  closes: number[]
): AccumulationMetrics {
  
  // Calculate On-Balance Volume (OBV)
  const obv = calculateOBV(closes, volumes);
  const obvTrend = determineOBVTrend(obv);
  const obvDivergence = detectOBVDivergence(closes, obv);

  // Calculate Accumulation/Distribution Line
  const adLine = calculateADLine(highs, lows, closes, volumes);
  const adTrend = determineADTrend(adLine);

  // Calculate Volume Price Trend (VPT)
  const vpt = calculateVPT(closes, volumes);
  const vptTrend = determineVPTTrend(vpt);

  // Detect consolidation
  const consolidation = detectConsolidation(prices, highs, lows);

  // Analyze Wyckoff phase
  const wyckoffPhase = analyzeWyckoffPhase(prices, volumes, highs, lows);

  // Analyze volume profile
  const volumeProfile = analyzeVolumeProfile(prices, volumes, highs, lows);

  return {
    onBalanceVolume: {
      current: obv[obv.length - 1],
      trend: obvTrend,
      divergence: obvDivergence
    },
    accumulationDistribution: {
      current: adLine[adLine.length - 1],
      trend: adTrend.trend,
      strength: adTrend.strength
    },
    volumePriceTrend: {
      current: vpt[vpt.length - 1],
      trend: vptTrend
    },
    consolidation,
    wyckoffPhase,
    volumeProfile
  };
}

function calculateOBV(closes: number[], volumes: number[]): number[] {
  const obv: number[] = [volumes[0]];
  
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > closes[i - 1]) {
      obv.push(obv[i - 1] + volumes[i]);
    } else if (closes[i] < closes[i - 1]) {
      obv.push(obv[i - 1] - volumes[i]);
    } else {
      obv.push(obv[i - 1]);
    }
  }
  
  return obv;
}

function determineOBVTrend(obv: number[]): 'RISING' | 'FALLING' | 'NEUTRAL' {
  const recent = obv.slice(-10);
  const older = obv.slice(-20, -10);
  
  const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
  const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
  
  const change = (recentAvg - olderAvg) / olderAvg;
  
  if (change > 0.05) return 'RISING';
  if (change < -0.05) return 'FALLING';
  return 'NEUTRAL';
}

function detectOBVDivergence(prices: number[], obv: number[]): boolean {
  const priceChange = (prices[prices.length - 1] - prices[prices.length - 20]) / prices[prices.length - 20];
  const obvChange = (obv[obv.length - 1] - obv[obv.length - 20]) / Math.abs(obv[obv.length - 20]);
  
  // Positive divergence: price falling but OBV rising
  return priceChange < -0.02 && obvChange > 0.02;
}

function calculateADLine(highs: number[], lows: number[], closes: number[], volumes: number[]): number[] {
  const adLine: number[] = [];
  let cumulative = 0;
  
  for (let i = 0; i < closes.length; i++) {
    const clv = ((closes[i] - lows[i]) - (highs[i] - closes[i])) / (highs[i] - lows[i]);
    const moneyFlowVolume = clv * volumes[i];
    cumulative += moneyFlowVolume;
    adLine.push(cumulative);
  }
  
  return adLine;
}

function determineADTrend(adLine: number[]): { trend: 'ACCUMULATION' | 'DISTRIBUTION' | 'NEUTRAL', strength: number } {
  const recent = adLine.slice(-10);
  const older = adLine.slice(-20, -10);
  
  const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
  const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
  
  const change = (recentAvg - olderAvg) / Math.abs(olderAvg);
  const strength = Math.abs(change) * 100;
  
  if (change > 0.03) return { trend: 'ACCUMULATION', strength };
  if (change < -0.03) return { trend: 'DISTRIBUTION', strength };
  return { trend: 'NEUTRAL', strength };
}

function calculateVPT(closes: number[], volumes: number[]): number[] {
  const vpt: number[] = [0];
  
  for (let i = 1; i < closes.length; i++) {
    const priceChange = (closes[i] - closes[i - 1]) / closes[i - 1];
    vpt.push(vpt[i - 1] + volumes[i] * priceChange);
  }
  
  return vpt;
}

function determineVPTTrend(vpt: number[]): 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' {
  const recent = vpt.slice(-5);
  const slope = (recent[recent.length - 1] - recent[0]) / recent.length;
  
  if (slope > 0) return 'POSITIVE';
  if (slope < 0) return 'NEGATIVE';
  return 'NEUTRAL';
}

function detectConsolidation(prices: number[], highs: number[], lows: number[]): {
  isConsolidating: boolean;
  rangeTightness: number;
  duration: number;
  supportLevel: number;
  resistanceLevel: number;
} {
  const recentPeriod = 20;
  const recentHighs = highs.slice(-recentPeriod);
  const recentLows = lows.slice(-recentPeriod);
  
  const highestHigh = Math.max(...recentHighs);
  const lowestLow = Math.min(...recentLows);
  const range = highestHigh - lowestLow;
  const rangeTightness = (range / lowestLow) * 100;
  
  // Consolidation if range is less than 15% over 20 days
  const isConsolidating = rangeTightness < 15;
  
  // Count consecutive days in range
  let duration = 0;
  for (let i = prices.length - 1; i >= 0; i--) {
    if (prices[i] >= lowestLow * 0.95 && prices[i] <= highestHigh * 1.05) {
      duration++;
    } else {
      break;
    }
  }
  
  return {
    isConsolidating,
    rangeTightness,
    duration,
    supportLevel: lowestLow,
    resistanceLevel: highestHigh
  };
}

function analyzeWyckoffPhase(prices: number[], volumes: number[], highs: number[], lows: number[]): {
  phase: 'ACCUMULATION' | 'MARKUP' | 'DISTRIBUTION' | 'MARKDOWN' | 'UNKNOWN';
  confidence: number;
  characteristics: string[];
} {
  const characteristics: string[] = [];
  let accumulationScore = 0;
  
  // Check for declining volume on down moves
  const recentPeriod = 20;
  const recentPrices = prices.slice(-recentPeriod);
  const recentVolumes = volumes.slice(-recentPeriod);
  
  let downDaysLowVolume = 0;
  let upDaysHighVolume = 0;
  
  for (let i = 1; i < recentPrices.length; i++) {
    if (recentPrices[i] < recentPrices[i - 1] && recentVolumes[i] < recentVolumes[i - 1]) {
      downDaysLowVolume++;
    }
    if (recentPrices[i] > recentPrices[i - 1] && recentVolumes[i] > recentVolumes[i - 1]) {
      upDaysHighVolume++;
    }
  }
  
  if (downDaysLowVolume > recentPeriod * 0.3) {
    accumulationScore += 30;
    characteristics.push('Declining volume on down moves');
  }
  
  if (upDaysHighVolume > recentPeriod * 0.2) {
    accumulationScore += 20;
    characteristics.push('Higher volume on up moves');
  }
  
  // Check for price stability with volume increase
  const priceStability = Math.abs(prices[prices.length - 1] - prices[prices.length - 10]) / prices[prices.length - 10];
  const volumeIncrease = volumes.slice(-10).reduce((sum, v) => sum + v, 0) / volumes.slice(-20, -10).reduce((sum, v) => sum + v, 0);
  
  if (priceStability < 0.05 && volumeIncrease > 1.1) {
    accumulationScore += 25;
    characteristics.push('Price stability with volume increase');
  }
  
  // Check for spring pattern (false breakdown)
  const lowestLow = Math.min(...lows.slice(-30));
  const recentLow = Math.min(...lows.slice(-5));
  
  if (recentLow <= lowestLow * 1.02 && prices[prices.length - 1] > lowestLow * 1.05) {
    accumulationScore += 25;
    characteristics.push('Spring pattern detected');
  }
  
  let phase: 'ACCUMULATION' | 'MARKUP' | 'DISTRIBUTION' | 'MARKDOWN' | 'UNKNOWN' = 'UNKNOWN';
  
  if (accumulationScore >= 70) {
    phase = 'ACCUMULATION';
  } else if (accumulationScore >= 40) {
    phase = 'ACCUMULATION';
  }
  
  return {
    phase,
    confidence: accumulationScore,
    characteristics
  };
}

function analyzeVolumeProfile(prices: number[], volumes: number[], highs: number[], lows: number[]): {
  highVolumeAtLows: boolean;
  averageVolumeAtLows: number;
  averageVolumeAtHighs: number;
  volumeRatio: number;
} {
  const recentPeriod = 30;
  const recentPrices = prices.slice(-recentPeriod);
  const recentVolumes = volumes.slice(-recentPeriod);
  
  // Find price quartiles
  const sortedPrices = [...recentPrices].sort((a, b) => a - b);
  const q1 = sortedPrices[Math.floor(sortedPrices.length * 0.25)];
  const q3 = sortedPrices[Math.floor(sortedPrices.length * 0.75)];
  
  // Calculate average volume at different price levels
  let volumeAtLows = 0;
  let volumeAtHighs = 0;
  let lowCount = 0;
  let highCount = 0;
  
  for (let i = 0; i < recentPrices.length; i++) {
    if (recentPrices[i] <= q1) {
      volumeAtLows += recentVolumes[i];
      lowCount++;
    } else if (recentPrices[i] >= q3) {
      volumeAtHighs += recentVolumes[i];
      highCount++;
    }
  }
  
  const averageVolumeAtLows = lowCount > 0 ? volumeAtLows / lowCount : 0;
  const averageVolumeAtHighs = highCount > 0 ? volumeAtHighs / highCount : 1;
  const volumeRatio = averageVolumeAtLows / averageVolumeAtHighs;
  
  return {
    highVolumeAtLows: volumeRatio > 1.2,
    averageVolumeAtLows,
    averageVolumeAtHighs,
    volumeRatio
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const minScore = parseInt(searchParams.get('minScore') || '60');
    const limit = parseInt(searchParams.get('limit') || '15');
    const includeETFs = searchParams.get('includeETFs') === 'true';

    console.log('Starting accumulation analysis...');
    
    // Filter stocks based on preferences
    let stocksToAnalyze = ACCUMULATION_STOCKS;
    if (!includeETFs) {
      stocksToAnalyze = stocksToAnalyze.filter(symbol => !['SPY', 'QQQ', 'IWM', 'XLK', 'ARKK'].includes(symbol));
    }
    
    // Analyze stocks in batches
    const accumulationStocks: AccumulationStock[] = [];
    const batchSize = 4;
    
    for (let i = 0; i < stocksToAnalyze.length; i += batchSize) {
      const batch = stocksToAnalyze.slice(i, i + batchSize);
      const batchPromises = batch.map(symbol => getAccumulationData(symbol));
      
      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(result => result !== null) as AccumulationStock[];
      
      accumulationStocks.push(...validResults);
      
      // Add delay between batches
      if (i + batchSize < stocksToAnalyze.length) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    // Filter and sort results
    const filteredStocks = accumulationStocks
      .filter(stock => stock.accumulationScore >= minScore)
      .sort((a, b) => b.accumulationScore - a.accumulationScore)
      .slice(0, limit);

    console.log(`Analyzed ${accumulationStocks.length} stocks, found ${filteredStocks.length} accumulation candidates`);

    return NextResponse.json({
      success: true,
      totalAnalyzed: accumulationStocks.length,
      accumulationCandidates: filteredStocks.length,
      criteria: {
        minScore,
        limit,
        includeETFs
      },
      stocks: filteredStocks,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Accumulation analysis error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Accumulation analysis failed',
        details: 'Please try again later'
      },
      { status: 500 }
    );
  }
} 