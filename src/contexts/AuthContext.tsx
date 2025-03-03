
import React, { createContext, useState, useContext, useEffect } from 'react';

// Mock user data
const MOCK_USERS = [
  {
    id: 1,
    username: 'admin',
    password: 'admin',
    name: 'Admin User',
    email: 'admin@example.com',
    portfolios: [
      {
        id: 1,
        name: 'Tech Portfolio',
        stocks: [
          { symbol: 'AAPL', shares: 10, purchasePrice: 150, purchaseDate: '2023-01-05' },
          { symbol: 'MSFT', shares: 5, purchasePrice: 280, purchaseDate: '2023-02-10' },
          { symbol: 'GOOGL', shares: 2, purchasePrice: 2700, purchaseDate: '2023-03-15' },
        ]
      },
      {
        id: 2,
        name: 'Value Stocks',
        stocks: [
          { symbol: 'JNJ', shares: 8, purchasePrice: 160, purchaseDate: '2023-01-20' },
          { symbol: 'PG', shares: 7, purchasePrice: 140, purchaseDate: '2023-02-25' },
        ]
      }
    ]
  }
];

// Mock stock price history for charts
export const MOCK_STOCK_PRICES = {
  'AAPL': [150, 155, 153, 160, 165, 168, 170, 175, 172, 180, 183, 178],
  'MSFT': [280, 285, 290, 288, 295, 300, 305, 310, 315, 318, 320, 325],
  'GOOGL': [2700, 2720, 2750, 2780, 2800, 2820, 2850, 2880, 2900, 2950, 3000, 3050],
  'JNJ': [160, 162, 165, 168, 166, 164, 167, 170, 172, 175, 173, 176],
  'PG': [140, 142, 145, 148, 150, 152, 153, 155, 158, 160, 162, 165],
};

// Types
type User = {
  id: number;
  username: string;
  password: string;
  name: string;
  email: string;
  portfolios: Portfolio[];
};

export type Stock = {
  symbol: string;
  shares: number;
  purchasePrice: number;
  purchaseDate: string;
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
  addPortfolio: (name: string) => void;
  removePortfolio: (id: number) => void;
  addStockToPortfolio: (portfolioId: number, stock: Stock) => void;
  removeStockFromPortfolio: (portfolioId: number, symbol: string) => void;
  users: User[];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const storedUsers = localStorage.getItem('users');
    return storedUsers ? JSON.parse(storedUsers) : MOCK_USERS;
  });
  
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('currentUser', user ? JSON.stringify(user) : '');
  }, [user]);

  const login = async (username: string, password: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = users.find(u => u.username === username && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const register = async (username: string, password: string, name: string, email: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if username already exists
    if (users.some(u => u.username === username)) {
      return false;
    }

    const newUser: User = {
      id: users.length + 1,
      username,
      password,
      name,
      email,
      portfolios: []
    };

    setUsers([...users, newUser]);
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const addPortfolio = (name: string) => {
    if (!user) return;
    
    const newPortfolio: Portfolio = {
      id: Math.max(0, ...user.portfolios.map(p => p.id)) + 1,
      name,
      stocks: []
    };

    const updatedUser = {
      ...user,
      portfolios: [...user.portfolios, newPortfolio]
    };

    setUser(updatedUser);
    setUsers(users.map(u => u.id === user.id ? updatedUser : u));
  };

  const removePortfolio = (id: number) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      portfolios: user.portfolios.filter(p => p.id !== id)
    };

    setUser(updatedUser);
    setUsers(users.map(u => u.id === user.id ? updatedUser : u));
  };

  const addStockToPortfolio = (portfolioId: number, stock: Stock) => {
    if (!user) return;
    
    const updatedPortfolios = user.portfolios.map(portfolio => {
      if (portfolio.id === portfolioId) {
        // Check if stock already exists, update if it does
        const existingStockIndex = portfolio.stocks.findIndex(s => s.symbol === stock.symbol);
        
        if (existingStockIndex >= 0) {
          const updatedStocks = [...portfolio.stocks];
          updatedStocks[existingStockIndex] = stock;
          return { ...portfolio, stocks: updatedStocks };
        } else {
          return { ...portfolio, stocks: [...portfolio.stocks, stock] };
        }
      }
      return portfolio;
    });

    const updatedUser = { ...user, portfolios: updatedPortfolios };
    setUser(updatedUser);
    setUsers(users.map(u => u.id === user.id ? updatedUser : u));
  };

  const removeStockFromPortfolio = (portfolioId: number, symbol: string) => {
    if (!user) return;
    
    const updatedPortfolios = user.portfolios.map(portfolio => {
      if (portfolio.id === portfolioId) {
        return {
          ...portfolio,
          stocks: portfolio.stocks.filter(stock => stock.symbol !== symbol)
        };
      }
      return portfolio;
    });

    const updatedUser = { ...user, portfolios: updatedPortfolios };
    setUser(updatedUser);
    setUsers(users.map(u => u.id === user.id ? updatedUser : u));
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
    users,
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
