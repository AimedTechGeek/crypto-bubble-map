/**
 * Utility functions for handling bubble interactions
 */

/**
 * Handle bubble click with single-click functionality
 * Single click will both copy to clipboard AND navigate to URL
 * @param {object} bubbleData - The bubble data object
 * @param {Event} event - The click event
 * @param {object} options - Options for click handling
 */
export function handleBubbleClick(bubbleData, event, options = {}) {
    try {
        // Safety checks
        if (!bubbleData) {
            console.warn('No bubbleData provided to handleBubbleClick');
            return;
        }
        
        if (!event) {
            console.warn('No event object provided to handleBubbleClick');
            return;
        }
        
        const { enableNavigation = true, enableCopyToClipboard = true } = options;
        
        console.log(`Single click on ${bubbleData.name} - performing both actions`);
        
        // Perform both actions on single click
        if (enableCopyToClipboard) {
            copyBubbleToClipboard(bubbleData, event);
        }
        
        if (enableNavigation && bubbleData.url) {
            // Add a small delay before navigation to ensure clipboard copy completes
            setTimeout(() => {
                navigateToBubbleUrl(bubbleData);
            }, 100);
        }        
    } catch (error) {
        console.error('Error in handleBubbleClick:', error, {
            bubbleData,
            eventType: event?.type,
            hasCurrentTarget: !!event?.currentTarget
        });
    }
}

/**
 * Navigate to the bubble's associated URL
 * @param {object} bubbleData - The bubble data object
 */
export function navigateToBubbleUrl(bubbleData) {
    if (!bubbleData.url) {
        console.warn('No URL available for bubble:', bubbleData.name);
        return;
    }
    
    try {
        // Open in new tab/window
        window.open(bubbleData.url, '_blank', 'noopener,noreferrer');
        console.log(`Navigating to ${bubbleData.type || 'unknown'} URL:`, bubbleData.url);
        
        // Show a subtle flash effect without scaling (to indicate navigation)
        showNavigationFeedback(bubbleData);
    } catch (error) {
        console.error('Failed to navigate to URL:', error);
    }
}

/**
 * Show subtle visual feedback for navigation without affecting zoom
 * @param {object} bubbleData - The bubble data object
 */
function showNavigationFeedback(bubbleData) {
    // Just show a console message or could add a toast notification
    console.log(`🔗 Opened ${bubbleData.name} in new tab`);
    
    // Optional: Could add a toast notification here instead of bubble animation
    // This avoids any zoom interference issues
}

/**
 * Copy bubble information to clipboard
 * @param {object} bubbleData - The bubble data object
 * @param {Event} event - The click event
 */
export function copyBubbleToClipboard(bubbleData, event) {
    // Create comprehensive text to copy
    const textToCopy = createBubbleText(bubbleData);
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        console.log('Copied to clipboard:', textToCopy);
        
        // Show visual feedback
        if (event && event.currentTarget) {
            showCopyFeedback(event.currentTarget, bubbleData);
        }
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

/**
 * Create formatted text from bubble data for clipboard
 * @param {object} bubbleData - The bubble data object
 * @returns {string} Formatted text
 */
function createBubbleText(bubbleData) {
    let text = `${bubbleData.name} (Value: ${bubbleData.value})`;
    
    if (bubbleData.url) {
        text += `\nURL: ${bubbleData.url}`;
    }
    
    if (bubbleData.metadata) {
        if (bubbleData.metadata.price) {
            text += `\nPrice: $${bubbleData.metadata.price}`;
        }
        if (bubbleData.metadata.description) {
            text += `\nDescription: ${bubbleData.metadata.description}`;
        }
    }
    
    return text;
}

/**
 * Show visual feedback when copying to clipboard
 * @param {Element} element - The bubble element
 * @param {object} bubbleData - The bubble data object
 */
function showCopyFeedback(element, bubbleData) {
    // Safety checks
    if (!element) {
        console.warn('No element provided for visual feedback');
        return;
    }
    
    // Try to get d3 from various sources
    let d3;
    if (typeof window !== 'undefined' && window.d3) {
        d3 = window.d3;
    } else {
        try {
            d3 = require('d3');
        } catch (e) {
            console.warn('D3 not available for visual feedback');
            return;
        }
    }
    
    if (!d3) {
        console.warn('D3 not available for visual feedback');
        return;
    }
    
    try {
        const groupElement = d3.select(element);
        
        // Check if element exists and is not exiting
        if (groupElement.empty() || groupElement.classed("exiting")) {
            return;
        }
        
        const circle = groupElement.select('.bubble-circle');
        if (circle.empty()) {
            console.warn('No bubble circle found for feedback');
            return;
        }
        
        const originalColor = circle.style('fill');
        const originalTransform = groupElement.attr('transform');
        
        // Different colors based on bubble type
        const feedbackColor = getBubbleTypeColor(bubbleData.type);
        
        // Enlarge and flash color
        groupElement.transition()
            .duration(150)
            .attr("transform", `${originalTransform} scale(1.1)`)
            .select('.bubble-circle')
            .style('fill', feedbackColor);
            
        // Return to original state
        groupElement.transition()
            .delay(200)
            .duration(300)
            .attr("transform", originalTransform)
            .select('.bubble-circle')
            .style('fill', originalColor);
    } catch (error) {
        console.error('Error in showCopyFeedback:', error);
    }
}

/**
 * Get color for feedback based on bubble type
 * @param {string} type - The bubble type
 * @returns {string} Color hex code
 */
function getBubbleTypeColor(type) {
    const typeColors = {
        'crypto': '#f59e0b', // Amber for crypto
        'stock': '#10b981',  // Green for stocks
        'city': '#3b82f6',   // Blue for cities
        'weather': '#06b6d4', // Cyan for weather
        'random': '#8b5cf6', // Purple for random
        'default': '#4ade80' // Light green for default
    };
    
    return typeColors[type] || typeColors.default;
}

/**
 * Get appropriate tooltip text for bubble based on type
 * @param {object} bubbleData - The bubble data object
 * @returns {string} Tooltip text
 */
export function getBubbleTooltip(bubbleData) {
    const baseText = `${bubbleData.name}: ${bubbleData.value}`;
    
    switch (bubbleData.type) {
        case 'crypto':
            return `${baseText}\nCryptocurrency\nClick to copy info + view on CoinGecko`;
        case 'stock':
            return `${baseText}\nStock\nClick to copy info + view on Yahoo Finance`;
        case 'city':
            return `${baseText}\nCity\nClick to copy info + view on Wikipedia`;
        case 'weather':
            return `${baseText}\nWeather Data\nClick to copy info + view details`;
        default:
            return `${baseText}\n${bubbleData.url ? 'Click to copy + visit URL' : 'Click to copy info'}`;
    }
}

/**
 * Clean up function (no longer needed but kept for compatibility)
 */
export function cleanupClickTimeouts() {
    // No cleanup needed for the simplified single-click approach
    console.log('Cleanup called - no timeouts to clear');
}
