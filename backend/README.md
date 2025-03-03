
# Stock Trading Advisor Backend

This is a Flask backend for the Stock Trading Advisor application. It provides APIs for user management, portfolio management, and stock data.

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the application:
   ```
   python app.py
   ```

The server will start on http://localhost:5000

## Default Test User

The system automatically creates a test user with the following credentials:
- Username: `admin`
- Password: `admin`

This user has two sample portfolios:
1. Tech Portfolio (with AAPL, MSFT, and GOOGL stocks)
2. Value Stocks (with JNJ and PG stocks)

## API Endpoints

### Authentication
- POST `/api/login` - Login with username and password
- POST `/api/register` - Register a new user

### Portfolios
- POST `/api/portfolios` - Create a new portfolio
- DELETE `/api/portfolios/<portfolio_id>` - Delete a portfolio

### Stocks
- GET `/api/stocks` - Get all available stocks
- GET `/api/stocks/search?query=<query>` - Search for stocks
- GET `/api/stocks/history/<symbol>?days=<days>` - Get price history for a stock
- POST `/api/stocks` - Add a stock to a portfolio
- DELETE `/api/stocks/<portfolio_id>/<symbol>` - Remove a stock from a portfolio

### Strategies
- GET `/api/strategies` - Get all trading strategies
- GET `/api/strategies/<id>` - Get a specific trading strategy
