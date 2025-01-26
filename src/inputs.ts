export class Inputs extends EventTarget {
    // Work Area Settings
    workAreaW: number = 500;
    workAreaH: number = 500;
    offsetW: number = 5;
    offsetH: number = 5;
    pcbOutlineW: number = 100;
    pcbOutlineH: number = 50;
    pcbCountW: number = 1;
    pcbCountH: number = 1;

    static WORK_AREA_UPDATE: "WORK_AREA_UPDATE";
    private workAreaFieldsForUpdate = [
        "workAreaH",
        "workAreaW",
        "offsetH",
        "offsetW",
        "pcbOutlineW",
        "pcbOutlineH",
    ];
    // Nozzle settings
    restZValue: number = 8;
    nozzleTemp: number = 300;
    nozzleHoldDurationMs: number = 1000;
    nozzleFeedFwd: number = 10;
    nozzleFeedBwd: number = 5;
    nozzleZValue: number = 1;

    constructor(
        readonly ids: {
            // Work Area Settings
            workAreaW: string;
            workAreaH: string;
            offsetW: string;
            offsetH: string;
            pcbOutlineW: string;
            pcbOutlineH: string;
            pcbCountW: string;
            pcbCountH: string;
            // Nozzle Settings
            restZValue: string;
            nozzleTemp: string;
            nozzleHoldDurationMs: string;
            nozzleFeedFwd: string;
            nozzleFeedBwd: string;
            nozzleZValue: string;
        }
    ) {
        super();
        this.load();
        const setOnChange = (id: string, targetField: string) => {
            document.querySelector<HTMLInputElement>("#" + id)!.onchange = (
                ev
            ) => {
                const e = ev.target as HTMLInputElement;
                this[targetField] = Number(e.value);
                if (this.validate()) {
                    this.save();
                }
                if (this.workAreaFieldsForUpdate.includes(targetField)) {
                    this.dispatchEvent(new Event(Inputs.WORK_AREA_UPDATE));
                }
            };
        };
        const setDefault = (id: string, val: number) => {
            document.querySelector<HTMLInputElement>("#" + id)!.value =
                "" + val;
        };
        Object.keys(ids).forEach((k) => {
            setDefault(this.ids[k], this[k]);
            // This assumes the ids dict maps to the fields of Inputs 1:1 without name changes.
            setOnChange(this.ids[k], k);
        });
    }

    save(): void {
        Object.keys(this.ids).forEach((k) => {
            localStorage.setItem(k, this[k]);
        });
    }
    load(): void {
        Object.keys(this.ids).forEach((k) => {
            const val = localStorage.getItem(k);
            if (val === undefined || val === null) {
                return;
            }
            this[k] = Number(val);
        });
    }

    validate(): boolean {
        let valid = true;
        if (this.nozzleFeedBwd >= this.nozzleFeedFwd) {
            this.toggleWarning(
                this.ids.nozzleFeedBwd,
                "Must be less than feed forward"
            );
            this.toggleWarning(
                this.ids.nozzleFeedFwd,
                "Must be greater than feed backward"
            );
            valid = false;
        } else {
            this.toggleWarning(this.ids.nozzleFeedFwd);
            this.toggleWarning(this.ids.nozzleFeedBwd);
        }
        if (this.restZValue <= this.nozzleZValue) {
            this.toggleWarning(
                this.ids.restZValue,
                "Must be greater than soldering Z-value"
            );
            this.toggleWarning(
                this.ids.nozzleZValue,
                "Must be less than at-rest Z-value"
            );
            valid = false;
        } else {
            this.toggleWarning(this.ids.restZValue);
            this.toggleWarning(this.ids.nozzleZValue);
        }
        if (this.pcbCountW <= 0) {
            this.toggleWarning(this.ids.pcbCountW, "PCB Count must be > 0");
        } else {
            this.toggleWarning(this.ids.pcbCountW);
        }
        if (this.pcbCountH <= 0) {
            this.toggleWarning(this.ids.pcbCountH, "PCB Count must be > 0");
        } else {
            this.toggleWarning(this.ids.pcbCountH);
        }
        return valid;
    }

    toggleWarning(id: string, msg?: string) {
        const label = document.querySelector<HTMLLabelElement>(
            'label[for="' + id + '"]'
        );
        if (!label) {
            console.error("enableWarning: no label for id " + id);
            return;
        }
        label.textContent = label.textContent!.replace("⚠️", "");
        if (msg) {
            label.textContent = label.textContent += "⚠️";
            label.title = msg;
            label.setAttribute("style", "color: red;");
        } else {
            label.title = "";
            label.setAttribute("style", "");
        }
    }
}
