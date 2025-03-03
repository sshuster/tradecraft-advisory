
import axios from 'axios';

// Get all available stocks
export const getStocks = async () => {
  try {
    const response = await axios.get('/stocks');
    return response.data;
  } catch (error) {
    console.error('Error fetching stocks:', error);
    throw error;
  }
};

// Search stocks by symbol or name
export const searchStocks = async (query: string) => {
  try {
    const response = await axios.get(`/stocks/search?query=${query}`);
    return response.data;
  } catch (error) {
    console.error('Error searching stocks:', error);
    throw error;
  }
};

// Get current price for a specific stock
export const getStockPrice = async (symbol: string) => {
  try {
    const stocks = await getStocks();
    const stock = stocks.find((s: any) => s.symbol === symbol);
    return stock ? stock.price : null;
  } catch (error) {
    console.error('Error fetching stock price:', error);
    throw error;
  }
};

// Get price history for a specific stock
export const getStockHistory = async (symbol: string, days = 30) => {
  try {
    const response = await axios.get(`/stocks/history/${symbol}?days=${days}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stock history:', error);
    throw error;
  }
};

// Get all trading strategies
export const getStrategies = async () => {
  try {
    const response = await axios.get('/strategies');
    return response.data;
  } catch (error) {
    console.error('Error fetching strategies:', error);
    throw error;
  }
};

// Get a specific trading strategy
export const getStrategy = async (id: number) => {
  try {
    const response = await axios.get(`/strategies/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching strategy:', error);
    throw error;
  }
};
