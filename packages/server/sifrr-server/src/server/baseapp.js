const delegate = require('./delegate');
const fs = require('fs');
const path = require('path');
const uWS = require('uWebSockets.js');
const sendFile = require('./sendfile');

const requiredHeaders = ['if-modified-since', 'range'];
const noOp = () => true;

class BaseApp {
  file(servingPattern, folder, options = {}, base = folder) {
    if (servingPattern === '/') servingPattern = '';
    options = Object.assign({
      lastModified: true,
      contentType: true
    }, options);
    const filter = options.filter || noOp;

    // serve single file
    if (!fs.statSync(folder).isDirectory()) {
      const fileName = path.basename(folder);
      const folderName = path.dirname(folder);
      this._app.get(servingPattern + '/' + fileName, this._serveFromFolder(folderName, options));
      return this;
    }

    // serve folder
    fs.readdirSync(folder).forEach(file => {
      // Absolute path
      const filePath = path.join(folder, file);

      // Return if filtered
      if (!filter(filePath)) return;

      const serveFromThisFolder = this._serveFromFolder(folder, options);
      if (fs.statSync(filePath).isDirectory()) {
        // Recursive if directory
        this.file(servingPattern, filePath, options, base);
      } else {
        // serve from this folder
        this._app.get(servingPattern + '/' + path.relative(base, filePath), serveFromThisFolder);
      }
    });
    return this;
  }

  _serveFromFolder(folder, options) {
    return (res, req) => {
      const filePath = path.join(folder, req.getUrl().substr(1));
      const reqHeaders = {};
      requiredHeaders.forEach(k => reqHeaders[k] = req.getHeader(k));

      sendFile(res, filePath, reqHeaders, options);
    };
  }

  listen(h, p, cb) {
    if (typeof cb === 'function') {
      this._app.listen(h, p, (socket) => {
        this._socket = socket;
        cb(socket);
      });
    } else {
      this._app.listen(h, (socket) => {
        this._socket = socket;
        p(socket);
      });
    }
  }

  close() {
    if (this._socket) {
      uWS.us_listen_socket_close(this._socket);
      this._socket = null;
    }
  }
}

const methods = [
  'any',
  'connect',
  'del',
  'get',
  'head',
  'listen',
  'options',
  'patch',
  'post',
  'put',
  'trace',
  'ws',
];

delegate(methods, BaseApp.prototype, '_app');

module.exports = BaseApp;
