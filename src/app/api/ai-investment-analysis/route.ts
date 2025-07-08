import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface AccumulationStock {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  accumulationScore: number;
  accumulationSignals: {
    volumeDivergence: boolean;
    priceConsolidation: boolean;
    smartMoneyFlow: boolean;
    wyckoffAccumulation: boolean;
    highVolumeAtSupport: boolean;
  };
  accumulationMetrics: {
    onBalanceVolume: {
      trend: 'RISING' | 'FALLING' | 'NEUTRAL';
    };
    accumulationDistribution: {
      trend: 'ACCUMULATION' | 'DISTRIBUTION' | 'NEUTRAL';
      strength: number;
    };
    wyckoffPhase: {
      phase: string;
      confidence: number;
    };
    consolidation: {
      isConsolidating: boolean;
      duration: number;
      rangeTightness: number;
    };
    volumeProfile: {
      volumeRatio: number;
      highVolumeAtLows: boolean;
    };
  };
  timeframe: {
    daysInConsolidation: number;
  };
  reasoning: string[];
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

function getOpenAIApiKey(): string | null {
  // Try environment variable first
  const envKey = process.env.OPENAI_API_KEY;
  if (envKey && envKey !== 'your-actual-key-here' && !envKey.includes('your-act')) {
    return envKey.replace(/\s+/g, ''); // Remove any whitespace/newlines
  }
  
  // If we're in development, try to read from .env.local
  if (process.env.NODE_ENV === 'development') {
    try {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.join(process.cwd(), '.env.local');
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/OPENAI_API_KEY=(.+)/);
      if (match && match[1] && !match[1].includes('your-act')) {
        // Clean up the API key by removing whitespace and newlines
        return match[1].replace(/\s+/g, '').trim();
      }
    } catch (error) {
      console.error('Error reading .env.local:', error);
    }
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = getOpenAIApiKey();
    console.log('API Key loaded:', !!apiKey);
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const { stocks } = await request.json();
    
    if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
      return NextResponse.json(
        { error: 'No accumulation data provided' },
        { status: 400 }
      );
    }

    // Prepare data for AI analysis with proper null checks
    const topStocks = stocks.slice(0, 20); // Analyze top 20 for better AI processing
    
    const stockSummary = topStocks.map(stock => {
      // Ensure all nested objects exist with default values
      const safeStock = {
        symbol: stock.symbol || 'UNKNOWN',
        name: stock.name || 'Unknown Company',
        currentPrice: stock.currentPrice || 0,
        accumulationScore: stock.accumulationScore || 0,
        changePercent: stock.changePercent || 0,
        timeframe: stock.timeframe || { daysInConsolidation: 0 },
        accumulationMetrics: {
          onBalanceVolume: stock.accumulationMetrics?.onBalanceVolume || { trend: 'NEUTRAL' },
          accumulationDistribution: stock.accumulationMetrics?.accumulationDistribution || { trend: 'NEUTRAL', strength: 0 },
          wyckoffPhase: stock.accumulationMetrics?.wyckoffPhase || { phase: 'UNKNOWN', confidence: 0 },
          consolidation: stock.accumulationMetrics?.consolidation || { isConsolidating: false, duration: 0, rangeTightness: 0 },
          volumeProfile: stock.accumulationMetrics?.volumeProfile || { volumeRatio: 0, highVolumeAtLows: false }
        },
        accumulationSignals: stock.accumulationSignals || {
          volumeDivergence: false,
          priceConsolidation: false,
          smartMoneyFlow: false,
          wyckoffAccumulation: false,
          highVolumeAtSupport: false
        },
        reasoning: stock.reasoning || []
      };

      return {
        symbol: safeStock.symbol,
        name: safeStock.name,
        price: safeStock.currentPrice,
        score: safeStock.accumulationScore,
        change: safeStock.changePercent,
        consolidationDays: safeStock.timeframe.daysInConsolidation,
        volumeTrend: safeStock.accumulationMetrics.onBalanceVolume.trend,
        adStrength: safeStock.accumulationMetrics.accumulationDistribution.strength || 0,
        wyckoffPhase: safeStock.accumulationMetrics.wyckoffPhase.phase,
        wyckoffConfidence: safeStock.accumulationMetrics.wyckoffPhase.confidence || 0,
        isConsolidating: safeStock.accumulationMetrics.consolidation.isConsolidating,
        rangeTightness: safeStock.accumulationMetrics.consolidation.rangeTightness || 0,
        volumeRatio: safeStock.accumulationMetrics.volumeProfile.volumeRatio || 0,
        signals: {
          volumeDivergence: safeStock.accumulationSignals.volumeDivergence,
          priceConsolidation: safeStock.accumulationSignals.priceConsolidation,
          smartMoneyFlow: safeStock.accumulationSignals.smartMoneyFlow,
          wyckoffAccumulation: safeStock.accumulationSignals.wyckoffAccumulation,
          highVolumeAtSupport: safeStock.accumulationSignals.highVolumeAtSupport
        },
        reasoning: safeStock.reasoning
      };
    });

    const prompt = `
You are a professional investment advisor analyzing accumulation patterns for a weekly €200 investment strategy. 

INVESTMENT CONTEXT:
- Weekly investment: €200
- Strategy: Dollar-cost averaging into accumulation candidates
- Time horizon: 6-12 months
- Risk tolerance: Moderate
- Goal: Capital appreciation through smart money accumulation patterns

ACCUMULATION DATA ANALYSIS:
Here are the top 20 stocks showing accumulation patterns, ranked by accumulation score:

${stockSummary.map((stock, index) => `
${index + 1}. ${stock.symbol} (${stock.name})
   - Price: €${stock.price.toFixed(2)}
   - Accumulation Score: ${stock.score}/100
   - Recent Change: ${stock.change.toFixed(2)}%
   - Consolidation: ${stock.consolidationDays} days, ${stock.rangeTightness.toFixed(1)}% range
   - Volume Trend: ${stock.volumeTrend}
   - A/D Strength: ${stock.adStrength.toFixed(1)}
   - Wyckoff Phase: ${stock.wyckoffPhase} (${stock.wyckoffConfidence}% confidence)
   - Volume Ratio: ${stock.volumeRatio.toFixed(2)}x
   - Key Signals: ${Object.entries(stock.signals).filter(([_, value]) => value).map(([key]) => key).join(', ')}
   - Analysis: ${stock.reasoning.slice(0, 2).join('; ')}
`).join('\n')}

ANALYSIS REQUIREMENTS:
1. Select the SINGLE BEST stock for weekly €200 investments
2. Consider accumulation strength, price stability, volume patterns, and Wyckoff analysis
3. Factor in the weekly investment amount and share price for practical execution
4. Assess risk-reward for 6-12 month timeframe
5. Provide 2-3 alternative options

RESPONSE FORMAT (JSON):
{
  "recommendedStock": {
    "symbol": "STOCK_SYMBOL",
    "name": "Company Name",
    "currentPrice": 123.45,
    "accumulationScore": 85
  },
  "investmentStrategy": {
    "weeklyAmount": 200,
    "sharesPerWeek": 1.23,
    "totalShares": 64,
    "timeHorizon": "6-12 months",
    "riskLevel": "MEDIUM"
  },
  "reasoning": {
    "whyThisStock": [
      "Primary reason for selection",
      "Secondary technical factor",
      "Accumulation pattern strength"
    ],
    "marketAnalysis": [
      "Current market position",
      "Sector outlook",
      "Technical setup quality"
    ],
    "riskAssessment": [
      "Key risks to consider",
      "Volatility expectations",
      "Downside protection factors"
    ],
    "timeframePrediction": [
      "Expected 3-month outlook",
      "6-month target expectations",
      "Potential catalysts"
    ]
  },
  "alternatives": [
    {
      "symbol": "ALT1",
      "name": "Alternative 1",
      "reason": "Why this is second choice"
    },
    {
      "symbol": "ALT2", 
      "name": "Alternative 2",
      "reason": "Why this is third choice"
    }
  ],
  "confidence": 85,
  "lastUpdated": "${new Date().toISOString()}"
}

Focus on stocks with:
- Strong accumulation signals (score 70+)
- Reasonable price for weekly €200 purchases
- Clear consolidation patterns
- Rising OBV and positive A/D trends
- Wyckoff accumulation phase confirmation

Provide only the JSON response, no additional text.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Using GPT-4 for better analysis
      messages: [
        {
          role: "system",
          content: "You are a professional investment advisor specializing in technical analysis and accumulation patterns. Provide detailed, data-driven investment recommendations based on volume analysis, Wyckoff methodology, and smart money indicators."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent analysis
      max_tokens: 2000
    });

    const aiResponse = completion.choices[0].message.content;
    console.log('Raw AI Response:', aiResponse);
    
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    let recommendation: InvestmentRecommendation;
    try {
      // Try to extract JSON from the response if it's wrapped in text
      let jsonStr = aiResponse;
      const jsonStart = aiResponse.indexOf('{');
      const jsonEnd = aiResponse.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonStr = aiResponse.substring(jsonStart, jsonEnd + 1);
      }
      
      recommendation = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      console.error('Parse error:', parseError);
      throw new Error('Invalid AI response format');
    }

    return NextResponse.json({
      success: true,
      recommendation,
      analysisDate: new Date().toISOString(),
      stocksAnalyzed: topStocks.length
    });

  } catch (error) {
    console.error('AI Investment Analysis Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate investment analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 