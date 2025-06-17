import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing bubble chart state and operations
 * Separates state management logic from UI components
 */
export function useBubbleState(initialData = []) {
    const [mapData, setMapData] = useState(initialData);
    const [updatedBubbleName, setUpdatedBubbleName] = useState(null);

    /**
     * Add or update a bubble in the map
     * @param {object} newBubble - The bubble to add/update
     */
    const addOrUpdateBubble = useCallback((newBubble) => {
        setUpdatedBubbleName(null);
        const bubbleExists = mapData.some(d => d.name === newBubble.name);

        if (bubbleExists) {
            setMapData(prevData =>
                prevData.map(d =>
                    d.name === newBubble.name ? { ...d, value: newBubble.value } : d
                )
            );
            setUpdatedBubbleName(newBubble.name);
        } else {
            setMapData(prevData => [...prevData, newBubble]);
        }
    }, [mapData]);

    /**
     * Clear all bubbles from the map
     */
    const clearBubbles = useCallback(() => {
        setMapData([]);
        setUpdatedBubbleName(null);
    }, []);

    /**
     * Populate map with provided sample data
     * @param {Array} sampleData - Array of bubble data
     */
    const populateWithSampleData = useCallback((sampleData) => {
        setMapData([...sampleData]);
        setUpdatedBubbleName(null);
    }, []);

    return {
        mapData,
        updatedBubbleName,
        addOrUpdateBubble,
        clearBubbles,
        populateWithSampleData
    };
}
