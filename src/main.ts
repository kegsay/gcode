import "./style.css";
import { parseDrillFile } from "./drill.ts";
import { WorkArea } from "./workarea.ts";

const workArea = new WorkArea(
    document.querySelector<HTMLElement>("#workarea")!
);

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
    // pull
});

function saveToFile(filename: string, data: string) {
    const blob = new Blob([data], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = filename;
    link.href = window.URL.createObjectURL(blob);
    link.click();
    window.URL.revokeObjectURL(link.href);
}
