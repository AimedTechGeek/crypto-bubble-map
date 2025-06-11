import { useState, useEffect } from 'react';
import Head from 'next/head';
import Controls from '../components/Controls';
import BubbleChart from '../components/BubbleChart';

const sampleData = [
    { name: 'Tokyo', value: 90 }, { name: 'New York', value: 80 },
    { name: 'London', value: 70 }, { name: 'Beijing', value: 85 },
    { name: 'Sydney', value: 60 }, { name: 'São Paulo', value: 75 },
    { name: 'Cairo', value: 25 }, { name: 'Moscow', value: 50 },
    { name: 'Delhi', value: 95 }, { name: 'Mexico City', value: 65 },
];

export default function Home() {
    const [mapData, setMapData] = useState([]);
    // State to track the name of the bubble that was just updated
    const [updatedBubbleName, setUpdatedBubbleName] = useState(null);


    useEffect(() => {
        setMapData([...sampleData]);
    }, []);

    const handleAddBubble = (newBubble) => {
        setUpdatedBubbleName(null); // Clear previous update before starting a new one
        const bubbleExists = mapData.some(d => d.name === newBubble.name);

        if (bubbleExists) {
            // If the bubble exists, update its value in the data array
            setMapData(prevData =>
                prevData.map(d =>
                    d.name === newBubble.name ? { ...d, value: newBubble.value } : d
                )
            );
            // Set the name of the bubble to be reset in the simulation
            setUpdatedBubbleName(newBubble.name);
        } else {
            // If it's a new bubble, just add it to the array
            setMapData(prevData => [...prevData, newBubble]);
        }
    };

    const handleClearBubbles = () => {
        setMapData([]);
        setUpdatedBubbleName(null);
    };

    const handlePopulateSample = () => {
        setMapData([...sampleData]);
        setUpdatedBubbleName(null);
    };

    return (
        <>
            <Head>
                <title>Interactive Bubble Map</title>
                <meta name="description" content="A bubble map visualization built with Next.js and D3.js" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="flex flex-row h-screen bg-gray-100 font-sans">
                
                {/* FIXED: Added flex-grow and min-h-0 to ensure this section fills remaining space */}
                <main className="flex-grow min-h-0 p-6 flex items-center justify-center overflow-auto">
                    <div 
                        className="relative w-full h-full max-h-[calc(100vh-3rem)] aspect-video rounded-lg shadow-lg"
                        style={{
                            backgroundSize: 'cover'
                        }}
                    >
                        {/* Pass the updatedBubbleName as a prop to the chart */}
                        <BubbleChart data={mapData} updatedBubbleName={updatedBubbleName} />
                    </div>
                </main>

                <div className="max-w-sm md:w-1/4 flex-shrink-0">
                    <Controls 
                        onAddBubble={handleAddBubble}
                        onClear={handleClearBubbles}
                        onPopulateSample={handlePopulateSample}
                    />
                </div>
            </div>
        </>
    );
}
