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

function listPorts() {
  // for each serial port detected
  SerialPort.list().then(ports => {
    var select = document.getElementById('portSelect');
    while (select.options.length > 0) {
      select.remove(0);
    }
    ports.forEach(function (port) {
      // log port information to console
      console.log(port.path);
      console.log(port.pnpId);
      console.log(port.manufacturer);

      // add port path to serial selector
      var el = document.createElement('option');
      el.textContent = port.path;
      el.value = port.path;
      select.appendChild(el);
    });
    // TODO 21JAN2021 add loopback?

    // after ports are listed, now restore all persistent settings
    restoreSettings();
  });
}

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
  store.set('enter', selectedEnter);
  return enterTranslator(selectedEnter);
}

// called when enter select changes
function refreshPorts() {
  listPorts()
  term.focus();
}

// called when port select changes
function changePort() {
  clearErrors();
  portStr = document.getElementById('portSelect').value;
  store.set('port', portStr);
  term.focus();
}

// called when baud select changes
function changeBaud() {
  clearErrors();
  baudNum = parseInt(document.getElementById('baudSelect').value);
  store.set('baud', baudNum);
  term.focus();
}

// called when enter select changes
function changeEnter() {
  clearErrors();
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

function clearErrors() {
  document.getElementById('errorOut').textContent='';
  document.getElementById('errorOut').className='settingsBar';
}

function restoreSettings() {
  document.getElementById('portSelect').value = store.get('port');
  document.getElementById('baudSelect').value = store.get('baud');
  document.getElementById('enterSelect').value = store.get('enter');
  document.getElementById('echoBox').checked = store.get('echo');
  document.getElementById('logBox').checked = store.get('log');
  portStr = document.getElementById('portSelect').value;
  baudNum = parseInt(document.getElementById('baudSelect').value);
  enterStr = enterTranslator();
  echoOn = document.getElementById('echoBox').checked;
  logOn = document.getElementById('logBox').checked;
  term.focus();
}

// called when connect checkbox changes
function changeConnect(checkbox) {
  clearErrors();
  if (checkbox.checked) {
    port = new SerialPort(portStr, { autoOpen: true, baudRate: baudNum })

    port.on('error', function (err) { console.log('Error: ', err.message) })
    port.on('close', function (err) {
      document.getElementById('errorOut').textContent='Error: ' + portStr + ' not available';
      document.getElementById('errorOut').className='settingsError';
      document.getElementById('connectBox').checked = false;
      console.log('uncaughtException: ', err.message);
      console.log('Error: ' + portStr + ' not available');
    })

    // TODO shows opened even if failed
    console.log('Opened ' + portStr + ' @ ' + baudNum)
    term.focus();

    port.on('data', function (data) {
      term.write(data);
    })
  }
  else {
    port.close()
    port = null;
    console.log('Closed ' + portStr + ' @ ' + baudNum);
  }
}


term.onData(e => {
  switch (e) {
    // case '\r': // Enter
    // case '\u0003': // Ctrl+C
    //   prompt(term);
    //   break;
    // case '\u007F': // Backspace (DEL)
    //   // Do not delete the prompt
    //   if (term._core.buffer.x > 2) {
      //     term.write('\b \b');
      //   }
      //   break;
      default: // Print all other characters for demo
      if (port === null) {
        document.getElementById('errorOut').textContent='Error: not connected';
        document.getElementById('errorOut').className='settingsError';
        console.log('Error: not connected')
      }
      else {
        if (e == '\r') {
          // TODO 21JAN2021 desire buffer to log
          port.write(enterStr);
          console.log(logOn)
          if (logOn) {
            now = new Date().getTime()
            temp = now + ',' + logBuf + '\r\n';
            fs.appendFile('log.csv', temp, function (err) {
              if (err) throw err;
            });
          }
          logBuf = '';
        }
        else if (e == '\u007f') { // backspace
          if (term._core.buffer.x > 0) { // if any characters in line buffer
              term.write('\b \b');
            }
        }
        else {
          port.write(e)
          if (echoOn) {
            term.write(e)
          }
          logBuf += e;
        }
      }
    }
  });
  
  term.open(document.getElementById('terminal'));
  listPorts();
  
  