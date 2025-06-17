/**
 * Component to display bubble interaction instructions
 */
const BubbleInstructions = ({ className = "" }) => {
    return (
        <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
            <h4 className="font-semibold text-gray-800 mb-2">Bubble Interactions</h4>
            <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center space-x-2">
                    <span className="font-medium">Single Click:</span>
                    <span>Copy info to clipboard + Open website in new tab</span>
                </div>
                <div className="text-xs text-gray-500 italic">
                    ✨ One click does everything - simple and efficient!
                </div>
            </div>
            
            <div className="mt-3 border-t pt-2">
                <h5 className="font-medium text-gray-700 mb-1">Bubble Types</h5>
                <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-600"></div>
                        <span>Crypto</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600"></div>
                        <span>Stocks</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
                        <span>Cities</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600"></div>
                        <span>Weather</span>
                    </div>
                </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-500 italic">
                💡 Visual feedback shows successful clipboard copy
            </div>
        </div>
    );
};

export default BubbleInstructions;
