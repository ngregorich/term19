// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const Store = require('electron-store');
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')

// global for access in multiple functions
const store = new Store();
var port = null;
var portStr = ''
var baudNum = 0
var logOn = false;
var echoOn = false;
var enterStr = ''
var term = new Terminal();

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
      var el = document.createElement("option");
      el.textContent = port.path;
      el.value = port.path;
      select.appendChild(el);
    });
    for (i = 0; i < select.length; i++) {
      console.log(select.options[i].value);
    }
  });
  // 20 JAN 2021 - looking at javascript then promise to load list before loading previous selected
  console.log(store.get('port'));
  document.getElementById('portSelect').value = store.get('port');
  restoreSettings();
}

// // get selected serial port
// function getSelPort() {
//   selectedPort = document.getElementById('portSelect').value;
  
//   return selectedPort;
// }

// // get selected baud
// function getBaud() {
//   selectedBaud = document.getElementById('baudSelect').value;
  
//   return parseInt(selectedBaud);
// }

// get selected enter
function getEnter() {
  selectedEnter = document.getElementById('enterSelect').value;
  store.set('enter', selectedEnter);
  switch (selectedEnter) {
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

// called when enter select changes
function refreshPorts() {
  listPorts()
  // term.focus();
}

// called when port select changes
function changePort() {
  portStr = document.getElementById('portSelect').value;
  store.set('port', portStr);
  // term.focus();
}

// called when baud select changes
function changeBaud() {
  baudNum = parseInt(document.getElementById('baudSelect').value);
  store.set('baud', baudNum);
  // term.focus();
}

// called when enter select changes
function changeEnter() {
  enterStr = getEnter();
  term.focus();
}

// called when echo checkbox changes
function changeEcho(checkbox) {
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
  if (checkbox.checked) {
    logOn = true;
  }
  else {
    logOn = false;
  }
  store.set('log', logOn);
  term.focus();
}

function restoreSettings() {
  // console.log('trying to load: ' + store.get('port'));
  // document.getElementById('portSelect').value = store.get('port');
  document.getElementById('baudSelect').value = store.get('baud');
  document.getElementById('enterSelect').value = store.get('enter');
  document.getElementById('echoBox').checked = store.get('echo');
  document.getElementById('logBox').checked = store.get('log');
  // console.log(store.get('port'))
}

// called when connect checkbox changes
function changeConnect(checkbox) {
  if (checkbox.checked) {
    // portStr = getSelPort()
    // baudNum = getBaud()

    port = new SerialPort(portStr, { autoOpen: true, baudRate: baudNum })
    port.on('error', function (err) { console.log('Error: ', err.message) })
    console.log('Opened ' + portStr + ' @ ' + baudNum)

    term.focus();

    // port.write(stringToTx);
    // console.log('tx: ' + stringToTx);

    port.on('data', function (data) {
      // console.log('Data:', data)
      term.write(data);
    })

    // parser creates event every time a \n newline is detected
    // const parser = port.pipe(new Readline({ delimiter: '\n' }))

    // when parser creates an event
    // parser.on('data', data => {
    //   term.write(data);
    //   // log received string to console
    //   console.log('rx: ' + data);
    // });

    // parser.on('data', data => {
    //   if (logOn) {
    //     now = new Date().getTime()
    //     temp = now + ',' + data + '\n'
    //     fs.appendFile('log.csv', temp, function (err) {
    //       if (err) throw err;
    //     });
    //   }
    // })
  }
  else {
    port.close()
    port = null;
    console.log('Closed ' + selPort + ' @ ' + selBaud);
  }
}

term.open(document.getElementById('terminal'));
// term.write('Hello from \x1B[1;3;31mTerminal\x1B[0m $ ')

function prompt(term) {
  term.write('\r\n');
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
      // term.write(e);
      if (port === null) {
        console.log('Error: not connected')
      }
      else {
        if (e == '\r') {
          port.write(enterStr);
          // prompt(term);
        }
        else {
          port.write(e)
          if (echoOn) {
            term.write(e)
          }
        }
      }
  }
});

// list available ports to console
listPorts();
// restoreSettings();
// changeBaud();
// changeEnter();
