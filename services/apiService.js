import { triggerAddBubble } from '../utils/bubbleApi';

/**
 * API Service for handling external data sources and API calls
 * This service fetches data and automatically adds bubbles to the chart
 */
class ApiService {
    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.example.com';
    }

    /**
     * Fetch cryptocurrency data and add bubbles
     * @param {Array} symbols - Array of crypto symbols to fetch
     */
    async fetchCryptoData(symbols = ['BTC', 'ETH', 'ADA']) {
        try {
            console.log('Fetching crypto data for symbols:', symbols);
            
            // Example API call (replace with your actual API)
            const promises = symbols.map(symbol => 
                this.fetchSingleCrypto(symbol)
            );
            
            const cryptoData = await Promise.all(promises);
            
            // Process each crypto and add as bubble
            cryptoData.forEach(crypto => {
                if (crypto) {
                    const bubbleData = this.transformCryptoToBubble(crypto);
                    triggerAddBubble(bubbleData);
                }
            });
            
            return cryptoData;
        } catch (error) {
            console.error('Error fetching crypto data:', error);
            throw error;
        }
    }

    /**
     * Fetch data for a single cryptocurrency
     * @param {string} symbol - Crypto symbol (e.g., 'BTC')
     */
    async fetchSingleCrypto(symbol) {
        try {
            // Example using CoinGecko API (free tier)
            const response = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return { symbol, ...data[symbol] };
        } catch (error) {
            console.error(`Error fetching data for ${symbol}:`, error);
            return null;
        }
    }    /**
     * Transform crypto API response to bubble format
     * @param {object} crypto - Crypto data from API
     */
    transformCryptoToBubble(crypto) {
        const symbol = crypto.symbol.toUpperCase();
        return {
            name: symbol,
            value: Math.round(crypto.market_cap / 1000000000) || Math.round(crypto.usd * 10), // Market cap in billions or price * 10
            type: 'crypto',
            url: `https://www.coingecko.com/en/coins/${crypto.symbol}`,
            metadata: {
                price: crypto.usd,
                change24h: crypto.usd_24h_change,
                marketCap: crypto.market_cap,
                description: `${symbol} Cryptocurrency`
            }
        };
    }

    /**
     * Fetch stock data and add bubbles
     * @param {Array} symbols - Array of stock symbols
     */
    async fetchStockData(symbols = ['AAPL', 'GOOGL', 'MSFT']) {
        try {
            console.log('Fetching stock data for symbols:', symbols);
            
            // Example implementation (replace with your stock API)
            const stockData = await this.fetchMultipleStocks(symbols);
            
            stockData.forEach(stock => {
                if (stock) {
                    const bubbleData = this.transformStockToBubble(stock);
                    triggerAddBubble(bubbleData);
                }
            });
            
            return stockData;
        } catch (error) {
            console.error('Error fetching stock data:', error);
            throw error;
        }
    }

    /**
     * Fetch multiple stocks (placeholder - implement with your preferred API)
     */
    async fetchMultipleStocks(symbols) {
        // Placeholder implementation
        // Replace with actual stock API like Alpha Vantage, Yahoo Finance, etc.
        return symbols.map(symbol => ({
            symbol,
            price: Math.random() * 500 + 50,
            marketCap: Math.random() * 2000000000000,
            change: (Math.random() - 0.5) * 10
        }));
    }    /**
     * Transform stock data to bubble format
     */
    transformStockToBubble(stock) {
        return {
            name: stock.symbol,
            value: Math.round(stock.marketCap / 1000000000) || Math.round(stock.price), // Market cap in billions
            type: 'stock',
            url: `https://finance.yahoo.com/quote/${stock.symbol}`,
            metadata: {
                price: stock.price,
                change: stock.change,
                marketCap: stock.marketCap,
                description: `${stock.symbol} Stock Quote`
            }
        };
    }

    /**
     * Generic method to fetch any API and add bubble
     * @param {string} url - API endpoint
     * @param {function} transformer - Function to transform API response to bubble format
     */
    async fetchAndAddBubble(url, transformer) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const bubbleData = transformer(data);
            
            if (bubbleData) {
                triggerAddBubble(bubbleData);
            }
            
            return data;
        } catch (error) {
            console.error('Error in fetchAndAddBubble:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const apiService = new ApiService();
export default ApiService;
