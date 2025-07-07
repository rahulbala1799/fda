# FinanceAI - AI-Powered Investment Analysis

A modern web application that provides intelligent insights on stocks and cryptocurrencies using advanced AI analysis. Get optimal entry and exit points based on real-time market data.

## Features

- 🤖 **AI-Powered Analysis**: Advanced technical analysis using OpenAI's GPT models
- 📊 **Stock Analysis**: Real-time stock data with technical indicators
- ₿ **Crypto Insights**: Cryptocurrency market analysis and sentiment
- 🎯 **Smart Recommendations**: Precise buy/sell price targets
- 📱 **Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- ⚡ **Fast Performance**: Built with Next.js 13 for optimal performance

## Tech Stack

- **Framework**: Next.js 13 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI**: OpenAI API (GPT-4/GPT-3.5-turbo)
- **Financial Data**: Alpha Vantage API
- **Deployment**: Railway

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rahulbala1799/fda.git
cd fda
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` and add your API keys:
- `OPENAI_API_KEY`: Your OpenAI API key
- `ALPHA_VANTAGE_API_KEY`: Your Alpha Vantage API key

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
npm run build
npm start
```

## API Integration (Coming Soon)

The application will integrate with:
- **OpenAI API**: For AI-powered financial analysis
- **Alpha Vantage API**: For real-time stock and crypto data

## Deployment

This application is configured for deployment on Railway. Simply connect your GitHub repository to Railway and it will automatically deploy.

## Disclaimer

⚠️ **Important**: This application provides AI-generated financial analysis for educational purposes only. It is not financial advice. Always conduct your own research and consult with financial professionals before making investment decisions.

## License

MIT License - feel free to use this project for your own purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
