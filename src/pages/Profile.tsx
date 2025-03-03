
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { useToast } from '../hooks/use-toast';

const Profile = () => {
  const { user, addPortfolio, removePortfolio } = useAuth();
  const navigate = useNavigate();
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const { toast } = useToast();

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleCreatePortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPortfolioName.trim()) {
      toast({
        title: "Error",
        description: "Portfolio name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    addPortfolio(newPortfolioName);
    setNewPortfolioName('');
    
    toast({
      title: "Success",
      description: "Portfolio created successfully",
    });
  };

  const handleRemovePortfolio = (id: number) => {
    if (confirm('Are you sure you want to delete this portfolio? This action cannot be undone.')) {
      removePortfolio(id);
      toast({
        title: "Success",
        description: "Portfolio deleted successfully",
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-gray-600">Manage your account and portfolios</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="text-lg">{user.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Username</h3>
              <p className="text-lg">{user.username}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="text-lg">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your Portfolios</h2>
          
          {user.portfolios.length > 0 ? (
            <div className="space-y-4">
              {user.portfolios.map((portfolio) => (
                <div key={portfolio.id} className="flex justify-between items-center p-4 border rounded">
                  <div>
                    <h3 className="font-medium">{portfolio.name}</h3>
                    <p className="text-sm text-gray-500">{portfolio.stocks.length} stocks</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleRemovePortfolio(portfolio.id)}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">You don't have any portfolios yet.</p>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Create New Portfolio</h3>
            <form onSubmit={handleCreatePortfolio} className="flex space-x-2">
              <input
                type="text"
                value={newPortfolioName}
                onChange={(e) => setNewPortfolioName(e.target.value)}
                placeholder="Portfolio Name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Create
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
