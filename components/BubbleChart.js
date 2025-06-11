import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BubbleChart = ({ data, updatedBubbleName }) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const simulationRef = useRef(null);
    const wrapperGRef = useRef(null); // Ref for the zoomable <g> element

    // Effect for one-time setup of simulation, zoom, and resize listeners
    useEffect(() => {
        if (!svgRef.current || !containerRef.current) return;

        const svg = d3.select(svgRef.current);
        
        // The ticked function updates bubble positions on each simulation step
        const ticked = () => {
            if (wrapperGRef.current) {
                d3.select(wrapperGRef.current)
                  .selectAll('.bubble-node')
                  .attr("transform", d => `translate(${d.x}, ${d.y})`);
            }
        };
        
        // Initialize the D3 force simulation
        simulationRef.current = d3.forceSimulation().on("tick", ticked);

        // Create the zoomable wrapper <g> if it doesn't exist yet
        if (!wrapperGRef.current) {
            wrapperGRef.current = svg.append("g").node();
        }

        // Define the zoom handler
        const zoomHandler = d3.zoom()
            .scaleExtent([0.5, 8]) // Set min/max zoom levels
            .on("zoom", (event) => {
                // Apply the zoom transform to the wrapper group
                d3.select(wrapperGRef.current).attr("transform", event.transform);
            });

        // Apply zoom behavior to the main SVG element
        svg.call(zoomHandler);

        // Resize handler to keep the chart centered
        const handleResize = () => {
            if (!containerRef.current) return;
            const { width, height } = containerRef.current.getBoundingClientRect();
            d3.select(svgRef.current).attr('width', width).attr('height', height);
            // Update the center force of the simulation
            simulationRef.current.force('center', d3.forceCenter(width / 2, height / 2));
            simulationRef.current.alpha(0.3).restart(); // Reheat the simulation
        };
        
        window.addEventListener('resize', handleResize);
        
        // Set the initial center force
        handleResize();

        // Cleanup function to remove the event listener on component unmount
        return () => window.removeEventListener('resize', handleResize);

    }, []); // Empty dependency array ensures this setup runs only once


    // Effect for handling data updates
    useEffect(() => {
        if (!data || !simulationRef.current || !wrapperGRef.current || !containerRef.current) return;
        
        const wrapperG = d3.select(wrapperGRef.current);
        const simulation = simulationRef.current;
        const { width, height } = containerRef.current.getBoundingClientRect();
        
        // Sizing and Color Scales
        const radiusScale = d3.scaleSqrt().domain([0, d3.max(data, d => d.value)]).range([15, 75]);
        const colorScale = d3.scaleSequential(d3.interpolateViridis).domain([d3.max(data, d => d.value), 0]);

        // Preserve existing positions for a smoother animation
        const oldNodeMap = new Map(simulation.nodes().map(d => [d.name, d]));
        const nodesData = data.map(d => {
            const oldNode = oldNodeMap.get(d.name);
            // Check if the current bubble is the one that was just updated
            const shouldReset = d.name === updatedBubbleName;
            return {
                ...d,
                radius: radiusScale(d.value),
                // If it should be reset, start it at the center. Otherwise, keep its old position.
                x: (oldNode && !shouldReset) ? oldNode.x : width / 2,
                y: (oldNode && !shouldReset) ? oldNode.y : height / 2,
                vx: (oldNode && !shouldReset) ? oldNode.vx : 0,
                vy: (oldNode && !shouldReset) ? oldNode.vy : 0,
            };
        });

        // D3 Data Join on the wrapper <g>
        const nodes = wrapperG
            .selectAll(".bubble-node")
            .data(nodesData, d => d.name);

        // --- Exit Selection ---
        const nodeExit = nodes.exit();
        // **FIX:** Add a class to exiting nodes to prevent clicks during removal.
        nodeExit.classed("exiting", true);
        nodeExit.select('.bubble-circle').transition().duration(400).attr("r", 0);
        nodeExit.selectAll('text').transition().duration(300).style("opacity", 0);
        nodeExit.transition().delay(400).remove();
        
        // --- Enter Selection ---
        const nodeEnter = nodes.enter()
            .append("g")
            .attr("class", "bubble-node")
            .style("cursor", "pointer") // Add pointer cursor to indicate clickability
            .attr('transform', d => `translate(${d.x}, ${d.y})`)
            .on('click', (event, d) => {
                const groupElement = d3.select(event.currentTarget);
                // **FIX:** If the node is exiting, do not proceed.
                if (groupElement.classed("exiting")) {
                    return;
                }

                // Copy the bubble name to the clipboard
                navigator.clipboard.writeText(d.name).then(() => {
                    // **FIX:** Double-check if the node started exiting while clipboard was working.
                    if (groupElement.classed("exiting")) {
                        return;
                    }
                    // Provide visual feedback on successful copy
                    const circle = groupElement.select('.bubble-circle');
                    const originalColor = circle.style('fill');
                    const originalTransform = groupElement.attr('transform');
                    
                    // Enlarge and flash green
                    groupElement.transition()
                        .duration(150)
                        .attr("transform", `${originalTransform} scale(1.1)`)
                        .select('.bubble-circle')
                        .style('fill', '#4ade80');
                        
                    // Return to original state
                    groupElement.transition()
                        .delay(200)
                        .duration(300)
                        .attr("transform", originalTransform)
                        .select('.bubble-circle')
                        .style('fill', originalColor);

                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            });

        // Append elements for ENTERING nodes
        nodeEnter.append("circle")
            .attr("class", "bubble-circle")
            .attr("r", 0);
            
        nodeEnter.append("text")
            .attr("class", "bubble-text")
            .attr("dy", "-0.2em")
            .style("opacity", 0);

        nodeEnter.append("text")
            .attr("class", "bubble-value-text")
            .attr("dy", "1.0em")
            .style("opacity", 0);

        // --- MERGE Enter and Update selections ---
        const mergedNodes = nodeEnter.merge(nodes);

        // --- Apply styles and transitions to ALL nodes (new and old) ---
        mergedNodes.select('.bubble-circle')
             .transition().duration(1000)
             .attr("r", d => d.radius)
             .style("fill", d => colorScale(d.value));

        mergedNodes.select('.bubble-text')
            .text(d => d.name)
            .transition().duration(1000)
            .style("opacity", 1)
            .style("font-size", d => Math.max(8, Math.min(d.radius / d.name.length * 2.2, 20)) + 'px');
        
        mergedNodes.select('.bubble-value-text')
             .text(d => d.value)
             .transition().duration(1000)
             .style("opacity", 1)
             .style("font-size", d => Math.max(7, Math.min(d.radius / d.name.length * 1.8, 18)) + 'px');
        
        // Update the simulation with new nodes and forces
        simulation.nodes(nodesData)
            .force('collide', d3.forceCollide().radius(d => d.radius + 2).strength(0.9));
        
        simulation.alpha(0.3).restart();

    }, [data, updatedBubbleName]); // Add updatedBubbleName to the dependency array

    return (
        <div ref={containerRef} className="relative w-full h-full">
            <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full cursor-grab active:cursor-grabbing" />
        </div>
    );
};

export default BubbleChart;
