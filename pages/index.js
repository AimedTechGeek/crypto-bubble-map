import { useEffect } from 'react';
import Head from 'next/head';
import Controls from '../components/Controls';
import BubbleChart from '../components/BubbleChart';
import { useBubbleState } from '../hooks/useBubbleState';
import { useExternalBubbleEvents } from '../hooks/useExternalBubbleEvents';
import { SAMPLE_BUBBLE_DATA } from '../constants/sampleData';

export default function Home() {
    // Use custom hook for bubble state management
    const {
        mapData,
        updatedBubbleName,
        addOrUpdateBubble,
        clearBubbles,
        populateWithSampleData
    } = useBubbleState([]);

    // Use custom hook for external event handling
    useExternalBubbleEvents(addOrUpdateBubble, [mapData]);

    // Initialize with sample data on mount
    useEffect(() => {
        populateWithSampleData(SAMPLE_BUBBLE_DATA);
    }, [populateWithSampleData]);

    // Handle populating sample data
    const handlePopulateSample = () => {
        populateWithSampleData(SAMPLE_BUBBLE_DATA);
    };

    return (
        <>
            <Head>
                <title>Interactive Bubble Map</title>
                <meta name="description" content="A bubble map visualization built with Next.js and D3.js" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="flex flex-row h-screen bg-gray-100 font-sans">
                
                <main className="flex-grow min-h-0 p-6 flex items-center justify-center overflow-auto">
                    <div 
                        className="relative w-full h-full max-h-[calc(100vh-3rem)] aspect-video rounded-lg shadow-lg"
                        style={{
                            backgroundSize: 'cover'
                        }}
                    >
                        <BubbleChart data={mapData} updatedBubbleName={updatedBubbleName} />
                    </div>
                </main>

                <div className="max-w-sm md:w-1/4 flex-shrink-0">
                    <Controls 
                        onAddBubble={addOrUpdateBubble}
                        onClear={clearBubbles}
                        onPopulateSample={handlePopulateSample}
                    />
                </div>
            </div>
        </>
    );
}
