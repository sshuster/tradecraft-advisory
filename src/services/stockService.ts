
// This service mocks a backend API for stock data

// Mock stock symbols and prices
const STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 180.95, change: 2.30 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 325.14, change: 4.25 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2950.12, change: 15.72 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3550.50, change: -12.30 },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 950.75, change: 28.15 },
  { symbol: 'META', name: 'Meta Platforms, Inc.', price: 330.42, change: -5.18 },
  { symbol: 'NFLX', name: 'Netflix, Inc.', price: 620.83, change: 8.94 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 780.25, change: 22.40 },
  { symbol: 'JNJ', name: 'Johnson & Johnson', price: 175.32, change: 1.15 },
  { symbol: 'PG', name: 'Procter & Gamble Co.', price: 162.80, change: 0.75 },
  { symbol: 'V', name: 'Visa Inc.', price: 240.35, change: 3.25 },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 155.48, change: -1.22 },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', price: 480.92, change: 5.20 },
  { symbol: 'HD', name: 'The Home Depot, Inc.', price: 340.65, change: -2.35 },
  { symbol: 'PFE', name: 'Pfizer Inc.', price: 48.75, change: 0.65 },
];

// Function to simulate API delay
const simulateApiDelay = () => new Promise(resolve => setTimeout(resolve, 500));

// Get all available stocks
export const getStocks = async () => {
  await simulateApiDelay();
  return [...STOCKS];
};

// Search stocks by symbol or name
export const searchStocks = async (query: string) => {
  await simulateApiDelay();
  const q = query.toLowerCase();
  return STOCKS.filter(
    stock => stock.symbol.toLowerCase().includes(q) || stock.name.toLowerCase().includes(q)
  );
};

// Get current price for a specific stock
export const getStockPrice = async (symbol: string) => {
  await simulateApiDelay();
  const stock = STOCKS.find(s => s.symbol === symbol);
  return stock ? stock.price : null;
};

// Get price history for a specific stock (mock data)
export const getStockHistory = async (symbol: string, days = 30) => {
  await simulateApiDelay();
  
  // Generate random historical data
  const today = new Date();
  const history = [];
  const stock = STOCKS.find(s => s.symbol === symbol);
  
  if (!stock) return [];
  
  let price = stock.price;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate a random price change within ±3%
    const change = price * (Math.random() * 0.06 - 0.03);
    price = Math.max(price + change, 1); // Ensure price doesn't go below 1
    
    history.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2))
    });
  }
  
  return history;
};

// Mock trading strategies
export const STRATEGIES = [
  {
    id: 1,
    name: 'Blue Chip Growth',
    description: 'Focus on established, industry-leading companies with strong growth potential.',
    riskLevel: 'Medium',
    expectedReturn: '8-12%',
    recommendedStocks: ['AAPL', 'MSFT', 'JNJ', 'PG', 'V']
  },
  {
    id: 2,
    name: 'Tech Innovation',
    description: 'Invest in cutting-edge technology companies poised for rapid growth.',
    riskLevel: 'High',
    expectedReturn: '12-20%',
    recommendedStocks: ['TSLA', 'NVDA', 'GOOGL', 'META', 'AMZN']
  },
  {
    id: 3,
    name: 'Value Investing',
    description: 'Target undervalued stocks with strong fundamentals and dividends.',
    riskLevel: 'Low',
    expectedReturn: '5-8%',
    recommendedStocks: ['JNJ', 'PG', 'JPM', 'HD', 'UNH']
  },
  {
    id: 4,
    name: 'Dividend Income',
    description: 'Focus on companies with consistent dividend payments and growth.',
    riskLevel: 'Low',
    expectedReturn: '4-6%',
    recommendedStocks: ['PFE', 'JNJ', 'PG', 'JPM', 'HD']
  }
];

// Get all trading strategies
export const getStrategies = async () => {
  await simulateApiDelay();
  return [...STRATEGIES];
};

// Get a specific trading strategy
export const getStrategy = async (id: number) => {
  await simulateApiDelay();
  return STRATEGIES.find(strategy => strategy.id === id);
};
