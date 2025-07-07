import { NextRequest, NextResponse } from 'next/server';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

interface AlphaVantageResponse {
  'Meta Data'?: any;
  'Time Series (Daily)'?: any;
  'Time Series (60min)'?: any;
  'Time Series (Digital Currency Daily)'?: any;
  'Technical Analysis: RSI'?: any;
  'Technical Analysis: SMA'?: any;
  'Error Message'?: string;
  'Note'?: string;
  'Information'?: string;
}

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

async function fetchAlphaVantageData(endpoint: string): Promise<AlphaVantageResponse> {
  const url = `${BASE_URL}${endpoint}&apikey=${ALPHA_VANTAGE_API_KEY}`;
  
  console.log('Fetching from Alpha Vantage:', url);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Alpha Vantage API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  console.log('Alpha Vantage response keys:', Object.keys(data));
  
  if (data['Error Message']) {
    throw new Error(data['Error Message']);
  }
  
  if (data['Note']) {
    throw new Error('API call frequency limit reached. Please try again later.');
  }
  
  if (data['Information'] && data['Information'].includes('premium')) {
    console.warn('Premium endpoint accessed:', data['Information']);
    return data;
  }
  
  return data;
}

// Helper function to add delay between API calls
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Calculate simple moving average from price data
function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  
  const slice = prices.slice(0, period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / period;
}

async function getStockData(symbol: string): Promise<FinancialData> {
  try {
    // Fetch intraday data (hourly) - this is the most important one
    const intradayData = await fetchAlphaVantageData(
      `?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=60min&outputsize=compact`
    );
    
    // Process intraday data first
    const timeSeries = intradayData['Time Series (60min)'];
    if (!timeSeries) {
      throw new Error('No intraday data found for this symbol');
    }
    
    const times = Object.keys(timeSeries).sort().reverse();
    const latestTime = times[0];
    const latestData = timeSeries[latestTime];
    const previousData = timeSeries[times[1]];
    
    const currentPrice = parseFloat(latestData['4. close']);
    const previousPrice = parseFloat(previousData['4. close']);
    const change = currentPrice - previousPrice;
    const changePercent = (change / previousPrice) * 100;
    
    // Process hourly data for charts
    const hourlyData = times.slice(0, 24).map(time => ({
      time,
      open: parseFloat(timeSeries[time]['1. open']),
      high: parseFloat(timeSeries[time]['2. high']),
      low: parseFloat(timeSeries[time]['3. low']),
      close: parseFloat(timeSeries[time]['4. close']),
      volume: parseInt(timeSeries[time]['5. volume'])
    }));
    
    // Calculate moving averages from hourly data
    const closePrices = hourlyData.map(d => d.close);
    const sma20 = calculateSMA(closePrices, Math.min(20, closePrices.length));
    const sma50 = calculateSMA(closePrices, Math.min(50, closePrices.length));
    
    // Determine trend
    let trend = 'Neutral';
    if (currentPrice > sma20 && sma20 > sma50) {
      trend = 'Bullish';
    } else if (currentPrice < sma20 && sma20 < sma50) {
      trend = 'Bearish';
    }
    
    // Add delay before next API call to avoid rate limiting
    await delay(1000);
    
    // Fetch RSI with error handling
    let rsi = 50; // Default RSI
    try {
      const rsiData = await fetchAlphaVantageData(
        `?function=RSI&symbol=${symbol}&interval=daily&time_period=14&series_type=close`
      );
      
      const rsiTimeSeries = rsiData['Technical Analysis: RSI'];
      if (rsiTimeSeries) {
        const latestRsi = Object.values(rsiTimeSeries)[0] as any;
        if (latestRsi && latestRsi['RSI']) {
          rsi = parseFloat(latestRsi['RSI']);
        }
      }
    } catch (error) {
      console.warn('RSI fetch failed, using default:', error);
    }
    
    return {
      symbol,
      currentPrice,
      change,
      changePercent,
      volume: parseInt(latestData['5. volume']),
      rsi,
      movingAverages: {
        sma20,
        sma50,
        trend
      },
      hourlyData
    };
    
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
}

async function getCryptoData(symbol: string): Promise<FinancialData> {
  try {
    // For crypto, we'll use the digital currency endpoint
    const cryptoData = await fetchAlphaVantageData(
      `?function=DIGITAL_CURRENCY_DAILY&symbol=${symbol}&market=USD`
    );
    
    const timeSeries = cryptoData['Time Series (Digital Currency Daily)'];
    if (!timeSeries) {
      throw new Error('No crypto data found for this symbol');
    }
    
    const times = Object.keys(timeSeries).sort().reverse();
    const latestTime = times[0];
    const latestData = timeSeries[latestTime];
    const previousData = timeSeries[times[1]];
    
    const currentPrice = parseFloat(latestData['4a. close (USD)']);
    const previousPrice = parseFloat(previousData['4a. close (USD)']);
    const change = currentPrice - previousPrice;
    const changePercent = (change / previousPrice) * 100;
    
    // Create hourly data from daily data (simplified)
    const hourlyData = times.slice(0, 7).map(time => ({
      time,
      open: parseFloat(timeSeries[time]['1a. open (USD)']),
      high: parseFloat(timeSeries[time]['2a. high (USD)']),
      low: parseFloat(timeSeries[time]['3a. low (USD)']),
      close: parseFloat(timeSeries[time]['4a. close (USD)']),
      volume: parseInt(timeSeries[time]['5. volume'])
    }));
    
    // Calculate moving averages from daily data
    const closePrices = hourlyData.map(d => d.close);
    const sma20 = calculateSMA(closePrices, Math.min(7, closePrices.length)); // Use 7 days instead of 20 for crypto
    const sma50 = calculateSMA(closePrices, Math.min(7, closePrices.length)); // Limited data available
    
    // Determine trend
    let trend = 'Neutral';
    if (currentPrice > sma20) {
      trend = 'Bullish';
    } else if (currentPrice < sma20) {
      trend = 'Bearish';
    }
    
    return {
      symbol,
      currentPrice,
      change,
      changePercent,
      volume: parseInt(latestData['5. volume']),
      rsi: 50, // Default RSI for crypto (RSI is premium for crypto)
      movingAverages: {
        sma20,
        sma50,
        trend
      },
      hourlyData
    };
    
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }
    
    if (!ALPHA_VANTAGE_API_KEY) {
      return NextResponse.json(
        { error: 'Alpha Vantage API key not configured' },
        { status: 500 }
      );
    }
    
    // Determine if it's a crypto symbol (common crypto symbols)
    const cryptoSymbols = ['BTC', 'ETH', 'ADA', 'DOT', 'LTC', 'XRP', 'BCH', 'LINK', 'BNB'];
    const isCrypto = cryptoSymbols.includes(symbol.toUpperCase()) || 
                     symbol.includes('/') || 
                     symbol.includes('-');
    
    let data: FinancialData;
    
    if (isCrypto) {
      // Remove /USD suffix if present
      const cleanSymbol = symbol.replace('/USD', '').replace('-USD', '');
      data = await getCryptoData(cleanSymbol);
    } else {
      data = await getStockData(symbol);
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch financial data',
        details: 'Please check if the symbol is valid and try again'
      },
      { status: 500 }
    );
  }
} 