import { useState } from 'react';
import { apiService } from '../services/apiService';

/**
 * Component for triggering API calls that add bubbles to the chart
 * Demonstrates integration between API responses and bubble visualization
 */
const ApiControls = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [lastApiCall, setLastApiCall] = useState(null);

    /**
     * Fetch cryptocurrency data and add bubbles
     */
    const handleFetchCrypto = async () => {
        setIsLoading(true);
        try {
            await apiService.fetchCryptoData(['bitcoin', 'ethereum', 'cardano']);
            setLastApiCall('Crypto data fetched and bubbles added!');
        } catch (error) {
            setLastApiCall(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Fetch stock data and add bubbles
     */
    const handleFetchStocks = async () => {
        setIsLoading(true);
        try {
            await apiService.fetchStockData(['AAPL', 'GOOGL', 'MSFT', 'TSLA']);
            setLastApiCall('Stock data fetched and bubbles added!');
        } catch (error) {
            setLastApiCall(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Example of custom API integration
     */
    const handleCustomApi = async () => {
        setIsLoading(true);
        try {
            // Example: Weather API that creates bubbles for different cities
            await apiService.fetchAndAddBubble(
                'https://api.openweathermap.org/data/2.5/group?id=524901,703448,2643743&units=metric&appid=YOUR_API_KEY',
                (weatherData) => {
                    // Transform weather data to bubble format
                    if (weatherData.list && weatherData.list.length > 0) {
                        const city = weatherData.list[0];
                        return {
                            name: city.name,
                            value: Math.round(city.main.temp + 50), // Convert temp to positive bubble size
                            metadata: {
                                temperature: city.main.temp,
                                humidity: city.main.humidity,
                                description: city.weather[0].description
                            }
                        };
                    }
                    return null;
                }
            );
            setLastApiCall('Weather data fetched and bubble added!');
        } catch (error) {
            setLastApiCall(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-blue-800">API Integration Controls</h3>
            <p className="text-sm text-blue-600 mb-4">
                These buttons fetch real data from APIs and automatically add bubbles to the chart.
            </p>
            
            <div className="space-y-3">
                <button
                    onClick={handleFetchCrypto}
                    disabled={isLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition duration-150"
                >
                    {isLoading ? 'Loading...' : 'Fetch Crypto Prices'}
                </button>
                
                <button
                    onClick={handleFetchStocks}
                    disabled={isLoading}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition duration-150"
                >
                    {isLoading ? 'Loading...' : 'Fetch Stock Data'}
                </button>
                
                <button
                    onClick={handleCustomApi}
                    disabled={isLoading}
                    className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition duration-150"
                >
                    {isLoading ? 'Loading...' : 'Fetch Weather Data'}
                </button>
            </div>

            {lastApiCall && (
                <div className="mt-4 p-3 bg-white rounded border-l-4 border-blue-500">
                    <p className="text-sm text-gray-700">{lastApiCall}</p>
                </div>
            )}
        </div>
    );
};

export default ApiControls;
