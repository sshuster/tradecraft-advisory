
import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ColDef } from 'ag-grid-community';
import Layout from '../components/Layout';
import { getStocks } from '../services/stockService';
import { useToast } from '../hooks/use-toast';

type Stock = {
  symbol: string;
  name: string;
  price: number;
  change: number;
};

const Market = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const loadStocks = async () => {
      try {
        const data = await getStocks();
        setStocks(data);
      } catch (error) {
        console.error('Error loading stocks:', error);
        toast({
          title: "Error",
          description: "Failed to load market data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadStocks();
  }, [toast]);

  const filteredStocks = stocks.filter(
    stock => 
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columnDefs: ColDef[] = [
    { field: 'symbol', headerName: 'Symbol', sortable: true, filter: true },
    { field: 'name', headerName: 'Company Name', sortable: true, filter: true, flex: 2 },
    { 
      field: 'price', 
      headerName: 'Price', 
      sortable: true, 
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => `$${params.value.toFixed(2)}`
    },
    { 
      field: 'change', 
      headerName: 'Change',
      sortable: true, 
      filter: 'agNumberColumnFilter',
      cellStyle: (params) => {
        return { color: params.value >= 0 ? 'green' : 'red' };
      },
      valueFormatter: (params) => `${params.value > 0 ? '+' : ''}${params.value.toFixed(2)}`
    },
    { 
      field: 'changePercent', 
      headerName: 'Change %',
      sortable: true,
      valueGetter: (params) => {
        const stock = params.data;
        return ((stock.change / (stock.price - stock.change)) * 100);
      },
      cellStyle: (params) => {
        return { color: params.value >= 0 ? 'green' : 'red' };
      },
      valueFormatter: (params) => `${params.value > 0 ? '+' : ''}${params.value.toFixed(2)}%`
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Market Overview</h1>
          <p className="text-gray-600">View current stock prices and market trends</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search stocks by symbol or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="ag-theme-alpine w-full h-[600px]">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500">Loading market data...</p>
              </div>
            ) : (
              <AgGridReact
                rowData={filteredStocks}
                columnDefs={columnDefs}
                pagination={true}
                paginationAutoPageSize={true}
                animateRows={true}
                defaultColDef={{
                  flex: 1,
                  minWidth: 100,
                  sortable: true,
                  resizable: true,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Market;
