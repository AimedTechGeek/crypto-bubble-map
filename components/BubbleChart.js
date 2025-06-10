import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BubbleChart = ({ data }) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    // Use a ref to store the simulation so it persists across re-renders
    const simulationRef = useRef(null);

    // This effect runs once to initialize the simulation
    useEffect(() => {
        if (!containerRef.current) return;

        const { width, height } = containerRef.current.getBoundingClientRect();

        // The function that is called on each 'tick' of the simulation
        const ticked = () => {
            d3.select(svgRef.current)
              .selectAll('.bubble-node')
              .attr("transform", d => `translate(${d.x}, ${d.y})`);
        };

        // Initialize the D3 force simulation
        simulationRef.current = d3.forceSimulation()
            .force('center', d3.forceCenter(width / 2, height / 2).strength(0.02))
            .force('collide', d3.forceCollide().radius(d => d.radius + 2).strength(0.9))
            .on("tick", ticked);

        // Resize handler
        const handleResize = () => {
            if (!containerRef.current) return;
            const { width, height } = containerRef.current.getBoundingClientRect();
            simulationRef.current.force('center', d3.forceCenter(width / 2, height / 2));
            simulationRef.current.alpha(0.3).restart(); // Reheat the simulation on resize
        };
        
        window.addEventListener('resize', handleResize);

        // Cleanup on component unmount
        return () => window.removeEventListener('resize', handleResize);

    }, []); // Empty dependency array ensures this runs only once

    // This effect runs whenever the `data` prop changes
    useEffect(() => {
        if (!data || !svgRef.current || !simulationRef.current || !containerRef.current) return;

        const svg = d3.select(svgRef.current);
        const simulation = simulationRef.current;
        
        // --- Sizing and Color Scales ---
        const radiusScale = d3.scaleSqrt().domain([0, d3.max(data, d => d.value)]).range([15, 75]);
        const colorScale = d3.scaleSequential(d3.interpolateViridis).domain([d3.max(data, d => d.value), 0]);

        // --- Smart Node Update ---
        // Get the old nodes from the simulation and map them by name for easy access.
        const oldNodeMap = new Map(simulation.nodes().map(d => [d.name, d]));
        const { width, height } = containerRef.current.getBoundingClientRect();

        // Create the new node data. For existing nodes, we preserve their current position and velocity.
        // For new nodes, we start them at the center.
        const nodesData = data.map(d => {
            const oldNode = oldNodeMap.get(d.name);
            return {
                ...d,
                radius: radiusScale(d.value),
                x: oldNode ? oldNode.x : width / 2,
                y: oldNode ? oldNode.y : height / 2,
                vx: oldNode ? oldNode.vx : 0,
                vy: oldNode ? oldNode.vy : 0,
            };
        });

        // --- D3 Data Join ---
        const nodes = svg
            .selectAll(".bubble-node")
            .data(nodesData, d => d.name);

        // --- Exit ---
        // Correctly handle exiting nodes by animating them out before removing.
        const nodeExit = nodes.exit();
        nodeExit.select('.bubble-circle')
            .transition().duration(400)
            .attr("r", 0);
        nodeExit.selectAll('text')
            .transition().duration(300)
            .style("opacity", 0);
        nodeExit.transition().delay(400).remove();
        
        // --- Enter ---
        const nodeEnter = nodes.enter()
            .append("g")
            .attr("class", "bubble-node")
            .attr('transform', d => `translate(${d.x}, ${d.y})`); // Start new nodes at their initial position (center)

        nodeEnter.append("circle")
            .attr("class", "bubble-circle")
            .attr("r", 0) // Start with radius 0 for grow-in animation
            .style("fill", d => colorScale(d.value))
            .transition().duration(1000)
            .attr("r", d => d.radius);

        nodeEnter.append("text")
            .attr("class", "bubble-text")
            .attr("dy", "-0.2em")
            .style("opacity", 0)
            .text(d => d.name)
            .transition().duration(1000).delay(200)
            .style("opacity", 1)
            .style("font-size", d => Math.max(8, Math.min(d.radius / d.name.length * 2.2, 20)) + 'px');

        nodeEnter.append("text")
            .attr("class", "bubble-value-text")
            .attr("dy", "1.0em")
            .style("opacity", 0)
            .text(d => d.value)
            .transition().duration(1000).delay(200)
            .style("opacity", 1)
            .style("font-size", d => Math.max(7, Math.min(d.radius / d.name.length * 1.8, 18)) + 'px');
        
        // --- Update ---
        // For existing nodes, just update their radius if it changed
        nodes.select('.bubble-circle')
             .transition().duration(1000)
             .attr('r', d => d.radius);
        
        // Update the simulation with the new nodes
        simulation.nodes(nodesData);
        simulation.alpha(0.3).restart();

    }, [data]);

    return (
        <div ref={containerRef} className="relative w-full h-full">
            <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full" />
        </div>
    );
};

export default BubbleChart;
