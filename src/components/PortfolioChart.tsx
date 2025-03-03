
import React, { useState, useEffect } from 'react';
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
import { getStockHistory } from '../services/stockService';
import { Stock } from '../contexts/AuthContext';

// Types
type ChartData = {
  date: string;
  value: number;
};

interface PortfolioStockData extends Stock {
  currentPrice: number;
  currentValue: number;
  profit: number;
  profitPercentage: number;
}

type PortfolioChartProps = {
  portfolioData: PortfolioStockData[];
};

const PortfolioChart: React.FC<PortfolioChartProps> = ({ portfolioData }) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (portfolioData.length === 0) {
        setChartData([]);
        setLoading(false);
        return;
      }

      try {
        // Fetch historical data for each stock
        const stockHistories = await Promise.all(
          portfolioData.map(async (stock) => {
            const history = await getStockHistory(stock.symbol, 12);
            return { symbol: stock.symbol, shares: stock.shares, history };
          })
        );

        // Process data for each date
        const combinedData: Record<string, ChartData> = {};

        stockHistories.forEach((stockData) => {
          stockData.history.forEach((dataPoint: { date: string; price: number }) => {
            const { date, price } = dataPoint;
            
            if (!combinedData[date]) {
              combinedData[date] = { date, value: 0 };
            }
            
            combinedData[date].value += price * stockData.shares;
          });
        });

        // Convert to array and sort by date
        const chartDataArray = Object.values(combinedData).sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setChartData(chartDataArray);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching portfolio history:', err);
        setError('Failed to load portfolio history. Please try again later.');
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [portfolioData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        {error}
      </div>
    );
  }

  if (chartData.length === 0) {
    return <div className="flex justify-center items-center h-full">No data available</div>;
  }

  // Format dates for better display
  const formattedData = chartData.map(point => ({
    ...point,
    date: new Date(point.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: '2-digit'
    })
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
