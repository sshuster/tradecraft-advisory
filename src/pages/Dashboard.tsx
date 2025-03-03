import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ColDef } from 'ag-grid-community';
import { useAuth, Stock } from '../contexts/AuthContext';
import { getStockPrice } from '../services/stockService';
import Layout from '../components/Layout';
import PortfolioChart from '../components/PortfolioChart';
import AddStockForm from '../components/AddStockForm';
import { useToast } from '../hooks/use-toast';

// Define the type for our row data
type PortfolioStockData = Stock & {
  currentPrice: number;
  currentValue: number;
  profit: number;
  profitPercentage: number;
};

const Dashboard = () => {
  const { user, removeStockFromPortfolio } = useAuth();
  const navigate = useNavigate();
  const [selectedPortfolio, setSelectedPortfolio] = useState<number | null>(null);
  const [portfolioData, setPortfolioData] = useState<PortfolioStockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddStockForm, setShowAddStockForm] = useState(false);
  const { toast } = useToast();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.portfolios.length > 0 && selectedPortfolio === null) {
      setSelectedPortfolio(user.portfolios[0].id);
    }
  }, [user, navigate, selectedPortfolio]);

  // Load stock data when portfolio changes
  useEffect(() => {
    if (!user || selectedPortfolio === null) return;

    const loadStockData = async () => {
      setIsLoading(true);
      
      const portfolio = user.portfolios.find(p => p.id === selectedPortfolio);
      if (!portfolio) return;

      try {
        const stocksWithPrices = await Promise.all(
          portfolio.stocks.map(async (stock) => {
            const currentPrice = await getStockPrice(stock.symbol) || 0;
            const currentValue = currentPrice * stock.shares;
            const profit = currentValue - (stock.purchasePrice * stock.shares);
            const profitPercentage = (profit / (stock.purchasePrice * stock.shares)) * 100;
            
            return {
              ...stock,
              currentPrice,
              currentValue,
              profit,
              profitPercentage
            };
          })
        );
        
        setPortfolioData(stocksWithPrices);
      } catch (error) {
        console.error('Error loading stock data:', error);
        toast({
          title: "Error",
          description: "Failed to load stock data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStockData();
  }, [user, selectedPortfolio, toast]);

  // AG Grid column definitions
  const columnDefs: ColDef[] = [
    { field: 'symbol', headerName: 'Symbol', sort: 'asc', filter: true },
    { field: 'shares', headerName: 'Shares', filter: 'agNumberColumnFilter' },
    { 
      field: 'purchasePrice', 
      headerName: 'Purchase Price',
      valueFormatter: (params) => `$${params.value.toFixed(2)}`,
      filter: 'agNumberColumnFilter'
    },
    { 
      field: 'currentPrice', 
      headerName: 'Current Price',
      valueFormatter: (params) => `$${params.value.toFixed(2)}`,
      filter: 'agNumberColumnFilter'
    },
    { 
      field: 'currentValue', 
      headerName: 'Current Value',
      valueFormatter: (params) => `$${params.value.toFixed(2)}`,
      filter: 'agNumberColumnFilter'
    },
    { 
      field: 'profit', 
      headerName: 'Profit/Loss',
      cellStyle: (params) => {
        return { color: params.value >= 0 ? 'green' : 'red' };
      },
      valueFormatter: (params) => `$${params.value.toFixed(2)}`,
      filter: 'agNumberColumnFilter'
    },
    { 
      field: 'profitPercentage', 
      headerName: 'Profit %',
      cellStyle: (params) => {
        return { color: params.value >= 0 ? 'green' : 'red' };
      },
      valueFormatter: (params) => `${params.value.toFixed(2)}%`,
      filter: 'agNumberColumnFilter'
    },
    {
      headerName: 'Actions',
      cellRenderer: (params: any) => {
        return (
          <button 
            className="text-red-600 hover:text-red-800"
            onClick={() => handleRemoveStock(params.data.symbol)}
          >
            Remove
          </button>
        );
      }
    }
  ];

  const handleRemoveStock = (symbol: string) => {
    if (selectedPortfolio === null) return;
    
    removeStockFromPortfolio(selectedPortfolio, symbol);
    toast({
      title: "Success",
      description: `${symbol} has been removed from your portfolio`,
    });
  };

  const handleAddStockFormToggle = () => {
    setShowAddStockForm(!showAddStockForm);
  };

  if (!user) return null;

  // Calculate portfolio total value and profit
  const totalValue = portfolioData.reduce((sum, stock) => sum + stock.currentValue, 0);
  const totalCost = portfolioData.reduce((sum, stock) => sum + (stock.purchasePrice * stock.shares), 0);
  const totalProfit = totalValue - totalCost;
  const totalProfitPercentage = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex space-x-2">
            {user.portfolios.map((portfolio) => (
              <button
                key={portfolio.id}
                onClick={() => setSelectedPortfolio(portfolio.id)}
                className={`px-4 py-2 rounded ${
                  selectedPortfolio === portfolio.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {portfolio.name}
              </button>
            ))}
          </div>
        </div>

        {selectedPortfolio !== null && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Total Value</h3>
                <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Total Profit/Loss</h3>
                <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${totalProfit.toFixed(2)} ({totalProfitPercentage.toFixed(2)}%)
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Total Holdings</h3>
                <p className="text-2xl font-bold">{portfolioData.length} stocks</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Portfolio Performance</h2>
              </div>
              <div className="h-64">
                <PortfolioChart portfolioData={portfolioData} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Stock Holdings</h2>
                <button
                  onClick={handleAddStockFormToggle}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  {showAddStockForm ? 'Cancel' : 'Add Stock'}
                </button>
              </div>

              {showAddStockForm && selectedPortfolio !== null && (
                <div className="mb-6">
                  <AddStockForm 
                    portfolioId={selectedPortfolio} 
                    onSuccess={() => setShowAddStockForm(false)}
                  />
                </div>
              )}

              <div className="ag-theme-alpine w-full h-[500px]">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <p>Loading stock data...</p>
                  </div>
                ) : (
                  <AgGridReact
                    rowData={portfolioData}
                    columnDefs={columnDefs}
                    pagination={true}
                    paginationAutoPageSize={true}
                    animateRows={true}
                    defaultColDef={{
                      flex: 1,
                      minWidth: 100,
                      sortable: true,
                      resizable: true
                    }}
                  />
                )}
              </div>
            </div>
          </>
        )}

        {user.portfolios.length === 0 && (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <h2 className="text-xl font-semibold mb-4">You don't have any portfolios yet</h2>
            <p className="text-gray-600 mb-6">Create your first portfolio to start tracking your investments</p>
            <Link to="/profile" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">
              Create Portfolio
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
