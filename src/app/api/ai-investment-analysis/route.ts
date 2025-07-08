import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getOpenAIApiKey } from './config';

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

    // Prepare data for AI analysis
    const topStocks = stocks.slice(0, 20); // Analyze top 20 for better AI processing
    
    const stockSummary = topStocks.map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      price: stock.currentPrice,
      score: stock.accumulationScore,
      change: stock.changePercent,
      consolidationDays: stock.timeframe.daysInConsolidation,
      volumeTrend: stock.accumulationMetrics.onBalanceVolume.trend,
      adStrength: stock.accumulationMetrics.accumulationDistribution.strength || 0,
      wyckoffPhase: stock.accumulationMetrics.wyckoffPhase.phase,
      wyckoffConfidence: stock.accumulationMetrics.wyckoffPhase.confidence || 0,
      isConsolidating: stock.accumulationMetrics.consolidation.isConsolidating,
      rangeTightness: stock.accumulationMetrics.consolidation.rangeTightness || 0,
      volumeRatio: stock.accumulationMetrics.volumeProfile.volumeRatio || 0,
      signals: {
        volumeDivergence: stock.accumulationSignals.volumeDivergence,
        priceConsolidation: stock.accumulationSignals.priceConsolidation,
        smartMoneyFlow: stock.accumulationSignals.smartMoneyFlow,
        wyckoffAccumulation: stock.accumulationSignals.wyckoffAccumulation,
        highVolumeAtSupport: stock.accumulationSignals.highVolumeAtSupport
      },
      reasoning: stock.reasoning
    }));

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
   - Price: €${(stock.price || 0).toFixed(2)}
   - Accumulation Score: ${stock.score}/100
   - Recent Change: ${(stock.change || 0).toFixed(2)}%
   - Consolidation: ${stock.consolidationDays} days, ${(stock.rangeTightness || 0).toFixed(1)}% range
   - Volume Trend: ${stock.volumeTrend}
   - A/D Strength: ${(stock.adStrength || 0).toFixed(1)}
   - Wyckoff Phase: ${stock.wyckoffPhase} (${stock.wyckoffConfidence}% confidence)
   - Volume Ratio: ${(stock.volumeRatio || 0).toFixed(2)}x
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