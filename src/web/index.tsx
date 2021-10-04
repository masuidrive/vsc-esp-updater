import "./style.scss";

import * as React from 'react';
import { render } from 'react-dom';
import { App } from './app';

const AppWrap = () => {
  const supportSerial = navigator.serial !== undefined;
  if(supportSerial) {
    return <App/>;
  }
  else {
    return (
      <div>
        <p>
          This browser doesn't support <a href="https://caniuse.com/web-serial">Web Serial</a> feature.
        </p>
        <p>
          Please try on Windows / macOS latest Chrome.
        </p>
      </div>
    );
  }
}


window.addEventListener("load", () => {
  render(<AppWrap/>, document.getElementById('app'));
});

