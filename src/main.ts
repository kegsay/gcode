import "./style.css";
import { parseDrillFile } from "./drill.ts";
import { WorkArea } from "./workarea.ts";
import { Inputs } from "./inputs.ts";

const workArea = new WorkArea(
    document.querySelector<HTMLElement>("#workarea")!
);

const inputs = new Inputs({
    nozzleFeedBwd: "nozzlefeedbwd",
    nozzleFeedFwd: "nozzlefeedfwd",
    nozzleHoldDurationMs: "nozzlehold",
    nozzleTemp: "nozzletemp",
    nozzleZValue: "nozzlez",
    offset: "areapcboffset",
    workAreaGlobalOffset: "globaloffset",
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

let enable = false;
const generateButton = document.querySelector<HTMLInputElement>("#generate");
generateButton?.addEventListener("click", () => {
    // pull input field values

    // pull selected points from the work area
    const points = workArea.getSolderPoints();

    // generate the gcode
});

function saveToFile(filename: string, data: string) {
    const blob = new Blob([data], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = filename;
    link.href = window.URL.createObjectURL(blob);
    link.click();
    window.URL.revokeObjectURL(link.href);
}
