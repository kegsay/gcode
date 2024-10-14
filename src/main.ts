import "./style.css";
import { parseDrillFile } from "./drill.ts";
import { WorkArea } from "./workarea.ts";
import { Inputs } from "./inputs.ts";
import { generateGcode } from "./gcode.ts";

const workArea = new WorkArea(
    document.querySelector<HTMLElement>("#workarea")!
);

const inputs = new Inputs({
    // Work area settings
    offsetW: "globaloffset-w",
    offsetH: "globaloffset-h",
    pcbOutlineW: "pcboutline-w",
    pcbOutlineH: "pcboutline-h",
    workAreaW: "dimension-w",
    workAreaH: "dimension-h",
    // Nozzle settings
    nozzleFeedBwd: "nozzlefeedbwd",
    nozzleFeedFwd: "nozzlefeedfwd",
    nozzleHoldDurationMs: "nozzlehold",
    nozzleTemp: "nozzletemp",
    nozzleZValue: "nozzlez",
    restZValue: "restzvalue",
});

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
        workArea.clear();
        workArea.plot(points);
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

function saveToFile(filename: string, data: string) {
    const blob = new Blob([data], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = filename;
    link.href = window.URL.createObjectURL(blob);
    link.click();
    window.URL.revokeObjectURL(link.href);
}
