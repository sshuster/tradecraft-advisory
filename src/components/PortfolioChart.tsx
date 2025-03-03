
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { MOCK_STOCK_PRICES } from '../contexts/AuthContext';

// Types
type ChartData = {
  date: string;
  value: number;
};

type PortfolioStockData = {
  symbol: string;
  shares: number;
  purchasePrice: number;
  purchaseDate: string;
  currentPrice: number;
  currentValue: number;
  profit: number;
  profitPercentage: number;
};

type PortfolioChartProps = {
  portfolioData: PortfolioStockData[];
};

const PortfolioChart: React.FC<PortfolioChartProps> = ({ portfolioData }) => {
  // Generate mock historical data for the portfolio
  const generatePortfolioHistoricalData = (): ChartData[] => {
    if (portfolioData.length === 0) return [];
    
    // Create an array of the last 12 months
    const data: ChartData[] = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(today.getMonth() - i);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      // Calculate portfolio value for this month
      let monthValue = 0;
      
      portfolioData.forEach(stock => {
        // Use the mock price data or fallback to current price
        const stockPrices = MOCK_STOCK_PRICES[stock.symbol];
        const priceIndex = stockPrices ? (11 - i) : 0;
        const price = stockPrices ? stockPrices[priceIndex] : stock.currentPrice;
        monthValue += price * stock.shares;
      });
      
      data.push({
        date: monthYear,
        value: parseFloat(monthValue.toFixed(2))
      });
    }
    
    return data;
  };

  const chartData = generatePortfolioHistoricalData();
  
  if (chartData.length === 0) {
    return <div className="flex justify-center items-center h-full">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis 
          domain={['auto', 'auto']}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip 
          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="value" 
          name="Portfolio Value" 
          stroke="#8884d8" 
          activeDot={{ r: 8 }} 
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PortfolioChart;
