/**
 * Utility functions for generating random data for bubbles
 */

/**
 * Generate a random string of a given length
 * @param {number} length - The length of the string to generate
 * @returns {string} Random string
 */
export function generateRandomString(length = 4) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * Generate a random number in a given range
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random number in range
 */
export function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random bubble data object
 * @param {number} nameLength - Length of the random name
 * @param {number} minValue - Minimum value for the bubble
 * @param {number} maxValue - Maximum value for the bubble
 * @returns {object} Random bubble data
 */
export function generateRandomBubble(nameLength = 4, minValue = 1, maxValue = 200) {
    return {
        name: generateRandomString(nameLength),
        value: generateRandomNumber(minValue, maxValue)
    };
}
