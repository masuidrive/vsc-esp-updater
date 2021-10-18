// Don't work WebSerial into Web Worker
onmessage = async (e: any) => {
  console.log("Workerwww: Message received from main script", e.data);
  if (e.data.command === "write") {
    const ports = await navigator.serial.getPorts();
    ports[0].addEventListener("connect", (e) => console.log("connect>0", e));
    ports[1].addEventListener("connect", (e) => console.log("connect>1", e));
    ports[0].onconnect = (e) => console.log("connect>0.", e);
    ports[1].onconnect = (e) => console.log("connect>1.", e);
    console.log(ports[0]);
    console.log(await ports[0].open({ baudRate: 921600 }));
    console.log(await ports[1].open({ baudRate: 921600 }));

    postMessage("Please write two numbers");
  } else {
  }
};
