// See https://www.artwork.com/gerber/drl2laser/excellon/index.htm for .drl specification
// Analysis is below:
/*
G05 -- Turn on drill mode
M48 -- HEADER INFO INCOMING
;#@! TF.GenerationSoftware,Number One Systems,Easy-PC 1000,25.0.5614
;#@! TF.CreationDate,2024-08-17T13:21:32+00:00*
;#@! TF.FileFunction,Unplated,1,2,NPTH
;FILE_FORMAT=3:5
;TYPE=NONPLATED
INCH,TZ -- units, [L]eading or [T]railing zeros
FMAT,2 -- file format 2
T1C000.02500 -- Tool 1 has diameter of 000.02500 units (inches)
% -- end of header, M95 is also the same thing.
T001 -- Use Tool 1
G00X0.57606Y0.28804 -- fast move (G00) to X,Y
M15 -- Motion +?
G01X0.57606Y0.35525 -- slow move (G01) to X,Y
X0.83669Y0.35525
X0.83669Y0.28818
X4.43295Y0.29009
X4.43295Y0.29029
X4.56012Y0.55840
X4.56012Y1.14521
X4.45520Y1.41037
X0.85480Y1.41037
X0.85480Y1.33064
X0.57016Y1.33064
X0.57016Y1.41037
X0.39693Y1.41037
X0.10913Y1.09304
X0.10913Y0.60170
X0.39693Y0.28793
X0.57606Y0.28804
M17
M30 -- END
*/

export class Point {
    // units are ALWAYS mm
    constructor(
        readonly x: number,
        readonly y: number
    ) {}
}

export function parseDrillFile(fileContents: string): Array<Point> {
    const points: Array<Point> = [];
    let unitMultiplier = 1; // 1 for METRIC, 25.4 for INCH
    // TODO: Check if in inches and then x25.4 values to always work in mm.
    fileContents.split("\n").forEach((line) => {
        if (line.startsWith("G00") || line.startsWith("G01")) {
            // strip movement commands
            line = line.substring("G00".length);
        }
        if (line.startsWith("INCH")) {
            unitMultiplier = 25.4;
        }
        if (!line.startsWith("X")) {
            return; // not a co-ord
        }
        // line='X4.56012Y1.14521'
        let [xpart, ypart] = line.split("Y");
        xpart = xpart.substring(1); // strip the X
        try {
            const x = Number(xpart);
            const y = Number(ypart);
            points.push(new Point(x * unitMultiplier, y * unitMultiplier));
        } catch (err) {
            console.error(`line ${line} malformed: ${err}`);
        }
    });
    return points;
}

export function setupCounter(element: HTMLButtonElement) {
    let counter = 0;
    const setCounter = (count: number) => {
        counter = count;
        element.innerHTML = `count is ${counter}`;
    };
    element.addEventListener("click", () => setCounter(counter + 1));
    setCounter(0);
}
