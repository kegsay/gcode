import { Point } from "./drill";
import * as d3 from "d3";


const margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

export class WorkArea {
    constructor(readonly container: HTMLElement) {

    }

    clear() {
        this.container.innerHTML = '';
    }

    plot(points: Array<Point>) {
        let maxX = 0;
        let maxY = 0;
        points.forEach((p) => {
            if (p.x > maxX) {
                maxX = p.x;
            }
            if (p.y > maxY) {
                maxY = p.y;
            }
        });
        console.log(maxX, maxY);

        const svg = d3.select(this.container).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // add x-axis y-axis (10% padding on the domain)
        const x = d3.scaleLinear().domain([0, maxX * 1.1]).range([ 0, width ]);
        let xAxis = d3.axisBottom(x);
        const gXAxis = svg.append("g");
        gXAxis.attr("transform", "translate(0," + height + ")").call(xAxis);
        const y = d3.scaleLinear().domain([0, maxX * 1.1]).range([ height, 0]);
        let yAxis = d3.axisLeft(y);
        const gYAxis = svg.append("g");
        gYAxis.call(yAxis);
        // add axis labels
        svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + margin.top + 20)
        .text("(mm)");
        svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left+20)
        .attr("x", -margin.top)
        .text("(mm)");

        // add grid lines
        yAxis = d3.axisLeft(y).tickSize(-innerWidth);
        gYAxis.call(yAxis);
        gYAxis.selectAll('.tick line').attr('opacity', 0.1);
        xAxis = d3.axisBottom(x).tickSize(-innerHeight);
        gXAxis.call(xAxis);
        gXAxis.selectAll('.tick line').attr('opacity', 0.1);

        // add dots
        svg.append('g').selectAll("dot")
        .data(points)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d.x); } )
        .attr("cy", function (d) { return y(d.y); } )
        .attr("r", 1.5)
        .style("fill", "#69b3a2");

        

        /*
        const yScale = d3.scaleLinear()
        .domain([0, d3.max(points, (d) => d.y)!]).nice()
        .range([height - margin.bottom, margin.top]);

        const xScale = d3.scaleLinear()
        .domain([0, d3.max(points, (d) => d.x)!]).nice()
        .range([width - margin.left, margin.right]);

        const xGrid = (g) => g
        .attr('class', 'grid-lines')
        .selectAll('line')
        .data(xScale.ticks())
        .join('line')
        .attr('x1', d => xScale(d))
        .attr('x2', d => xScale(d))
        .attr('y1', margin.top)
        .attr('y2', height - margin.bottom);
        svg.append('g').call(xGrid); */


    }
}