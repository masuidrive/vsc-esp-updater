import * as React from 'react';
import { XTerm } from 'xterm-for-react';
import { termInit, termClear, termLink, termUnlink, term } from "./terminal";
import Modal from 'react-bootstrap/Modal';
import { sleep } from "./utils";
import { EspLoader } from '@toit/esptool.js';

interface Props {}

const enum Progress {
  none = 0,
  resetting = 1,
  setting = 2,
  writing = 3,
  error = -1,
  done = 9,
}

interface State {
  port?: SerialPort;
  progress: Progress;
  loader?: EspLoader;
  writeProgress: number;
  writeErrorMessage: string;
}

export class App extends React.Component<Props, State> {
  private xtermRef = React.createRef<XTerm>();
  private baudRate = 115200;
  private uploadBaudRate = 921600;
  private loader?:EspLoader;

  constructor(props: Props) {
    super(props);

    this.state = {
      port: undefined,
      progress: Progress.none,
      writeProgress: 0,
      writeErrorMessage: '',
      loader: undefined,
    };

    this.handleCancelWritingFiles = this.handleCancelWritingFiles.bind(this);
    this.handleCloseWriteModal = this.handleCloseWriteModal.bind(this);
    this.handleResetDevice = this.handleResetDevice.bind(this);
    this.handleSerialConnect = this.handleSerialConnect.bind(this);
    this.serialDidDisconnect = this.serialDidDisconnect.bind(this);
    this.handleWriteFiles = this.handleWriteFiles.bind(this);
    this.handleCloseWriteModal = this.handleCloseWriteModal.bind(this);
  }

  componentDidMount() {
    termInit(this.xtermRef.current!.terminal);
  }

  async handleSerialConnect() {
    try {
      let newPort = await navigator.serial.requestPort({});
      this.setState({port: newPort});

      newPort.ondisconnect = this.serialDidDisconnect;

      await newPort.open({ baudRate: this.baudRate });
      termLink(this.state.port!);
      await sleep(100);
      await this.handleResetDevice();
    }
    catch(e) {
      console.error(e);
    }
  }

  async serialDidDisconnect(ev:Event) {
    termUnlink();
    this.setState({port: undefined});
    // loader?.disconnect();
    // loader = undefined;
  }

  async handleCancelWritingFiles() {
    await this.loader?.setBaudRate(this.uploadBaudRate, this.baudRate);
    await this.loader?.disconnect();
    this.loader = undefined;

    await this.handleResetDevice();
    await termLink(this.state.port!);
    this.setState({ progress: Progress.none });
  }

  async handleWriteFiles() {
    if(this.loader) {
      return;
    }

    await termUnlink();
    this.loader = new EspLoader(this.state.port!, { debug: false, logger: console });
    try {

      this.setState({progress: Progress.resetting});
      await this.loader!.connect();
      await this.loader!.sync();

      this.setState({progress: Progress.setting});
      const chipName = await this.loader!.chipName();
      const macAddr = await this.loader!.macAddr();
      await this.loader!.loadStub();
      await this.loader!.setBaudRate(this.baudRate, this.uploadBaudRate);

      this.setState({progress: Progress.writing});
      let project = await (
        await fetch("project.json", {
          cache: "no-cache",
        })
      ).json();

      const totalSize = project["files"].reduce(
        (a: any, b: any) => a + b.size,
        0
      ) as number;

      let wroteSize = 0;
      for (let i in project["files"]) {
        let file = project["files"][i];
        const fileSize = file["size"];

        let url = `data/${file["address"]}.bin`;
        let contents = await (
          await fetch(url, {
            cache: "no-cache",
          })
        ).arrayBuffer();
        await this.loader!.flashData(
          new Uint8Array(contents),
          parseInt(file["address"], 16),
          (idx, cnt) => {
            const writeProgress = Math.floor(
              (100 * (wroteSize + (fileSize * idx) / cnt)) / totalSize
            );
            this.setState({writeProgress});
          }
        );
        wroteSize += fileSize;
        await sleep(100);
      }
      this.setState({progress: Progress.done});
    } catch (err) {
      if (typeof err === "string") {
        this.setState({writeErrorMessage: err as string});
      } else if (err instanceof Error) {
        this.setState({writeErrorMessage: err.message});
      } else {
        this.setState({writeErrorMessage: "Unknown error"});
      }
      this.setState({progress: Progress.error});
    } finally {
      await this.loader?.setBaudRate(this.uploadBaudRate, this.baudRate);
      await this.loader?.disconnect();
      this.loader = undefined;

      await this.handleResetDevice();
      await termLink(this.state.port!);
    }
  }

  async handleResetDevice() {
    await this.state.port?.setSignals({ dataTerminalReady: false, requestToSend: true });
    sleep(100);
    await this.state.port?.setSignals({ dataTerminalReady: false, requestToSend: false });
    sleep(100);
  }

  handleCloseWriteModal() {
    this.setState({progress: Progress.none});
  }

  render() {
    const navBarLeft = this.state.port ? (
      <>
        <li className="nav-item">
          <button className="btn btn-primary me-3" onClick={this.handleWriteFiles}>
            <i className="fas fa-upload me-2"></i>
            Write
          </button>
        </li>
        <li className="nav-item">
          <button className="btn btn-outline-secondary me-3" onClick={this.handleResetDevice}>
            <i className="fas fa-redo me-2"></i>
            Reset device
          </button>
        </li>
        <li className="nav-item">
          <button className="btn btn-outline-secondary me-3" onClick={termClear}>
            <i className="fas fa-chalkboard me-2"></i>
            Clear terminal
          </button>
        </li>
      </>
    ) : (
      <li className="nav-item">
        <button onClick={this.handleSerialConnect} className="btn btn-primary me-3">
          <i className="fas fa-link me-2"></i>
          Connect to a ESP device
        </button>
      </li>
    );

    const navBarRight = this.state.port ? (
      <li className="nav-item">
        <button className="btn btn-outline-success" onClick={this.handleSerialConnect}>Switch port</button>
      </li>
    ) : (<></>);

    let progressEl = <></>;
    switch(this.state.progress) {
      case Progress.resetting:
        progressEl = (
          <div className="d-flex align-items-center">
            <div className="spinner-border me-2 text-info" role="status" aria-hidden="true"></div>
            Reseting and changing boot mode...
          </div>
        );
        break;
      case Progress.setting:
        progressEl = (
          <div className="d-flex align-items-center">
            <div className="spinner-border me-2 text-success" role="status" aria-hidden="true"></div>
            Setting up stub...
          </div>
        );
        break;
      case Progress.writing:
        progressEl = (
          <div>
            Writing image files...
            <div className="progress">
              <div id="modalProgress" className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow={0} aria-valuemin={0} aria-valuemax={this.state.writeProgress} style={{width: `${this.state.writeProgress}%`}}></div>
            </div>
          </div>
        );
        break;
      case Progress.done:
        progressEl = (
          <div>
            Finished to write images.
          </div>
        );
        break;
      case Progress.error:
        progressEl = (
          <div className="d-flex align-items-center text-danger mt-3">
            <i className="fas fa-exclamation-triangle fa-2x me-2"></i>
            <span id="modalErrorMessage">
              { this.state.writeErrorMessage }
            </span>
          </div>
        );
        break;
      }

    return (
      <div className="container-fluid">
        <nav className="navbar navbar-expand navbar-light bg-light">
          <span className="navbar-brand mb-0 h1">ESP Writer</span>
          <ul className="navbar-nav me-auto">
            { navBarLeft }
          </ul>
          <ul className="navbar-nav">　
            { navBarRight }
          </ul>
        </nav>

        <Modal show={this.state.progress !== Progress.none} onHide={this.handleCloseWriteModal}>
          <Modal.Header closeButton>
            <Modal.Title>Write built image to ESP device</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            { progressEl }
          </Modal.Body>
          <Modal.Footer>
            { this.state.progress === Progress.done ? (
              <button onClick={this.handleCloseWriteModal} className="btn btn-primary">
                Close
              </button>
            ) : (
              <button onClick={this.handleCancelWritingFiles} className="btn btn-outline-danger">
                Cancel
              </button>
            ) }
          </Modal.Footer>
        </Modal>

        <div id="terminal-wrap">
          <XTerm ref={this.xtermRef}/>
        </div>

      </div>
    );
  }
}