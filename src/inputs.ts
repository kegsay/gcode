export class Inputs {
    workAreaGlobalOffset: number = 0;
    offset: number = 0;
    restZValue: number = 8;
    nozzleTemp: number = 300;
    nozzleHoldDurationMs: number = 1000;
    nozzleFeedFwd: number = 10;
    nozzleFeedBwd: number = 5;
    nozzleZValue: number = 1;

    constructor(
        readonly ids: {
            workAreaGlobalOffset: string;
            offset: string;
            restZValue: string;
            nozzleTemp: string;
            nozzleHoldDurationMs: string;
            nozzleFeedFwd: string;
            nozzleFeedBwd: string;
            nozzleZValue: string;
        }
    ) {
        this.load();
        const setOnChange = (id: string, targetField: string) => {
            document.querySelector<HTMLInputElement>("#" + id)!.onchange = (ev) => {
                const e = ev.target as HTMLInputElement;
                this[targetField] = Number(e.value);
                if (this.validate()) {
                    this.save();
                }
            };
        }
        const setDefault = (id: string, val: number) => {
            document.querySelector<HTMLInputElement>("#" + id)!.value = "" + val;
        }
        Object.keys(ids).forEach((k) => {
            setDefault(this.ids[k], this[k]);
            // This assumes the ids dict maps to the fields of Inputs 1:1 without name changes.
            setOnChange(this.ids[k], k);
        })
    }

    save(): void{
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
            this.toggleWarning(this.ids.nozzleFeedBwd, "Must be less than feed forward");
            this.toggleWarning(this.ids.nozzleFeedFwd, "Must be greater than feed backward");
            valid = false;
        } else {
            this.toggleWarning(this.ids.nozzleFeedFwd);
            this.toggleWarning(this.ids.nozzleFeedBwd);
        }
        if (this.restZValue <= this.nozzleZValue) {
            this.toggleWarning(this.ids.restZValue, "Must be greater than soldering Z-value");
            this.toggleWarning(this.ids.nozzleZValue, "Must be less than at-rest Z-value");
            valid = false;
        }else {
            this.toggleWarning(this.ids.restZValue);
            this.toggleWarning(this.ids.nozzleZValue);
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
