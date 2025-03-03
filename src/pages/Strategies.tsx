
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getStrategies } from '../services/stockService';
import { useToast } from '../hooks/use-toast';

type Strategy = {
  id: number;
  name: string;
  description: string;
  riskLevel: string;
  expectedReturn: string;
  recommendedStocks: string[];
};

const Strategies = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadStrategies = async () => {
      try {
        const data = await getStrategies();
        setStrategies(data);
      } catch (error) {
        console.error('Error loading strategies:', error);
        toast({
          title: "Error",
          description: "Failed to load trading strategies",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadStrategies();
  }, [toast]);

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Trading Strategies</h1>
          <p className="text-gray-600">Explore different trading strategies for your portfolio</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading strategies...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {strategies.map((strategy) => (
              <div key={strategy.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold mb-2">{strategy.name}</h2>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(strategy.riskLevel)}`}>
                      {strategy.riskLevel} Risk
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{strategy.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Expected Return:</span>
                      <span className="ml-2 text-sm font-semibold">{strategy.expectedReturn}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Recommended Stocks:</h3>
                    <div className="flex flex-wrap gap-2">
                      {strategy.recommendedStocks.map((symbol) => (
                        <span key={symbol} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Strategies;
