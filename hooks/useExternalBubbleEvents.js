import { useEffect } from 'react';

/**
 * Custom hook for handling external bubble events
 * Separates event handling logic from main component
 */
export function useExternalBubbleEvents(onAddBubble, dependencies = []) {
    useEffect(() => {
        const handleExternalAdd = (event) => {
            console.log("Received external request to add bubble:", event.detail);
            onAddBubble(event.detail);
        };

        // Set up the event listener for external calls
        window.addEventListener('add-bubble-external', handleExternalAdd);

        // Cleanup function to remove the listener when the component unmounts
        return () => {
            window.removeEventListener('add-bubble-external', handleExternalAdd);
        };
    }, dependencies);
}
