
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

const Controls = ({ onAddBubble, onClear, onPopulateSample }) => {
   
    const handleSubmit = (e) => {
        e.preventDefault();

        // Generate the random values
        const randomString = generateRandomString(4);
        const randomNumber = generateRandomNumber(1, 200);
        console.log(`Adding bubble with name: ${randomString}, value: ${randomNumber}`);
        onAddBubble({ name: randomString, value: randomNumber });
    };

    return (
        <div className="w-full md:w-1/4 min-w-[300px] p-6 bg-white shadow-lg overflow-y-auto z-10">
            <h1 className="text-2xl font-bold mb-4">Bubble Map Controls</h1>
            <p className="text-sm text-gray-600 mb-6">Add data points. Bubbles will auto-size to fit perfectly in the center.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
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
