import { NextRequest, NextResponse } from 'next/server';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

interface AlphaVantageResponse {
  'Meta Data'?: any;
  'Time Series (Daily)'?: any;
  'Time Series (60min)'?: any;
  'Time Series (Digital Currency Daily)'?: any;
  'Digital Currency Daily'?: any;
  'Technical Analysis: RSI'?: any;
  'Technical Analysis: MACD'?: any;
  'Error Message'?: string;
  'Note'?: string;
}

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

async function fetchAlphaVantageData(endpoint: string): Promise<AlphaVantageResponse> {
  const url = `${BASE_URL}${endpoint}&apikey=${ALPHA_VANTAGE_API_KEY}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Alpha Vantage API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data['Error Message']) {
    throw new Error(data['Error Message']);
  }
  
  if (data['Note']) {
    throw new Error('API call frequency limit reached. Please try again later.');
  }
  
  return data;
}

async function getStockData(symbol: string): Promise<FinancialData> {
  try {
    // Fetch intraday data (hourly)
    const intradayData = await fetchAlphaVantageData(
      `?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=60min&outputsize=compact`
    );
    
    // Fetch RSI
    const rsiData = await fetchAlphaVantageData(
      `?function=RSI&symbol=${symbol}&interval=daily&time_period=14&series_type=close`
    );
    
    // Fetch MACD
    const macdData = await fetchAlphaVantageData(
      `?function=MACD&symbol=${symbol}&interval=daily&series_type=close`
    );
    
    // Process intraday data
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
    
    // Process RSI
    const rsiTimeSeries = rsiData['Technical Analysis: RSI'];
    const latestRsi = rsiTimeSeries ? Object.values(rsiTimeSeries)[0] as any : null;
    const rsi = latestRsi ? parseFloat(latestRsi['RSI']) : 50;
    
    // Process MACD
    const macdTimeSeries = macdData['Technical Analysis: MACD'];
    const latestMacd = macdTimeSeries ? Object.values(macdTimeSeries)[0] as any : null;
    const macd = latestMacd ? {
      macd: parseFloat(latestMacd['MACD']),
      signal: parseFloat(latestMacd['MACD_Signal']),
      histogram: parseFloat(latestMacd['MACD_Hist'])
    } : { macd: 0, signal: 0, histogram: 0 };
    
    return {
      symbol,
      currentPrice,
      change,
      changePercent,
      volume: parseInt(latestData['5. volume']),
      rsi,
      macd,
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
    
    // Create mock hourly data from daily data (simplified)
    const hourlyData = times.slice(0, 7).map(time => ({
      time,
      open: parseFloat(timeSeries[time]['1a. open (USD)']),
      high: parseFloat(timeSeries[time]['2a. high (USD)']),
      low: parseFloat(timeSeries[time]['3a. low (USD)']),
      close: parseFloat(timeSeries[time]['4a. close (USD)']),
      volume: parseInt(timeSeries[time]['5. volume'])
    }));
    
    return {
      symbol,
      currentPrice,
      change,
      changePercent,
      volume: parseInt(latestData['5. volume']),
      rsi: 50, // Default RSI for crypto (would need separate API call)
      macd: { macd: 0, signal: 0, histogram: 0 }, // Default MACD
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