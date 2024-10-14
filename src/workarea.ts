import { Point } from "./drill";
import * as d3 from "d3";

const margin = { top: 10, right: 30, bottom: 30, left: 60 };

export class WorkArea extends EventTarget {
    static POINT_CLICK = "POINT_CLICK";
    solderPoints: Array<Point> = [];
    private w: number = 0;
    private h: number = 0;
    private pcbOutlineW: number = 0;
    private pcbOutlineH: number = 0;
    private offsetW: number = 0;
    private offsetH: number = 0;

    constructor(readonly container: HTMLElement) {
        super();
    }

    clear() {
        this.container.innerHTML = "";
    }

    getSolderPoints(): Array<Point> {
        return this.solderPoints;
    }

    update(vals: {
        w?: number;
        h?: number;
        pcbOutlineW?: number;
        pcbOutlineH?: number;
        offsetW?: number;
        offsetH?: number;
    }) {
        this.w = vals.w || this.w;
        this.h = vals.h || this.h;
        this.pcbOutlineW = vals.pcbOutlineW || this.pcbOutlineW;
        this.pcbOutlineH = vals.pcbOutlineH || this.pcbOutlineH;
        this.offsetW = vals.offsetW || this.offsetW;
        this.offsetH = vals.offsetH || this.offsetH;
        this.render();
    }

    addPoints(points: Array<Point>) {
        this.solderPoints = this.solderPoints.concat(points);
    }

    render() {
        const rect = this.container.getBoundingClientRect();
        const width = Math.floor(rect.width - margin.left - margin.right);
        const height = Math.floor(rect.height - margin.top - margin.bottom);
        console.log(`rendering w=${width} h=${height}`);

        // TODO: let the points be selected.
        let maxX = 0;
        let maxY = 0;
        this.solderPoints.forEach((p) => {
            if (p.x > maxX) {
                maxX = p.x;
            }
            if (p.y > maxY) {
                maxY = p.y;
            }
        });
        if (maxX > this.w) {
            this.w = maxX;
        }
        if (maxY > this.h) {
            this.h = maxY;
        }

        this.container.innerHTML = ""; // clear previous render

        const svg = d3
            .select(this.container)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr(
                "transform",
                "translate(" + margin.left + "," + margin.top + ")"
            );

        // add x-axis y-axis (10% padding on the domain)
        const x = d3
            .scaleLinear()
            .domain([0, this.w * 1.1])
            .range([0, width]);
        let xAxis = d3.axisBottom(x);
        const gXAxis = svg.append("g");
        gXAxis.attr("transform", "translate(0," + height + ")").call(xAxis);
        const y = d3
            .scaleLinear()
            .domain([0, this.h * 1.1])
            .range([height, 0]);
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
            .attr("y", -margin.left + 20)
            .attr("x", -margin.top)
            .text("(mm)");

        // add grid lines
        yAxis = d3.axisLeft(y).tickSize(-innerWidth);
        gYAxis.call(yAxis);
        gYAxis.selectAll(".tick line").attr("opacity", 0.1);
        xAxis = d3.axisBottom(x).tickSize(-innerHeight);
        gXAxis.call(xAxis);
        gXAxis.selectAll(".tick line").attr("opacity", 0.1);

        // add dots
        let dots = svg.append("g")
            .selectAll("dot")
            .data(this.solderPoints)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return x(d.x);
            })
            .attr("cy", function (d) {
                return y(d.y);
            })
            .attr("r", 3.5)
            .on("click", (data) => {
                const point = data.target.__data__;
                const ev = new CustomEvent(WorkArea.POINT_CLICK, {detail: point});
                this.dispatchEvent(ev);
            })
            .style("cursor", "pointer")
            .style("fill", "#69b3a2");

            /*
        function zoomed({ transform }) {
            console.log("zoomed!");
            svg.select("g").attr("transform", transform);
        }
        console.log("attaching zoom 2");
        const zoom = d3.zoom().on("zoom", zoomed);
        svg.call(zoom); */

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
