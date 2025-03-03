
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="py-12 px-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Smart Trading Strategies for Modern Investors
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover, track, and implement proven stock trading strategies that match your risk profile and financial goals.
            </p>
            {user ? (
              <Link
                to="/dashboard"
                className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex justify-center space-x-4">
                <Link
                  to="/register"
                  className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="inline-block px-6 py-3 bg-white text-primary border border-primary font-medium rounded-md hover:bg-gray-50"
                >
                  Log In
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl text-primary mb-4">📈</div>
            <h2 className="text-xl font-semibold mb-2">Diverse Trading Strategies</h2>
            <p className="text-gray-600">
              Explore various proven trading strategies tailored for different market conditions and risk profiles.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl text-primary mb-4">📊</div>
            <h2 className="text-xl font-semibold mb-2">Portfolio Tracking</h2>
            <p className="text-gray-600">
              Track your investments and measure performance against benchmarks with intuitive visualizations.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl text-primary mb-4">🔍</div>
            <h2 className="text-xl font-semibold mb-2">Market Insights</h2>
            <p className="text-gray-600">
              Stay updated with market trends, stock movements, and expert recommendations.
            </p>
          </div>
        </div>

        {/* Strategies Overview */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Featured Trading Strategies</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Blue Chip Growth</h3>
              <p className="text-gray-600 mb-3">
                Focus on established, industry-leading companies with strong growth potential.
              </p>
              <div className="flex justify-between items-center">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Low Risk</span>
                <Link to="/strategies" className="text-primary text-sm font-medium hover:underline">
                  Learn more →
                </Link>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Tech Innovation</h3>
              <p className="text-gray-600 mb-3">
                Invest in cutting-edge technology companies poised for rapid growth.
              </p>
              <div className="flex justify-between items-center">
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">High Risk</span>
                <Link to="/strategies" className="text-primary text-sm font-medium hover:underline">
                  Learn more →
                </Link>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <Link
              to="/strategies"
              className="inline-block px-4 py-2 bg-gray-100 text-gray-800 font-medium rounded-md hover:bg-gray-200"
            >
              View All Strategies
            </Link>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-primary text-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Optimize Your Investment Strategy?</h2>
          <p className="text-lg mb-6">
            Join thousands of investors who are already using our platform to make smarter trading decisions.
          </p>
          {user ? (
            <Link
              to="/dashboard"
              className="inline-block px-6 py-3 bg-white text-primary font-medium rounded-md hover:bg-gray-100"
            >
              Go to Your Dashboard
            </Link>
          ) : (
            <Link
              to="/register"
              className="inline-block px-6 py-3 bg-white text-primary font-medium rounded-md hover:bg-gray-100"
            >
              Get Started Today
            </Link>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
