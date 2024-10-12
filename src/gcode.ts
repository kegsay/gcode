import { Point } from "./drill";
import { Inputs } from "./inputs";

export function generateGcode(inputs: Inputs, points: Array<Point>): string {
    // See https://marlinfw.org/docs/gcode/G028.html etc for more information.
    // The feed rates are hardcoded based on what the 3d printer I'm using is happy with
    let gcode = [
        "G21", // Set mm
        "G90", // Set absolute positioning
        "M82", // extruder to absolute mode
        "M107", // fan off
        "G28 X0 Y0", // find home
        "G28 Z0", // find home
        "G92 E0", // zero the extruded solder
        "M83", // extruder to relative mode
        `G1 F1200 Z${inputs.restZValue} E-${inputs.nozzleFeedBwd}`, // retract feed so we don't melt the solder at startup, lift the tip
        `M109 S${inputs.nozzleTemp}`, // wait for hotend temp
    ];
    points.forEach((p, index) => {
        // for each point we want to:
        // - quickly move to the point
        // - descend to the Z value
        // - extrude solder
        // - wait at the point for a certain amount of time
        // - retract the solder
        // - ascend
        // - repeat
        gcode = gcode.concat([
            `M117 Soldering ${index+1} of ${points.length}`,
            `G0 F3600 X${p.x.toFixed(3)} Y${p.y.toFixed(3)}`, // e.g 4.2 becomes 4.200 and 1.23456 becomes 1.234
            `G1 F2100 Z${inputs.nozzleZValue.toFixed(3)}`,
            `G1 E${inputs.nozzleFeedFwd.toFixed(3)}`,
            `G4 P${Math.floor(inputs.nozzleHoldDurationMs)}`,
            `G1 E-${inputs.nozzleFeedBwd.toFixed(3)}`,
            `G1 F2100 Z${inputs.restZValue}`,
        ]);
    });

    return gcode.join("\n");
}