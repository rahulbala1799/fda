import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

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

// Popular Indian stocks for screening
const INDIAN_STOCKS = [
  // Nifty 50 stocks
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd', sector: 'Energy', exchange: 'NSE' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services Ltd', sector: 'Technology', exchange: 'NSE' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd', sector: 'Banking', exchange: 'NSE' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd', sector: 'Banking', exchange: 'NSE' },
  { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever Ltd', sector: 'FMCG', exchange: 'NSE' },
  { symbol: 'INFY.NS', name: 'Infosys Ltd', sector: 'Technology', exchange: 'NSE' },
  { symbol: 'ITC.NS', name: 'ITC Ltd', sector: 'FMCG', exchange: 'NSE' },
  { symbol: 'SBIN.NS', name: 'State Bank of India', sector: 'Banking', exchange: 'NSE' },
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd', sector: 'Telecom', exchange: 'NSE' },
  { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank Ltd', sector: 'Banking', exchange: 'NSE' },
  { symbol: 'LT.NS', name: 'Larsen & Toubro Ltd', sector: 'Construction', exchange: 'NSE' },
  { symbol: 'AXISBANK.NS', name: 'Axis Bank Ltd', sector: 'Banking', exchange: 'NSE' },
  { symbol: 'HCLTECH.NS', name: 'HCL Technologies Ltd', sector: 'Technology', exchange: 'NSE' },
  { symbol: 'WIPRO.NS', name: 'Wipro Ltd', sector: 'Technology', exchange: 'NSE' },
  { symbol: 'ASIANPAINT.NS', name: 'Asian Paints Ltd', sector: 'Paints', exchange: 'NSE' },
  { symbol: 'MARUTI.NS', name: 'Maruti Suzuki India Ltd', sector: 'Automobile', exchange: 'NSE' },
  { symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical Industries Ltd', sector: 'Pharma', exchange: 'NSE' },
  { symbol: 'TITAN.NS', name: 'Titan Company Ltd', sector: 'Jewellery', exchange: 'NSE' },
  { symbol: 'NTPC.NS', name: 'NTPC Ltd', sector: 'Power', exchange: 'NSE' },
  { symbol: 'TECHM.NS', name: 'Tech Mahindra Ltd', sector: 'Technology', exchange: 'NSE' },
  { symbol: 'NESTLEIND.NS', name: 'Nestle India Ltd', sector: 'FMCG', exchange: 'NSE' },
  { symbol: 'ULTRACEMCO.NS', name: 'UltraTech Cement Ltd', sector: 'Cement', exchange: 'NSE' },
  { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance Ltd', sector: 'NBFC', exchange: 'NSE' },
  { symbol: 'JSWSTEEL.NS', name: 'JSW Steel Ltd', sector: 'Steel', exchange: 'NSE' },
  { symbol: 'TATACONSUM.NS', name: 'Tata Consumer Products Ltd', sector: 'FMCG', exchange: 'NSE' },
  { symbol: 'BAJAJFINSV.NS', name: 'Bajaj Finserv Ltd', sector: 'Financial Services', exchange: 'NSE' },
  { symbol: 'POWERGRID.NS', name: 'Power Grid Corporation of India Ltd', sector: 'Power', exchange: 'NSE' },
  { symbol: 'ONGC.NS', name: 'Oil & Natural Gas Corporation Ltd', sector: 'Oil & Gas', exchange: 'NSE' },
  { symbol: 'DRREDDY.NS', name: 'Dr. Reddys Laboratories Ltd', sector: 'Pharma', exchange: 'NSE' },
  { symbol: 'EICHERMOT.NS', name: 'Eicher Motors Ltd', sector: 'Automobile', exchange: 'NSE' },
  { symbol: 'TATASTEEL.NS', name: 'Tata Steel Ltd', sector: 'Steel', exchange: 'NSE' },
  { symbol: 'BPCL.NS', name: 'Bharat Petroleum Corporation Ltd', sector: 'Oil & Gas', exchange: 'NSE' },
  { symbol: 'CIPLA.NS', name: 'Cipla Ltd', sector: 'Pharma', exchange: 'NSE' },
  { symbol: 'COALINDIA.NS', name: 'Coal India Ltd', sector: 'Mining', exchange: 'NSE' },
  { symbol: 'GRASIM.NS', name: 'Grasim Industries Ltd', sector: 'Cement', exchange: 'NSE' },
  { symbol: 'HEROMOTOCO.NS', name: 'Hero MotoCorp Ltd', sector: 'Automobile', exchange: 'NSE' },
  { symbol: 'BRITANNIA.NS', name: 'Britannia Industries Ltd', sector: 'FMCG', exchange: 'NSE' },
  { symbol: 'DIVISLAB.NS', name: 'Divis Laboratories Ltd', sector: 'Pharma', exchange: 'NSE' },
  { symbol: 'ADANIPORTS.NS', name: 'Adani Ports and Special Economic Zone Ltd', sector: 'Infrastructure', exchange: 'NSE' },
  { symbol: 'INDUSINDBK.NS', name: 'IndusInd Bank Ltd', sector: 'Banking', exchange: 'NSE' },
  { symbol: 'APOLLOHOSP.NS', name: 'Apollo Hospitals Enterprise Ltd', sector: 'Healthcare', exchange: 'NSE' },
  { symbol: 'HINDALCO.NS', name: 'Hindalco Industries Ltd', sector: 'Metals', exchange: 'NSE' },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors Ltd', sector: 'Automobile', exchange: 'NSE' },
  { symbol: 'SHREECEM.NS', name: 'Shree Cement Ltd', sector: 'Cement', exchange: 'NSE' },
  { symbol: 'VEDL.NS', name: 'Vedanta Ltd', sector: 'Metals', exchange: 'NSE' },
  { symbol: 'TATAPOWER.NS', name: 'Tata Power Company Ltd', sector: 'Power', exchange: 'NSE' },
  { symbol: 'ADANIENT.NS', name: 'Adani Enterprises Ltd', sector: 'Infrastructure', exchange: 'NSE' },
  { symbol: 'GODREJCP.NS', name: 'Godrej Consumer Products Ltd', sector: 'FMCG', exchange: 'NSE' },
  { symbol: 'DABUR.NS', name: 'Dabur India Ltd', sector: 'FMCG', exchange: 'NSE' },
  { symbol: 'MARICO.NS', name: 'Marico Ltd', sector: 'FMCG', exchange: 'NSE' },
  { symbol: 'BANKBARODA.NS', name: 'Bank of Baroda', sector: 'Banking', exchange: 'NSE' },
];

// Helper function to add delay between API calls
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Calculate technical indicators
function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  
  const slice = prices.slice(0, period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / period;
}

// Mock function to simulate fetching Indian stock data
async function fetchIndianStockData(stockInfo: any): Promise<IndianStock | null> {
  try {
    // Simulate API delay
    await delay(100);
    
    // Generate realistic mock data for Indian stocks
    const basePrice = Math.random() * 2000 + 100; // ₹100 to ₹2100
    const change = (Math.random() - 0.5) * 100; // -₹50 to +₹50
    const changePercent = (change / basePrice) * 100;
    
    // Generate historical prices for technical analysis
    const historicalPrices = [];
    let price = basePrice;
    for (let i = 0; i < 50; i++) {
      price += (Math.random() - 0.5) * 20;
      historicalPrices.push(Math.max(price, 10));
    }
    
    const volume = Math.floor(Math.random() * 10000000) + 100000; // 100K to 10M
    const avgVolume = volume * (0.8 + Math.random() * 0.4); // ±20% variation
    
    const rsi = calculateRSI(historicalPrices);
    const sma20 = calculateSMA(historicalPrices, 20);
    const sma50 = calculateSMA(historicalPrices, 50);
    const sma200 = calculateSMA(historicalPrices, 200);
    
    // Technical signals
    const oversold = rsi < 30;
    const overbought = rsi > 70;
    const volumeSpike = volume > avgVolume * 1.5;
    const nearSupport = Math.random() > 0.7;
    const nearResistance = Math.random() > 0.7;
    const breakoutCandidate = Math.random() > 0.8;
    
    // Determine trend
    let trend = 'Neutral';
    if (basePrice > sma20 && sma20 > sma50) {
      trend = 'Bullish';
    } else if (basePrice < sma20 && sma20 < sma50) {
      trend = 'Bearish';
    }
    
    // Calculate score based on various factors
    let score = 50;
    if (oversold) score += 15;
    if (overbought) score -= 15;
    if (volumeSpike) score += 10;
    if (trend === 'Bullish') score += 10;
    if (trend === 'Bearish') score -= 10;
    if (breakoutCandidate) score += 20;
    if (nearSupport) score += 5;
    if (nearResistance) score -= 5;
    
    score = Math.max(0, Math.min(100, score));
    
    // Generate reasoning
    const reasoning = [];
    if (oversold) reasoning.push('RSI indicates oversold conditions');
    if (overbought) reasoning.push('RSI indicates overbought conditions');
    if (volumeSpike) reasoning.push('Above average volume spike detected');
    if (trend === 'Bullish') reasoning.push('Price above moving averages - bullish trend');
    if (trend === 'Bearish') reasoning.push('Price below moving averages - bearish trend');
    if (breakoutCandidate) reasoning.push('Technical patterns suggest potential breakout');
    
    const stock: IndianStock = {
      symbol: stockInfo.symbol,
      name: stockInfo.name,
      exchange: stockInfo.exchange as 'NSE' | 'BSE',
      currentPrice: parseFloat(basePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: volume,
      avgVolume: Math.floor(avgVolume),
      marketCap: Math.floor(basePrice * (Math.random() * 1000000000 + 100000000)), // 100M to 1B shares
      peRatio: parseFloat((Math.random() * 50 + 5).toFixed(2)),
      pbRatio: parseFloat((Math.random() * 5 + 0.5).toFixed(2)),
      dividendYield: parseFloat((Math.random() * 5).toFixed(2)),
      sector: stockInfo.sector,
      industry: stockInfo.sector,
      fiftyTwoWeekHigh: parseFloat((basePrice * (1 + Math.random() * 0.5)).toFixed(2)),
      fiftyTwoWeekLow: parseFloat((basePrice * (0.5 + Math.random() * 0.3)).toFixed(2)),
      rsi: parseFloat(rsi.toFixed(2)),
      movingAverages: {
        sma20: parseFloat(sma20.toFixed(2)),
        sma50: parseFloat(sma50.toFixed(2)),
        sma200: parseFloat(sma200.toFixed(2)),
        trend
      },
      technicalSignals: {
        nearSupport,
        nearResistance,
        oversold,
        overbought,
        breakoutCandidate,
        volumeSpike
      },
      fundamentals: {
        revenue: Math.floor(Math.random() * 100000000000 + 1000000000), // 1B to 100B
        netIncome: Math.floor(Math.random() * 10000000000 + 100000000), // 100M to 10B
        eps: parseFloat((Math.random() * 100 + 1).toFixed(2)),
        bookValue: parseFloat((Math.random() * 1000 + 50).toFixed(2)),
        roe: parseFloat((Math.random() * 30 + 5).toFixed(2)),
        debt: Math.floor(Math.random() * 50000000000 + 1000000000) // 1B to 50B
      },
      score: Math.floor(score),
      reasoning
    };
    
    return stock;
  } catch (error) {
    console.error(`Error fetching data for ${stockInfo.symbol}:`, error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const minScore = parseInt(searchParams.get('minScore') || '60');
    const limit = parseInt(searchParams.get('limit') || '20');
    const exchange = searchParams.get('exchange');
    const sector = searchParams.get('sector');
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '10000');
    
    console.log('Screening Indian stocks with criteria:', {
      minScore,
      limit,
      exchange,
      sector,
      minPrice,
      maxPrice
    });
    
    // Filter stocks based on criteria
    let stocksToScreen = INDIAN_STOCKS;
    
    if (exchange) {
      stocksToScreen = stocksToScreen.filter(stock => stock.exchange === exchange);
    }
    
    if (sector) {
      stocksToScreen = stocksToScreen.filter(stock => 
        stock.sector.toLowerCase().includes(sector.toLowerCase())
      );
    }
    
    // Fetch data for all stocks
    const stockPromises = stocksToScreen.map(stock => fetchIndianStockData(stock));
    const stockResults = await Promise.all(stockPromises);
    
    // Filter out null results and apply criteria
    const validStocks = stockResults
      .filter((stock): stock is IndianStock => stock !== null)
      .filter(stock => {
        return stock.score >= minScore &&
               stock.currentPrice >= minPrice &&
               stock.currentPrice <= maxPrice;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    const results: IndianStockResults = {
      success: true,
      totalScreened: stocksToScreen.length,
      candidatesFound: validStocks.length,
      criteria: {
        minScore,
        limit,
        exchange: exchange || undefined,
        sector: sector || undefined,
        minPrice: minPrice > 0 ? minPrice : undefined,
        maxPrice: maxPrice < 10000 ? maxPrice : undefined
      },
      stocks: validStocks,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Indian stock screening error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to screen Indian stocks',
        totalScreened: 0,
        candidatesFound: 0,
        stocks: [],
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 