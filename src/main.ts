import './style.css'
import { parseDrillFile } from './drill.ts'
import { WorkArea } from './workarea.ts';

const workArea = new WorkArea(document.querySelector<HTMLElement>('#workarea')!);

const fileInput = document.querySelector<HTMLInputElement>('#drillfile');
fileInput!.addEventListener('change', () => {
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
})
// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
