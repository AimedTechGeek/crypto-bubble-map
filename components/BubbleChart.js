import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { handleBubbleClick, getBubbleTooltip, cleanupClickTimeouts } from '../utils/bubbleInteractions';

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
        handleResize();        // Cleanup function to remove the event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            cleanupClickTimeouts(); // Clean up any pending click timeouts
        };

    }, []); // Empty dependency array ensures this setup runs only once


    // Effect for handling data updates
    useEffect(() => {
        if (!data || !simulationRef.current || !wrapperGRef.current || !containerRef.current) return;
        
        const wrapperG = d3.select(wrapperGRef.current);
        const simulation = simulationRef.current;
        const { width, height } = containerRef.current.getBoundingClientRect();
          // Sizing and Color Scales
        const radiusScale = d3.scaleSqrt().domain([0, d3.max(data, d => d.value)]).range([15, 75]);
        
        // Enhanced color scale based on bubble type
        const getColorScale = (bubbleType) => {
            switch (bubbleType) {
                case 'crypto':
                    return d3.scaleSequential(d3.interpolateOranges).domain([d3.max(data, d => d.value), 0]);
                case 'stock':
                    return d3.scaleSequential(d3.interpolateGreens).domain([d3.max(data, d => d.value), 0]);
                case 'city':
                    return d3.scaleSequential(d3.interpolateBlues).domain([d3.max(data, d => d.value), 0]);
                case 'weather':
                    return d3.scaleSequential(d3.interpolateBuPu).domain([d3.max(data, d => d.value), 0]);
                default:
                    return d3.scaleSequential(d3.interpolateViridis).domain([d3.max(data, d => d.value), 0]);
            }
        };

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
        nodeExit.transition().delay(400).remove();        // --- Enter Selection ---
        const nodeEnter = nodes.enter()
            .append("g")
            .attr("class", "bubble-node")
            .style("cursor", "pointer") // Add pointer cursor to indicate clickability
            .attr('transform', d => `translate(${d.x}, ${d.y})`)
            .on('click', function(event, d) {
                // Use 'this' instead of event.currentTarget for better reliability
                const currentElement = this;
                const groupElement = d3.select(currentElement);
                
                // If the node is exiting, do not proceed
                if (groupElement.classed("exiting")) {
                    return;
                }
                
                // Create a mock event object with the current element
                const safeEvent = {
                    ...event,
                    currentTarget: currentElement,
                    detail: event.detail || 1
                };
                
                // Use the new enhanced click handler
                handleBubbleClick(d, safeEvent, {
                    enableNavigation: true,
                    enableCopyToClipboard: true
                });
            })
            .on('mouseover', function(event, d) {
                // Add tooltip on hover
                const tooltip = getBubbleTooltip(d);
                d3.select(this)
                    .select('title')
                    .remove(); // Remove existing title
                    
                d3.select(this)
                    .append('title')
                    .text(tooltip);
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
            .style("opacity", 0);        // --- MERGE Enter and Update selections ---
        const mergedNodes = nodeEnter.merge(nodes);        // Ensure click handlers are applied to all nodes (including updated ones)
        mergedNodes
            .style("cursor", "pointer")
            .on('click', function(event, d) {
                // Use 'this' instead of event.currentTarget for better reliability
                const currentElement = this;
                const groupElement = d3.select(currentElement);
                
                // If the node is exiting, do not proceed
                if (groupElement.classed("exiting")) {
                    return;
                }
                
                // Create a mock event object with the current element
                const safeEvent = {
                    ...event,
                    currentTarget: currentElement,
                    detail: event.detail || 1
                };
                
                // Use the new enhanced click handler
                handleBubbleClick(d, safeEvent, {
                    enableNavigation: true,
                    enableCopyToClipboard: true
                });
            })
            .on('mouseover', function(event, d) {
                // Add tooltip on hover
                const tooltip = getBubbleTooltip(d);
                d3.select(this)
                    .select('title')
                    .remove(); // Remove existing title
                    
                d3.select(this)
                    .append('title')
                    .text(tooltip);
            });// --- Apply styles and transitions to ALL nodes (new and old) ---
        mergedNodes.select('.bubble-circle')
             .transition().duration(1000)
             .attr("r", d => d.radius)
             .style("fill", d => {
                 const colorScale = getColorScale(d.type);
                 return colorScale(d.value);
             })
             .style("stroke", d => {
                 // Add stroke based on bubble type for better visual distinction
                 switch (d.type) {
                     case 'crypto': return '#f59e0b';
                     case 'stock': return '#10b981';
                     case 'city': return '#3b82f6';
                     case 'weather': return '#06b6d4';
                     default: return '#6b7280';
                 }
             })
             .style("stroke-width", d => d.url ? 2 : 1); // Thicker stroke for clickable bubbles

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
