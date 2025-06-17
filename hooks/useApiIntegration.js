import { useState, useCallback } from 'react';
import { apiService } from '../services/apiService';

/**
 * Custom hook for API integration with bubble chart
 * Provides methods to fetch data from various APIs and add bubbles
 */
export function useApiIntegration() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastResponse, setLastResponse] = useState(null);

    /**
     * Generic API call handler with error handling and loading states
     */
    const makeApiCall = useCallback(async (apiFunction, ...args) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await apiFunction(...args);
            setLastResponse(result);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Fetch cryptocurrency data and add bubbles
     */
    const fetchCryptoData = useCallback((symbols) => {
        return makeApiCall(apiService.fetchCryptoData.bind(apiService), symbols);
    }, [makeApiCall]);

    /**
     * Fetch stock data and add bubbles
     */
    const fetchStockData = useCallback((symbols) => {
        return makeApiCall(apiService.fetchStockData.bind(apiService), symbols);
    }, [makeApiCall]);

    /**
     * Generic fetch and add bubble
     */
    const fetchAndAddBubble = useCallback((url, transformer) => {
        return makeApiCall(apiService.fetchAndAddBubble.bind(apiService), url, transformer);
    }, [makeApiCall]);

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        isLoading,
        error,
        lastResponse,
        fetchCryptoData,
        fetchStockData,
        fetchAndAddBubble,
        clearError
    };
}
