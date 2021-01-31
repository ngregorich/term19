// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const Store = require('electron-store');
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
var fs = require('fs')

// global for access in multiple functions
const store = new Store();
var port = null;
var portStr = ''
var baudNum = 0
var logOn = false;
var echoOn = false;
var enterStr = ''
var term = new Terminal();
var logBuf = ''
var isConnected = false

const { remote } = require('electron')
const { Menu, MenuItem } = remote

// build Edit menu with copy and paste, with key commands
const menu = new Menu()
menu.append(new MenuItem({
  label: 'File',
  submenu: [{
    label: 'Quit',
    role: 'quit',
    accelerator: process.platform === 'darwin' ? 'cmd+shift+q' : 'ctrl+shift+q'
  }]
}))
menu.append(new MenuItem({
  label: 'Edit',
  submenu: [{
    label: 'Copy',
    role: 'copy',
    accelerator: process.platform === 'darwin' ? 'cmd+shift+c' : 'ctrl+shift+c'
  },
  {
    label: 'Paste',
    role: 'paste',
    accelerator: process.platform === 'darwin' ? 'cmd+shift+v' : 'ctrl+shift+v',
  }]
}))

// build Terminal menu with UI settings, with key commands
menu.append(new MenuItem({
  label: 'Terminal',
  submenu: [{
    label: 'Start / Stop',
    click() {
      if (document.getElementById('connectBox').checked) {
        document.getElementById('connectBox').checked = false;
      }
      else {
        document.getElementById('connectBox').checked = true;
      }
      term.focus()
      changeConnect(document.getElementById('connectBox'));
    },
    accelerator: process.platform === 'darwin' ? 'cmd+shift+s' : 'ctrl+shift+s'
  },
  {
    label: 'Refresh Ports',
    click() {
      term.focus()
      refreshPorts();
    },
    accelerator: process.platform === 'darwin' ? 'cmd+shift+r' : 'ctrl+shift+r'
  },
  {
    label: 'Log',
    click() {
      if (document.getElementById('logBox').checked) {
        document.getElementById('logBox').checked = false;
      }
      else {
        document.getElementById('logBox').checked = true;
      }
      term.focus()
      changeLog(document.getElementById('logBox'));
    },
    accelerator: process.platform === 'darwin' ? 'cmd+shift+l' : 'ctrl+shift+l'
  },
  {
    label: 'Echo',
    click() {
      if (document.getElementById('echoBox').checked) {
        document.getElementById('echoBox').checked = false;
      }
      else {
        document.getElementById('echoBox').checked = true;
      }
      term.focus()
      changeEcho(document.getElementById('logBox'));
    },
    accelerator: process.platform === 'darwin' ? 'cmd+shift+e' : 'ctrl+shift+e',

  }]
}))

Menu.setApplicationMenu(menu)

// required to fix current copy key command
// TODO 30JAN2021 this may not have fixed darwin / Mac
term.attachCustomKeyEventHandler(function (e) {
  // Ctrl + Shift + C
  if (e.ctrlKey && e.shiftKey && (e.keyCode == 3)) {
    var copySucceeded = document.execCommand('copy');
    return false;
  }
});

// TODO 30JAN2021 can / should a port disconnect call listPorts? 
function listPorts() {
  // print to terminal, we are going to list available ports
  term.write('\x1B[2mserial ports available:\r\n')
  // for each serial port detected
  SerialPort.list().then(ports => {
    var select = document.getElementById('portSelect');
    while (select.options.length > 0) {
      select.remove(0);
    }
    ports.forEach(function (port) {
      // TODO 30JAN2021 which console msgs are useful (info printed to terminal here)
      // log port information to console
      console.log(port.path);
      console.log(port.pnpId);
      console.log(port.manufacturer);

      // print available port info to term
      term.write('\r\n');
      term.write(port.path);
      term.write(' ');
      term.write(port.manufacturer);
      term.write('\r\n');
      term.write(port.pnpId);
      term.write('\r\n');

      // add port path to serial selector
      var el = document.createElement('option');
      el.textContent = port.path;
      el.value = port.path;
      select.appendChild(el);
    });
    // turn font back to white / normal
    term.write('\x1B[0m\r\n');
    // TODO 21JAN2021 add loopback port for demo / debug?

    // after ports are listed, now restore all persistent settings
    restoreSettings();
  });
}

// convert user facing enter nomenclature to escaped characters
function enterTranslator(enterUi) {
  switch (enterUi) {
    case 'CR':
      return '\r';
    case 'LF':
      return '\n';
    case 'CRLF':
      return '\r\n';
    case 'LFCR':
      return '\n\r';
    default:
      return '\r\n';
  }
}

// get selected enter
function getEnter() {
  selectedEnter = document.getElementById('enterSelect').value;
  // persistent store of selection
  store.set('enter', selectedEnter);
  return enterTranslator(selectedEnter);
}

// called by ui (html button or menu)
function refreshPorts() {
  listPorts()
  // always try to keep actual terminal in focus, ready to accept user input
  term.focus();
}

// called when user changes port
function changePort() {
  // clears red any red error text next to stop / start checkbox
  clearErrors();
  portStr = document.getElementById('portSelect').value;
  store.set('port', portStr);
  term.focus();
}

// called when user changes baud
function changeBaud() {
  clearErrors();
  baudNum = parseInt(document.getElementById('baudSelect').value);
  store.set('baud', baudNum);
  term.focus();
}

// called when user changes enter type
function changeEnter() {
  clearErrors();
  // gets enter choice (CR, LF, etc)
  enterStr = getEnter();
  term.focus();
}

// called when echo checkbox changes
function changeEcho(checkbox) {
  clearErrors();
  if (checkbox.checked) {
    echoOn = true;
  }
  else {
    echoOn = false;
  }
  store.set('echo', echoOn);
  console.log(store.get('echo'));
  term.focus();
}

// called when log checkbox changes
function changeLog(checkbox) {
  clearErrors();
  if (checkbox.checked) {
    logOn = true;
  }
  else {
    logOn = false;
  }
  store.set('log', logOn);
  term.focus();
}

// clears red text errors next to start / stop checkbox
function clearErrors() {
  document.getElementById('errorOut').textContent = '';
  document.getElementById('errorOut').className = 'settingsBar';
}

// restores persistent settings from electron-store storage
function restoreSettings() {
  document.getElementById('portSelect').value = store.get('port');
  document.getElementById('baudSelect').value = store.get('baud');
  document.getElementById('enterSelect').value = store.get('enter');
  document.getElementById('echoBox').checked = store.get('echo');
  document.getElementById('logBox').checked = store.get('log');
  portStr = document.getElementById('portSelect').value;
  // returns int of stored baud string
  baudNum = parseInt(document.getElementById('baudSelect').value);
  enterStr = enterTranslator();
  echoOn = document.getElementById('echoBox').checked;
  logOn = document.getElementById('logBox').checked;
  term.focus();
}

// called when connect checkbox changes
function changeConnect(checkbox) {
  clearErrors();
  // if trying to connect
  if (checkbox.checked) {
    // create new node serialport, at user baud rate, automatically opened
    port = new SerialPort(portStr, { autoOpen: true, baudRate: baudNum })
    // TODO 30JAN2021 this should likely go in a port.on('open' callback
    // this is set to false when user disconnects port
    isConnected = true

    // TODO 30JAN2021 add user facing error msg to callback
    port.on('error', function (err) { console.log('Error: ', err.message) })
    // when port is closed by user or disconnected port
    port.on('close', function (err) {
      // if port should be connected (user has started but not stopped connection)
      if (isConnected) {
        // show red error text next to start / stop check box
        document.getElementById('errorOut').textContent = 'Error: ' + portStr + ' not available';
        document.getElementById('errorOut').className = 'settingsError';
        // force start / stop checkbox to stop (false)
        document.getElementById('connectBox').checked = false;
        // TODO 30JAN2021 is this still needed when info presented to user in html
        console.log('uncaughtException: ', err.message);
        console.log('Error: ' + portStr + ' not available');
      }
    })

    // TODO 30JAN2021 this should likely go in a port.on('open callback
    console.log('Opened ' + portStr + ' @ ' + baudNum)
    term.focus();

    // when serialport receives data, show data on terminal
    port.on('data', function (data) {
      term.write(data);
    })
  }
  // if checkbox is now set to stop (unchecked)
  else {
    // must set isConnected to false before closing serialport
    isConnected = false;
    // close serialport connection
    port.close();
    // set port to null so that next connection can be to a different path (serialport.js speak for port)
    port = null;
    console.log('Closed ' + portStr + ' @ ' + baudNum);
  }
}

// upon new data to terminal
// TODO 30JAN2021 refactor e variable to a better name
term.onData(charIn => {
  // if there's no serialport, print red error text
  if (port === null) {
    document.getElementById('errorOut').textContent = 'Error: not connected';
    document.getElementById('errorOut').className = 'settingsError';
    console.log('Error: not connected')
  }
  // if a serial port exists
  else {
    switch (charIn) {
      case '\u007f':
        if (term._core.buffer.x > 0) {
          term.write('\b \b');
        }
        break;
      case '\r':
        // send to serialport the user selected enter type
        port.write(enterStr);
        // if user enabled logging
        if (logOn) {
          // log timestamp in this format: 1611249752027
          // TODO 30JAN2021 add date to timestamp
          now = new Date().getTime()
          // concatenate time stamp comma separated from user input line
          temp = now + ',' + logBuf + '\r\n';
          // flush concatenated line to log.csv
          // TODO 30JAN2021 name logs with date then append -001, -002 for each logging session
          fs.appendFile('log.csv', temp, function (err) {
            if (err) throw err;
          });
          // clear user input line buffer
        }
        logBuf = '';
        break;
      default:
        // send character to serialport
        port.write(charIn)
        // if local echo turned on
        if (echoOn) {
          // print local echo to terminal
          term.write(charIn)
        }
        // add character to local line buffer used for logging
        logBuf += charIn;
    }
  }
});

// open terminal in html
term.open(document.getElementById('terminal'));
// find available serial ports
listPorts();

