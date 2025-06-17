/**
 * This function broadcasts a custom event on the window object.
 * The main React component will listen for this event to add a new bubble.
 * @param {object} bubbleData - The data for the new bubble (e.g., { name: 'New Place', value: 50 }).
 */
export function triggerAddBubble(bubbleData) {
  if (!bubbleData || !bubbleData.name || !bubbleData.value) {
    console.error("Invalid bubble data provided to triggerAddBubble");
    return;
  }

  // Create a new custom event with the bubble data in the 'detail' property.
  const event = new CustomEvent('add-bubble-external', { detail: bubbleData });

  // Dispatch the event on the window, making it globally available.
  window.dispatchEvent(event);
}