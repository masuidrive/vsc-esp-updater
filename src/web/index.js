import { EspLoader } from './esptool';
import "./style.scss";

let espTool;

async function readLoop() {
    reader = port.readable.getReader();
    while (true) {
        const { value, done } = await reader.read();
        if (done) {
        reader.releaseLock();
        break;
        }
        inputBuffer = inputBuffer.concat(Array.from(value));
    }
}

function formatMacAddr(macAddr) {
    return macAddr.map(value => value.toString(16).toUpperCase().padStart(2, "0")).join(":");
}

async function doConnect() {
    await espTool.connect();
    readLoop();
    if (await espTool.sync()) {
        console.log("Connected to " + await espTool.chipName());
        console.log("MAC Address: " + formatMacAddr(espTool.macAddr()));
        espTool = await espTool.runStub();
    }
    console.log('connected');
}

async function doErase() {
    await espTool.eraseFlash();
}

async function doProgam() {
    try {
        let files = (await (await fetch('data/files.json', {
        cache: 'no-cache'
        })).json());
        console.log(files);

        for(let i in files['addresses']) {
        let addr = files['addresses'][i];
        let url = 'data/' + String(addr).replace('0x', '')+'.bin';
        let contents = (await (await fetch(url, {
            cache: 'no-cache'
        })).arrayBuffer());

        await espTool.flashData(contents, parseInt(addr, 16), i);
        await new Promise(resolve => setTimeout(resolve, 100));
        }
        console.log('done');
    }
    catch(e) {
        console.error(e);
    }
}

window.addEventListener('load', () => {
    espTool = new EspLoader({
        updateProgress: console.log,
        logMsg: console.log,
        debugMsg: console.log,
        debug: console.log
    });
    document.getElementById('btnConnect').addEventListener('click', doConnect);
    document.getElementById('btnErase').addEventListener('click', doErase);
    document.getElementById('btnProgram').addEventListener('click', doProgam);
});
