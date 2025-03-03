
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

// Types
type User = {
  id: number;
  username: string;
  name: string;
  email: string;
  portfolios: Portfolio[];
};

export type Stock = {
  symbol: string;
  shares: number;
  purchase_price: number;
  purchase_date: string;
  // For frontend compatibility
  purchasePrice?: number;
  purchaseDate?: string;
};

export type Portfolio = {
  id: number;
  name: string;
  stocks: Stock[];
};

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, name: string, email: string) => Promise<boolean>;
  logout: () => void;
  addPortfolio: (name: string) => Promise<boolean>;
  removePortfolio: (id: number) => Promise<boolean>;
  addStockToPortfolio: (portfolioId: number, stock: Stock) => Promise<boolean>;
  removeStockFromPortfolio: (portfolioId: number, symbol: string) => Promise<boolean>;
  loading: boolean;
};

// Demo user data
const DEMO_USER: User = {
  id: 1,
  username: 'admin',
  name: 'Demo Admin',
  email: 'admin@example.com',
  portfolios: [
    {
      id: 1,
      name: 'Tech Portfolio',
      stocks: [
        { symbol: 'AAPL', shares: 10, purchase_price: 150.0, purchase_date: '2023-01-15' },
        { symbol: 'MSFT', shares: 5, purchase_price: 280.0, purchase_date: '2023-02-10' },
        { symbol: 'GOOGL', shares: 2, purchase_price: 2600.0, purchase_date: '2023-03-05' }
      ]
    },
    {
      id: 2,
      name: 'Value Stocks',
      stocks: [
        { symbol: 'JNJ', shares: 8, purchase_price: 160.0, purchase_date: '2023-01-20' },
        { symbol: 'PG', shares: 12, purchase_price: 140.0, purchase_date: '2023-02-25' }
      ]
    },
    {
      id: 3,
      name: 'Dividend Income',
      stocks: [
        { symbol: 'PFE', shares: 15, purchase_price: 45.0, purchase_date: '2023-04-10' },
        { symbol: 'KO', shares: 20, purchase_price: 58.0, purchase_date: '2023-03-15' },
        { symbol: 'MCD', shares: 5, purchase_price: 265.0, purchase_date: '2023-05-05' },
        { symbol: 'VZ', shares: 12, purchase_price: 39.0, purchase_date: '2023-04-20' }
      ]
    }
  ]
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode; apiUrl?: string }> = ({ 
  children, 
  apiUrl = 'http://localhost:5000/api' 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Set up axios base URL
  useEffect(() => {
    axios.defaults.baseURL = apiUrl;
  }, [apiUrl]);

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Update localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      // Check if this is the demo account
      if (username === 'admin' && password === 'admin') {
        setUser(DEMO_USER);
        toast({
          title: "Demo Login successful",
          description: "You're now logged in with the demo account"
        });
        return true;
      }
      
      // If not demo account, proceed with regular login
      const response = await axios.post('/login', { username, password });
      const userData = response.data.user;
      
      // Transform data to match frontend structure if needed
      const transformedUser = {
        ...userData,
        portfolios: userData.portfolios.map((portfolio: any) => ({
          ...portfolio,
          stocks: portfolio.stocks.map((stock: any) => ({
            ...stock,
            purchasePrice: stock.purchase_price,
            purchaseDate: stock.purchase_date
          }))
        }))
      };
      
      setUser(transformedUser);
      toast({
        title: "Login successful",
        description: `Welcome back, ${transformedUser.name}!`
      });
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.error || 'Login failed. Please check your credentials.';
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, password: string, name: string, email: string) => {
    setLoading(true);
    try {
      const response = await axios.post('/register', { username, password, name, email });
      const userData = response.data.user;
      setUser({
        ...userData,
        portfolios: userData.portfolios || []
      });
      toast({
        title: "Registration successful",
        description: `Welcome, ${name}!`
      });
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error.response?.data?.error || 'Registration failed. Please try again.';
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  const addPortfolio = async (name: string) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const response = await axios.post('/portfolios', {
        user_id: user.id,
        name
      });
      
      const newPortfolio = response.data.portfolio;
      
      setUser({
        ...user,
        portfolios: [...user.portfolios, newPortfolio]
      });
      
      toast({
        title: "Portfolio created",
        description: `Portfolio "${name}" has been created successfully.`
      });
      
      return true;
    } catch (error: any) {
      console.error('Add portfolio error:', error);
      const message = error.response?.data?.error || 'Failed to create portfolio. Please try again.';
      toast({
        title: "Failed to create portfolio",
        description: message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removePortfolio = async (id: number) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      await axios.delete(`/portfolios/${id}`);
      
      const updatedUser = {
        ...user,
        portfolios: user.portfolios.filter(p => p.id !== id)
      };
      
      setUser(updatedUser);
      
      toast({
        title: "Portfolio removed",
        description: "The portfolio has been removed successfully."
      });
      
      return true;
    } catch (error: any) {
      console.error('Remove portfolio error:', error);
      const message = error.response?.data?.error || 'Failed to remove portfolio. Please try again.';
      toast({
        title: "Failed to remove portfolio",
        description: message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addStockToPortfolio = async (portfolioId: number, stock: Stock) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const stockData = {
        portfolio_id: portfolioId,
        symbol: stock.symbol,
        shares: stock.shares,
        purchase_price: stock.purchasePrice || stock.purchase_price,
        purchase_date: stock.purchaseDate || stock.purchase_date
      };
      
      const response = await axios.post('/stocks', stockData);
      
      // Update user state with new stock
      const updatedPortfolios = user.portfolios.map(portfolio => {
        if (portfolio.id === portfolioId) {
          // Look for existing stock to update
          const existingStockIndex = portfolio.stocks.findIndex(s => s.symbol === stock.symbol);
          
          if (existingStockIndex >= 0) {
            // Update existing stock
            const updatedStocks = [...portfolio.stocks];
            updatedStocks[existingStockIndex] = {
              ...stock,
              purchase_price: stock.purchasePrice || stock.purchase_price,
              purchase_date: stock.purchaseDate || stock.purchase_date
            };
            return { ...portfolio, stocks: updatedStocks };
          } else {
            // Add new stock
            return { 
              ...portfolio, 
              stocks: [...portfolio.stocks, {
                ...stock,
                purchase_price: stock.purchasePrice || stock.purchase_price,
                purchase_date: stock.purchaseDate || stock.purchase_date
              }] 
            };
          }
        }
        return portfolio;
      });
      
      setUser({ ...user, portfolios: updatedPortfolios });
      
      toast({
        title: "Stock added",
        description: `${stock.symbol} has been added to your portfolio.`
      });
      
      return true;
    } catch (error: any) {
      console.error('Add stock error:', error);
      const message = error.response?.data?.error || 'Failed to add stock. Please try again.';
      toast({
        title: "Failed to add stock",
        description: message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeStockFromPortfolio = async (portfolioId: number, symbol: string) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      await axios.delete(`/stocks/${portfolioId}/${symbol}`);
      
      // Update user state
      const updatedPortfolios = user.portfolios.map(portfolio => {
        if (portfolio.id === portfolioId) {
          return {
            ...portfolio,
            stocks: portfolio.stocks.filter(stock => stock.symbol !== symbol)
          };
        }
        return portfolio;
      });
      
      setUser({ ...user, portfolios: updatedPortfolios });
      
      toast({
        title: "Stock removed",
        description: `${symbol} has been removed from your portfolio.`
      });
      
      return true;
    } catch (error: any) {
      console.error('Remove stock error:', error);
      const message = error.response?.data?.error || 'Failed to remove stock. Please try again.';
      toast({
        title: "Failed to remove stock",
        description: message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    login,
    register,
    logout,
    addPortfolio,
    removePortfolio,
    addStockToPortfolio,
    removeStockFromPortfolio,
    loading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
