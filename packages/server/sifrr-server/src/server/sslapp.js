const uWS = require('uWebSockets.js');
const BaseApp = require('./baseapp');

class SSLApp extends BaseApp {
  constructor(options) {
    super();
    this._app = uWS.SSLApp(options);
  }
}

module.exports = SSLApp;
