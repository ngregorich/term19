// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var term = new Terminal();
        term.open(document.getElementById('terminal'));
        term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')

        function iterateOverArray() {
            // generate random number 0-255 inclusive
            num = Math.floor((Math.random() * 255));
            // pack random number in realistic logging stream
            stringToTx = '0,' + num.toString() + ',404,\r\n';
            term.write(stringToTx);
            console.log('tx: ' + stringToTx);
        }

        // generate new data every 1000 ms
        dataGenTimer = setInterval(iterateOverArray, 1000);

        function prompt(term) {
            term.write('\r\n$ ');
        }

        term.onData(e => {
            switch (e) {
                case '\r': // Enter
                case '\u0003': // Ctrl+C
                    prompt(term);
                    break;
                case '\u007F': // Backspace (DEL)
                    // Do not delete the prompt
                    if (term._core.buffer.x > 2) {
                        term.write('\b \b');
                    }
                    break;
                default: // Print all other characters for demo
                    term.write(e);
            }
        });
