
import React, { useState } from 'react';
import { useAuth, Stock } from '../contexts/AuthContext';
import { searchStocks } from '../services/stockService';
import { useToast } from '../hooks/use-toast';

interface AddStockFormProps {
  portfolioId: number;
  onSuccess: () => void;
}

const AddStockForm: React.FC<AddStockFormProps> = ({ portfolioId, onSuccess }) => {
  const [formData, setFormData] = useState<{
    symbol: string;
    shares: number;
    purchase_price: number;
    purchase_date: string;
  }>({
    symbol: '',
    shares: 1,
    purchase_price: 0,
    purchase_date: new Date().toISOString().split('T')[0],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ symbol: string; name: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { addStockToPortfolio } = useAuth();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'shares' ? parseInt(value) || 0 : 
               name === 'purchase_price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setFormData(prev => ({ ...prev, symbol: value }));
    setSearchQuery(value);
    
    if (value.length >= 1) {
      handleSearch(value);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query) return;
    
    setIsSearching(true);
    try {
      const results = await searchStocks(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching stocks:', error);
      toast({
        title: "Error",
        description: "Failed to search for stocks",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectStock = (symbol: string) => {
    setFormData(prev => ({ ...prev, symbol }));
    setSearchResults([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.symbol) {
      toast({
        title: "Error",
        description: "Please enter a stock symbol",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.shares <= 0) {
      toast({
        title: "Error",
        description: "Number of shares must be greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.purchase_price <= 0) {
      toast({
        title: "Error",
        description: "Purchase price must be greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    addStockToPortfolio(portfolioId, formData);
    toast({
      title: "Success",
      description: `${formData.symbol} has been added to your portfolio`,
    });
    onSuccess();
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
      <h3 className="text-lg font-medium mb-4">Add Stock to Portfolio</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-1">
              Stock Symbol
            </label>
            <input
              id="symbol"
              name="symbol"
              type="text"
              value={formData.symbol}
              onChange={handleSymbolChange}
              required
              placeholder="AAPL"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                {searchResults.map((result) => (
                  <div
                    key={result.symbol}
                    onClick={() => handleSelectStock(result.symbol)}
                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <span className="font-medium block truncate">{result.symbol}</span>
                      <span className="text-gray-500 ml-2 block truncate">{result.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {isSearching && <div className="mt-1 text-sm text-gray-500">Searching...</div>}
          </div>
          
          <div>
            <label htmlFor="shares" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Shares
            </label>
            <input
              id="shares"
              name="shares"
              type="number"
              min="1"
              value={formData.shares}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div>
            <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Price ($)
            </label>
            <input
              id="purchase_price"
              name="purchase_price"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.purchase_price}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div>
            <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Date
            </label>
            <input
              id="purchase_date"
              name="purchase_date"
              type="date"
              value={formData.purchase_date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onSuccess}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Add Stock
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStockForm;
