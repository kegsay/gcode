import "./style.css";
import { parseDrillFile, Point } from "./drill.ts";
import { WorkArea } from "./workarea.ts";
import { Inputs } from "./inputs.ts";
import { generateGcode } from "./gcode.ts";
import { count } from "d3";

const workArea = new WorkArea(
    document.querySelector<HTMLElement>("#workarea")!
);
const pcbArea = new WorkArea(
    document.querySelector<HTMLElement>("#pcbarea")!
);

const inputs = new Inputs({
    // Work area settings
    offsetW: "globaloffset-w",
    offsetH: "globaloffset-h",
    pcbOutlineW: "pcboutline-w",
    pcbOutlineH: "pcboutline-h",
    workAreaW: "dimension-w",
    workAreaH: "dimension-h",
    pcbCountW: "pcbcount-w",
    pcbCountH: "pcbcount-h",
    // Nozzle settings
    nozzleFeedBwd: "nozzlefeedbwd",
    nozzleFeedFwd: "nozzlefeedfwd",
    nozzleHoldDurationMs: "nozzlehold",
    nozzleTemp: "nozzletemp",
    nozzleZValue: "nozzlez",
    restZValue: "restzvalue",
});

const pcbPoints = new Set<Point>();
pcbArea.addEventListener(WorkArea.POINT_CLICK, (ev) => {
    const cev = ev as CustomEvent;
    const p = cev.detail as Point;
    if (pcbPoints.has(p)) {
        pcbPoints.delete(p);
    } else {
        pcbPoints.add(p);
    }
    const points = recalculatePoints(pcbPoints, {w: inputs.pcbCountW, h: inputs.pcbCountH}, {x: inputs.pcbOutlineW, y: inputs.pcbOutlineH});
    console.log(points);
    workArea.clearPoints();
    workArea.addPoints(points);
    workArea.render();
});

inputs.addEventListener(Inputs.WORK_AREA_UPDATE, () => {
    // recalculate the actual solder points from the pcb.
    const points = recalculatePoints(pcbPoints, {w: inputs.pcbCountW, h: inputs.pcbCountH}, {x: inputs.pcbOutlineW, y: inputs.pcbOutlineH});
    console.log(points);
    workArea.clearPoints();
    workArea.addPoints(points);

    workArea.update({
        w: inputs.workAreaW,
        h: inputs.workAreaH,
        offsetW: inputs.offsetW,
        offsetH: inputs.offsetH,
    });
    pcbArea.update({
        w: inputs.pcbOutlineW,
        h: inputs.pcbOutlineH,
    });
});
inputs.dispatchEvent(new Event(Inputs.WORK_AREA_UPDATE));

const fileInput = document.querySelector<HTMLInputElement>("#drillfile");
fileInput!.addEventListener("change", () => {
    const files = fileInput!.files;
    if (!files) {
        return;
    }
    const fr = new FileReader();
    fr.onload = () => {
        const contents = fr.result as string;
        // parse file and dump it onto the UI
        const points = parseDrillFile(contents);
        console.log(points);
        pcbArea.clear();
        pcbArea.addPoints(points);
        pcbArea.render();
        const maxW = Math.max(...points.map((p) => p.x));
        const maxH = Math.max(...points.map((p) => p.y));
        inputs.setDrillMaxPoints(maxW, maxH);
        inputs.validate();
    };
    fr.readAsText(files[0]);
});

const generateButton = document.querySelector<HTMLInputElement>("#generate");
generateButton?.addEventListener("click", () => {
    // pull selected points from the work area
    const points = workArea.getSolderPoints();

    // generate the gcode
    const data = generateGcode(inputs, points);
    saveToFile("solder.gcode", data);
});

// Return the total set of points to solder based on the number of desired PCBs.
//
// +-------+-------+
// | .     | .     |
// |   .   |   .   |
// +-------+-------+
//
// . = pcb point (relative to a PCB)
// num pcbs = 2x1
// pcbOutline = the size of a single grid cell.
// Returns 4 points in this example.
function recalculatePoints(points: Set<Point>, numPcbs: {w:number,h:number}, pcbOutline: {x:number,y:number}): Array<Point> {
    console.log(`recalculatePoints points=`,Array.from(points),` numPcbs=`,numPcbs,`pcbOutliner=`,pcbOutline);
    if (numPcbs.w === 0 || numPcbs.h === 0) {
        return [];
    }
    let result: Array<Point> = [];
    // loop the grid e.g 2x3
    for (let countWidth = 0; countWidth < numPcbs.w; countWidth++) {
        for (let countHeight = 0; countHeight < numPcbs.h; countHeight++) {
            // find the bottom left corner. For 0x0 it's 0. For 0x1 it's 0,pcbHeight, etc.
            const bottomLeft = {
                x: countWidth * pcbOutline.x,
                y: countHeight * pcbOutline.y,
            };
            // the points are relative to the bottom left
            result = result.concat(Array.from(points).map((p) => {
                return new Point(bottomLeft.x + p.x, bottomLeft.y + p.y);
            }));
        }
    }
    return result;
}

function saveToFile(filename: string, data: string) {
    const blob = new Blob([data], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = filename;
    link.href = window.URL.createObjectURL(blob);
    link.click();
    window.URL.revokeObjectURL(link.href);
}
