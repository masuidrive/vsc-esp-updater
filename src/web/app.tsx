import * as React from 'react';

export const App = () => {
  return (
  <><nav className="navbar navbar-expand-lg navbar-light bg-light">
  <div className="container-fluid">

    <div className="collapse navbar-collapse">
      <span className="navbar-brand mb-0 h1">ESP Writer</span>
      <ul className="navbar-nav me-auto mb-2 mb-lg-0">
        <li id="navConnect" className="nav-item">
          <button id="btnConnect" type="button" className="btn btn-primary me-3">
            <i className="fas fa-link"></i>
            Connect to a ESP device
          </button>
        </li>

        <li id="navWrite" className="nav-item">
          <button id="btnWrite" type="button" className="btn btn-primary me-3">
            <i className="fas fa-upload"></i>
            Write
          </button>
        </li>
      </ul>
      <form id="navSwitchDevice" className="d-flex">
        <button id="btnSwitchDevice" className="btn btn-outline-success" type="submit">Search</button>
      </form>
    </div>
  </div>
</nav>

<div id="modalWrite" className="modal" tabIndex={-1}>
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">
          Write built image to ESP device
        </h5>
        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div className="modal-body">
        <div id="modalReseting">
          <div className="d-flex align-items-center">
            <div className="spinner-border me-2 text-info" role="status" aria-hidden="true"></div>
            Reseting and changing boot mode...
          </div>
        </div>
        <div id="modalStub">
          <div className="d-flex align-items-center">
            <div className="spinner-border me-2 text-success" role="status" aria-hidden="true"></div>
            Setting up stub...
          </div>
        </div>

        <div id="modalWriting">
          Writing image files...
          <div className="progress">
            <div id="modalProgress" className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100} style={{width: 0}}></div>
          </div>
        </div>
        <div id="modalSuccess">
          Finished to write images.
        </div>
        <div id="modalError">
          <div className="d-flex align-items-center text-danger mt-3">
            <i className="fas fa-exclamation-triangle fa-2x me-2"></i>
            <span id="modalErrorMessage">
              It's error message.
            </span>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button id="modalBtnClose" type="button" className="btn btn-primary" data-bs-dismiss="modal">
          Close
        </button>
        <button id="modalBtnCancel" type="button" className="btn btn-outline-danger">
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>
<div id="terminal-wrap">
  <div id="terminal"></div>
  <div id="local-echo-panel" className="d-flex bd-highlight align-items-center p-1">
    <input id="checkLocalEcho" className="form-check-input me-2 ms-2" type="checkbox" value=""/>
    <label className="form-check-label" for="check-local-echo">
      Local echo
    </label>
    <button id="btnClear" type="button" className="btn btn-outline-light btn-clear ms-3 me-1">Clear</button>
  </div>
</div></>);
};