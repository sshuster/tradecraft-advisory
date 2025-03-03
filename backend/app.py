
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from werkzeug.security import generate_password_hash, check_password_hash
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database setup
DB_PATH = os.path.join(os.path.dirname(__file__), 'stock_advisor.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Create portfolios table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS portfolios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Create stocks table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS stocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        portfolio_id INTEGER NOT NULL,
        symbol TEXT NOT NULL,
        shares REAL NOT NULL,
        purchase_price REAL NOT NULL,
        purchase_date TEXT NOT NULL,
        FOREIGN KEY (portfolio_id) REFERENCES portfolios (id)
    )
    ''')
    
    # Check if admin user exists, create if not
    cursor.execute("SELECT * FROM users WHERE username = 'admin'")
    if not cursor.fetchone():
        admin_password = generate_password_hash('admin')
        cursor.execute(
            "INSERT INTO users (username, password, name, email) VALUES (?, ?, ?, ?)",
            ('admin', admin_password, 'Admin User', 'admin@example.com')
        )
        
        # Create sample portfolios for admin
        conn.commit()
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        admin_id = cursor.fetchone()[0]
        
        # Create Tech Portfolio
        cursor.execute(
            "INSERT INTO portfolios (user_id, name) VALUES (?, ?)",
            (admin_id, 'Tech Portfolio')
        )
        cursor.execute("SELECT id FROM portfolios WHERE user_id = ? AND name = ?", 
                       (admin_id, 'Tech Portfolio'))
        tech_portfolio_id = cursor.fetchone()[0]
        
        # Add stocks to Tech Portfolio
        stocks = [
            (tech_portfolio_id, 'AAPL', 10, 150, '2023-01-05'),
            (tech_portfolio_id, 'MSFT', 5, 280, '2023-02-10'),
            (tech_portfolio_id, 'GOOGL', 2, 2700, '2023-03-15')
        ]
        cursor.executemany(
            "INSERT INTO stocks (portfolio_id, symbol, shares, purchase_price, purchase_date) VALUES (?, ?, ?, ?, ?)",
            stocks
        )
        
        # Create Value Stocks Portfolio
        cursor.execute(
            "INSERT INTO portfolios (user_id, name) VALUES (?, ?)",
            (admin_id, 'Value Stocks')
        )
        cursor.execute("SELECT id FROM portfolios WHERE user_id = ? AND name = ?", 
                       (admin_id, 'Value Stocks'))
        value_portfolio_id = cursor.fetchone()[0]
        
        # Add stocks to Value Stocks Portfolio
        stocks = [
            (value_portfolio_id, 'JNJ', 8, 160, '2023-01-20'),
            (value_portfolio_id, 'PG', 7, 140, '2023-02-25')
        ]
        cursor.executemany(
            "INSERT INTO stocks (portfolio_id, symbol, shares, purchase_price, purchase_date) VALUES (?, ?, ?, ?, ?)",
            stocks
        )
    
    conn.commit()
    conn.close()

# Initialize database
init_db()

# Helper functions
def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = dict_factory
    return conn

# Routes
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    
    if not user or not check_password_hash(user['password'], password):
        conn.close()
        return jsonify({'error': 'Invalid username or password'}), 401
    
    # Get user portfolios
    cursor.execute("SELECT * FROM portfolios WHERE user_id = ?", (user['id'],))
    portfolios = cursor.fetchall()
    
    # Get stocks for each portfolio
    for portfolio in portfolios:
        cursor.execute("SELECT * FROM stocks WHERE portfolio_id = ?", (portfolio['id'],))
        portfolio['stocks'] = cursor.fetchall()
    
    # Remove password from user object
    user.pop('password', None)
    user['portfolios'] = portfolios
    
    conn.close()
    return jsonify({'user': user}), 200

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    name = data.get('name')
    email = data.get('email')
    
    if not username or not password or not name or not email:
        return jsonify({'error': 'All fields are required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if username already exists
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Username already exists'}), 409
    
    # Check if email already exists
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Email already exists'}), 409
    
    # Create new user
    hashed_password = generate_password_hash(password)
    cursor.execute(
        "INSERT INTO users (username, password, name, email) VALUES (?, ?, ?, ?)",
        (username, hashed_password, name, email)
    )
    conn.commit()
    
    # Get the new user's ID
    cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
    user_id = cursor.fetchone()['id']
    
    # Create user object to return
    user = {
        'id': user_id,
        'username': username,
        'name': name,
        'email': email,
        'portfolios': []
    }
    
    conn.close()
    return jsonify({'user': user}), 201

@app.route('/api/portfolios', methods=['POST'])
def add_portfolio():
    data = request.json
    user_id = data.get('user_id')
    name = data.get('name')
    
    if not user_id or not name:
        return jsonify({'error': 'User ID and portfolio name are required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "INSERT INTO portfolios (user_id, name) VALUES (?, ?)",
        (user_id, name)
    )
    conn.commit()
    
    # Get the new portfolio ID
    cursor.execute("SELECT last_insert_rowid()")
    portfolio_id = cursor.fetchone()['last_insert_rowid()']
    
    # Create portfolio object to return
    portfolio = {
        'id': portfolio_id,
        'user_id': user_id,
        'name': name,
        'stocks': []
    }
    
    conn.close()
    return jsonify({'portfolio': portfolio}), 201

@app.route('/api/portfolios/<int:portfolio_id>', methods=['DELETE'])
def delete_portfolio(portfolio_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Delete all stocks in the portfolio
    cursor.execute("DELETE FROM stocks WHERE portfolio_id = ?", (portfolio_id,))
    
    # Delete the portfolio
    cursor.execute("DELETE FROM portfolios WHERE id = ?", (portfolio_id,))
    conn.commit()
    
    conn.close()
    return jsonify({'message': 'Portfolio deleted successfully'}), 200

@app.route('/api/stocks', methods=['POST'])
def add_stock():
    data = request.json
    portfolio_id = data.get('portfolio_id')
    symbol = data.get('symbol')
    shares = data.get('shares')
    purchase_price = data.get('purchase_price')
    purchase_date = data.get('purchase_date')
    
    if not all([portfolio_id, symbol, shares, purchase_price, purchase_date]):
        return jsonify({'error': 'All stock details are required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if the stock already exists in the portfolio
    cursor.execute(
        "SELECT id FROM stocks WHERE portfolio_id = ? AND symbol = ?",
        (portfolio_id, symbol)
    )
    existing_stock = cursor.fetchone()
    
    if existing_stock:
        # Update existing stock
        cursor.execute(
            "UPDATE stocks SET shares = ?, purchase_price = ?, purchase_date = ? WHERE id = ?",
            (shares, purchase_price, purchase_date, existing_stock['id'])
        )
    else:
        # Add new stock
        cursor.execute(
            "INSERT INTO stocks (portfolio_id, symbol, shares, purchase_price, purchase_date) VALUES (?, ?, ?, ?, ?)",
            (portfolio_id, symbol, shares, purchase_price, purchase_date)
        )
    
    conn.commit()
    
    # Get the stock ID
    if existing_stock:
        stock_id = existing_stock['id']
    else:
        cursor.execute("SELECT last_insert_rowid()")
        stock_id = cursor.fetchone()['last_insert_rowid()']
    
    # Create stock object to return
    stock = {
        'id': stock_id,
        'portfolio_id': portfolio_id,
        'symbol': symbol,
        'shares': shares,
        'purchase_price': purchase_price,
        'purchase_date': purchase_date
    }
    
    conn.close()
    return jsonify({'stock': stock}), 201

@app.route('/api/stocks/<int:portfolio_id>/<string:symbol>', methods=['DELETE'])
def delete_stock(portfolio_id, symbol):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "DELETE FROM stocks WHERE portfolio_id = ? AND symbol = ?",
        (portfolio_id, symbol)
    )
    conn.commit()
    
    conn.close()
    return jsonify({'message': 'Stock deleted successfully'}), 200

@app.route('/api/stocks', methods=['GET'])
def get_stocks():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get all stocks from the mock data
    stocks = [
        {"symbol": "AAPL", "name": "Apple Inc.", "price": 180.95, "change": 2.30},
        {"symbol": "MSFT", "name": "Microsoft Corporation", "price": 325.14, "change": 4.25},
        {"symbol": "GOOGL", "name": "Alphabet Inc.", "price": 2950.12, "change": 15.72},
        {"symbol": "AMZN", "name": "Amazon.com Inc.", "price": 3550.50, "change": -12.30},
        {"symbol": "TSLA", "name": "Tesla, Inc.", "price": 950.75, "change": 28.15},
        {"symbol": "META", "name": "Meta Platforms, Inc.", "price": 330.42, "change": -5.18},
        {"symbol": "NFLX", "name": "Netflix, Inc.", "price": 620.83, "change": 8.94},
        {"symbol": "NVDA", "name": "NVIDIA Corporation", "price": 780.25, "change": 22.40},
        {"symbol": "JNJ", "name": "Johnson & Johnson", "price": 175.32, "change": 1.15},
        {"symbol": "PG", "name": "Procter & Gamble Co.", "price": 162.80, "change": 0.75},
        {"symbol": "V", "name": "Visa Inc.", "price": 240.35, "change": 3.25},
        {"symbol": "JPM", "name": "JPMorgan Chase & Co.", "price": 155.48, "change": -1.22},
        {"symbol": "UNH", "name": "UnitedHealth Group Inc.", "price": 480.92, "change": 5.20},
        {"symbol": "HD", "name": "The Home Depot, Inc.", "price": 340.65, "change": -2.35},
        {"symbol": "PFE", "name": "Pfizer Inc.", "price": 48.75, "change": 0.65}
    ]
    
    conn.close()
    return jsonify(stocks), 200

@app.route('/api/stocks/search', methods=['GET'])
def search_stocks():
    query = request.args.get('query', '')
    
    if not query:
        return jsonify([]), 200
    
    conn = get_db_connection()
    
    # Use the mock data and filter by query
    stocks = [
        {"symbol": "AAPL", "name": "Apple Inc.", "price": 180.95, "change": 2.30},
        {"symbol": "MSFT", "name": "Microsoft Corporation", "price": 325.14, "change": 4.25},
        {"symbol": "GOOGL", "name": "Alphabet Inc.", "price": 2950.12, "change": 15.72},
        {"symbol": "AMZN", "name": "Amazon.com Inc.", "price": 3550.50, "change": -12.30},
        {"symbol": "TSLA", "name": "Tesla, Inc.", "price": 950.75, "change": 28.15},
        {"symbol": "META", "name": "Meta Platforms, Inc.", "price": 330.42, "change": -5.18},
        {"symbol": "NFLX", "name": "Netflix, Inc.", "price": 620.83, "change": 8.94},
        {"symbol": "NVDA", "name": "NVIDIA Corporation", "price": 780.25, "change": 22.40},
        {"symbol": "JNJ", "name": "Johnson & Johnson", "price": 175.32, "change": 1.15},
        {"symbol": "PG", "name": "Procter & Gamble Co.", "price": 162.80, "change": 0.75},
        {"symbol": "V", "name": "Visa Inc.", "price": 240.35, "change": 3.25},
        {"symbol": "JPM", "name": "JPMorgan Chase & Co.", "price": 155.48, "change": -1.22},
        {"symbol": "UNH", "name": "UnitedHealth Group Inc.", "price": 480.92, "change": 5.20},
        {"symbol": "HD", "name": "The Home Depot, Inc.", "price": 340.65, "change": -2.35},
        {"symbol": "PFE", "name": "Pfizer Inc.", "price": 48.75, "change": 0.65}
    ]
    
    filtered_stocks = [
        stock for stock in stocks 
        if query.lower() in stock['symbol'].lower() or query.lower() in stock['name'].lower()
    ]
    
    conn.close()
    return jsonify(filtered_stocks), 200

@app.route('/api/stocks/history/<string:symbol>', methods=['GET'])
def get_stock_history(symbol):
    days = request.args.get('days', 30, type=int)
    
    # Generate mock historical data
    history = []
    today = datetime.now()
    
    # Find the stock in our mock data
    stocks = [
        {"symbol": "AAPL", "name": "Apple Inc.", "price": 180.95, "change": 2.30},
        {"symbol": "MSFT", "name": "Microsoft Corporation", "price": 325.14, "change": 4.25},
        {"symbol": "GOOGL", "name": "Alphabet Inc.", "price": 2950.12, "change": 15.72},
        {"symbol": "AMZN", "name": "Amazon.com Inc.", "price": 3550.50, "change": -12.30},
        {"symbol": "TSLA", "name": "Tesla, Inc.", "price": 950.75, "change": 28.15},
        {"symbol": "META", "name": "Meta Platforms, Inc.", "price": 330.42, "change": -5.18},
        {"symbol": "NFLX", "name": "Netflix, Inc.", "price": 620.83, "change": 8.94},
        {"symbol": "NVDA", "name": "NVIDIA Corporation", "price": 780.25, "change": 22.40},
        {"symbol": "JNJ", "name": "Johnson & Johnson", "price": 175.32, "change": 1.15},
        {"symbol": "PG", "name": "Procter & Gamble Co.", "price": 162.80, "change": 0.75},
        {"symbol": "V", "name": "Visa Inc.", "price": 240.35, "change": 3.25},
        {"symbol": "JPM", "name": "JPMorgan Chase & Co.", "price": 155.48, "change": -1.22},
        {"symbol": "UNH", "name": "UnitedHealth Group Inc.", "price": 480.92, "change": 5.20},
        {"symbol": "HD", "name": "The Home Depot, Inc.", "price": 340.65, "change": -2.35},
        {"symbol": "PFE", "name": "Pfizer Inc.", "price": 48.75, "change": 0.65}
    ]
    
    stock = next((s for s in stocks if s['symbol'] == symbol), None)
    
    if not stock:
        return jsonify([]), 404
    
    price = stock['price']
    
    for i in range(days, -1, -1):
        date = today.replace(day=today.day - i)
        # Generate a random price change within ±3%
        change = price * (0.06 * (0.5 - (datetime.now().microsecond / 1000000)))
        price = max(price + change, 1)  # Ensure price doesn't go below 1
        
        history.append({
            'date': date.strftime('%Y-%m-%d'),
            'price': round(price, 2)
        })
    
    return jsonify(history), 200

@app.route('/api/strategies', methods=['GET'])
def get_strategies():
    # Return the mock strategies
    strategies = [
        {
            'id': 1,
            'name': 'Blue Chip Growth',
            'description': 'Focus on established, industry-leading companies with strong growth potential.',
            'riskLevel': 'Medium',
            'expectedReturn': '8-12%',
            'recommendedStocks': ['AAPL', 'MSFT', 'JNJ', 'PG', 'V']
        },
        {
            'id': 2,
            'name': 'Tech Innovation',
            'description': 'Invest in cutting-edge technology companies poised for rapid growth.',
            'riskLevel': 'High',
            'expectedReturn': '12-20%',
            'recommendedStocks': ['TSLA', 'NVDA', 'GOOGL', 'META', 'AMZN']
        },
        {
            'id': 3,
            'name': 'Value Investing',
            'description': 'Target undervalued stocks with strong fundamentals and dividends.',
            'riskLevel': 'Low',
            'expectedReturn': '5-8%',
            'recommendedStocks': ['JNJ', 'PG', 'JPM', 'HD', 'UNH']
        },
        {
            'id': 4,
            'name': 'Dividend Income',
            'description': 'Focus on companies with consistent dividend payments and growth.',
            'riskLevel': 'Low',
            'expectedReturn': '4-6%',
            'recommendedStocks': ['PFE', 'JNJ', 'PG', 'JPM', 'HD']
        }
    ]
    
    return jsonify(strategies), 200

@app.route('/api/strategies/<int:id>', methods=['GET'])
def get_strategy(id):
    # Find the strategy by ID
    strategies = [
        {
            'id': 1,
            'name': 'Blue Chip Growth',
            'description': 'Focus on established, industry-leading companies with strong growth potential.',
            'riskLevel': 'Medium',
            'expectedReturn': '8-12%',
            'recommendedStocks': ['AAPL', 'MSFT', 'JNJ', 'PG', 'V']
        },
        {
            'id': 2,
            'name': 'Tech Innovation',
            'description': 'Invest in cutting-edge technology companies poised for rapid growth.',
            'riskLevel': 'High',
            'expectedReturn': '12-20%',
            'recommendedStocks': ['TSLA', 'NVDA', 'GOOGL', 'META', 'AMZN']
        },
        {
            'id': 3,
            'name': 'Value Investing',
            'description': 'Target undervalued stocks with strong fundamentals and dividends.',
            'riskLevel': 'Low',
            'expectedReturn': '5-8%',
            'recommendedStocks': ['JNJ', 'PG', 'JPM', 'HD', 'UNH']
        },
        {
            'id': 4,
            'name': 'Dividend Income',
            'description': 'Focus on companies with consistent dividend payments and growth.',
            'riskLevel': 'Low',
            'expectedReturn': '4-6%',
            'recommendedStocks': ['PFE', 'JNJ', 'PG', 'JPM', 'HD']
        }
    ]
    
    strategy = next((s for s in strategies if s['id'] == id), None)
    
    if not strategy:
        return jsonify({'error': 'Strategy not found'}), 404
    
    return jsonify(strategy), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
