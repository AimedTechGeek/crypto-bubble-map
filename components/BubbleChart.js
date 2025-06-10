import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BubbleChart = ({ data }) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!data || !svgRef.current || !containerRef.current) return;

        const container = containerRef.current;
        const { width, height } = container.getBoundingClientRect();
        const diameter = Math.min(width, height);

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        // Clear previous render
        svg.selectAll("*").remove(); 
        
        const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

        if (data.length === 0) return;

        const pack = d3.pack()
            .size([diameter - 10, diameter - 10]) // a little padding
            .padding(5);

        const root = d3.hierarchy({ children: data })
            .sum(d => d.value);

        const packedData = pack(root).leaves();
        const colorScale = d3.scaleSequential(d3.interpolateViridis).domain([d3.max(data, d => d.value), 0]);

        const nodes = g.selectAll(".bubble-node")
            .data(packedData, d => d.data.name)
            .join(
                enter => {
                    const nodeEnter = enter.append("g")
                        .attr("class", "bubble-node")
                        .attr("transform", d => `translate(${d.x - (diameter/2)}, ${d.y - (diameter/2)})`);

                    nodeEnter.append("circle")
                        .attr("class", "bubble-circle")
                        .attr("r", 0)
                        .style("fill", d => colorScale(d.data.value))
                        .transition().duration(1000)
                        .attr("r", d => d.r);

                    nodeEnter.append("text")
                        .attr("class", "bubble-text")
                        .attr("dy", "-0.2em")
                        .style("opacity", 0)
                        .text(d => d.data.name)
                        .transition().duration(1000).delay(200)
                        .style("opacity", 1)
                        .style("font-size", d => Math.max(8, Math.min(d.r / d.data.name.length * 2.2, 20)) + 'px');

                    nodeEnter.append("text")
                        .attr("class", "bubble-value-text")
                        .attr("dy", "1.0em")
                        .style("opacity", 0)
                        .text(d => d.data.value)
                        .transition().duration(1000).delay(200)
                        .style("opacity", 1)
                        .style("font-size", d => Math.max(7, Math.min(d.r / d.data.name.length * 1.8, 18)) + 'px');

                    return nodeEnter;
                },
                update => {
                    update.transition().duration(1000)
                         .attr("transform", d => `translate(${d.x - (diameter/2)}, ${d.y - (diameter/2)})`);
                    update.select('.bubble-circle').transition().duration(1000)
                         .attr("r", d => d.r)
                         .style("fill", d => colorScale(d.data.value));
                    return update;
                },
                exit => {
                    exit.select('.bubble-circle').transition().duration(400).attr("r", 0);
                    exit.selectAll('text').transition().duration(300).style("opacity", 0);
                    exit.transition().delay(400).remove();
                    return exit;
                }
            );

    }, [data]);

    return (
        <div ref={containerRef} className="relative w-full h-full">
            <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full" />
        </div>
    );
};

export default BubbleChart;
