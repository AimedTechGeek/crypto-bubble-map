import { useState } from 'react';

// Function to generate a random string of a given length
function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// Function to generate a random number in a given range
function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate the random values
const randomString = generateRandomString(4);
const randomNumber = generateRandomNumber(1, 200);

const Controls = ({ onAddBubble, onClear, onPopulateSample }) => {
    const [name, setName] = useState('');
    const [value, setValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name && value > 0) {
            onAddBubble({ name, value: +value });
            setName('');
            setValue('');
        }
    };

    return (
        <div className="w-full md:w-1/4 min-w-[300px] p-6 bg-white shadow-lg overflow-y-auto z-10">
            <h1 className="text-2xl font-bold mb-4">Bubble Map Controls</h1>
            <p className="text-sm text-gray-600 mb-6">Add data points. Bubbles will auto-size to fit perfectly in the center.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Location Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., New York"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="value" className="block text-sm font-medium text-gray-700">Value (determines size)</label>
                    <input
                        type="number"
                        id="value"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        min="1"
                        className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., 50"
                        required
                    />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
                    Add Bubble
                </button>
            </form>

            <hr className="my-6 border-gray-200" />

            <div className="space-y-2">
                <button onClick={onClear} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md">
                    Clear Map
                </button>
                <button onClick={onPopulateSample} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md">
                    Populate with Sample Data
                </button>
            </div>
        </div>
    );
};

export default Controls;
