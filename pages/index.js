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

    useEffect(() => {
        setMapData([...sampleData]);
    }, []);

    const handleAddBubble = (newBubble) => {
        if (!mapData.some(d => d.name === newBubble.name)) {
            setMapData(prevData => [...prevData, newBubble]);
        } else {
            alert("Bubble with that name already exists.");
        }
    };

    const handleClearBubbles = () => {
        setMapData([]);
    };

    const handlePopulateSample = () => {
        setMapData([...sampleData]);
    };

    return (
        <>
            <Head>
                <title>Interactive Bubble Map</title>
                <meta name="description" content="A bubble map visualization built with Next.js and D3.js" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="flex flex-col md:flex-row h-screen bg-gray-100 font-sans">
                
                {/* FIXED: Added flex-grow and min-h-0 to ensure this section fills remaining space */}
                <main className="flex-grow min-h-0 w-full md:w-3/4 p-6 flex items-center justify-center">
                    <div 
                        className="relative w-full h-full max-h-[calc(100vh-3rem)] aspect-video rounded-lg shadow-lg"
                        style={{
                            backgroundSize: 'cover'
                        }}
                    >
                        <BubbleChart data={mapData} />
                    </div>
                </main>
                <Controls 
                    onAddBubble={handleAddBubble}
                    onClear={handleClearBubbles}
                    onPopulateSample={handlePopulateSample}
                />
            </div>
        </>
    );
}
