# term19
An electron based serial terminal focused on a streamlined workflow

## Screenshots

![hello_world](https://user-images.githubusercontent.com/44035038/106377024-d493ff80-634e-11eb-9e58-77e91453e33f.png)

![terminal_menu](https://user-images.githubusercontent.com/44035038/106377078-48360c80-634f-11eb-903d-ccdb4ef6ad94.png)

## Downloading

[v0.0.2](https://drive.google.com/file/d/1ISRazsSqB5K4MqbIA3yQMvbwQGME6AAr/view?usp=sharing) portable binary .zip for win32 and x64 (60 MB)
[v0.0.1](https://drive.google.com/file/d/1UQ8NOF8o5JViOawQrFrpKXQ_qp0Bykh7/view?usp=sharing) portable binary .zip for win32 and x64 (60 MB)

Unzip and double click *term19.exe* to run.

## Background

I am a hardware engineer. I use serial ports. *A lot*. Yes, still in 2021.

The interface between a user and a device connected to a serial port is typically a serial terminal. Some popular serial terminals are:
- [PuTTY](https://www.chiark.greenend.org.uk/~sgtatham/putty/) - Windows
- [ExtraPuTTY](http://extraputty.com/) - Windows
- [KiTTY](http://www.9bis.net/kitty/) - Windows
- [TeraTerm](https://ttssh2.osdn.jp/) - Windows
- [CoolTerm](https://www.freeware.the-meiers.org/) - Windows / macOS / Linux
- [Serial](https://www.decisivetactics.com/products/serial/) - macOS
- [GNU Screen](https://www.gnu.org/software/screen/) - macOS / Linux

This project started out as an evaluation of whether [Node.js](https://nodejs.org/en/) was a reasonable alternative to [Python](https://www.python.org/) to create deployable serial port automation, logging, and data visualization applications. The JavaScript folks seem to be super productive *and* having fun. Could I? \[*Spoiler: yes.*\]

There are seemingly [many](https://xtermjs.org/) SSH and terminal sharing Node.js projects, but none for serial ports.

### Goals

What problems am I trying to solve (*or create?*) with term19? Feel free to frame these as user stories by prefixing them with: *As a user,*...

- I want to select my serial port from a *refreshable* pull down menu
    - I don't want to have to go to to the Device Manager or list the dev tree to see what ports are available
- I don't want to have to dig even deeper to sort out which serial port is which device
    - Was COM3 my pyboard and COM4 my FTDI cable?! *Groan*
- I want my terminal to remember which serial port I am connected to, even when the application is closed
    - On that note, I want my terminal to remember the baud rate and all of the other settings, even when the application is closed
- I want easy to remember copy and paste key commands, that don't interfere with things like sending a *ctrl + c* / ASCII 0x03 / ETX character
- I want to open the terminal and connect with 1 key command (or click)
    - OK, I want key commands for *all the things*!
- I want to be able to quickly see which serial port I am connected to and at what baud rate
- I want flexible enter key behavior: sometimes LF, sometimes CR, sometimes both!
- I want an option for local echo (echo), in case my equipment doesn't chat back
- I want to be able to save my session to a log file
    - Some timestamps would be nice
- I want a clean UI and UX
    - Throw in some error messages
- I want my terminal to be reliable and performant
- I want my terminal to be cross platform

And: *As a developer*...

- I want my terminal to be easy to deploy
- I want to leverage as much preexisting code as possible
- I want to release the code under an open source license

## Development

### Acknowledgements

This project builds on the shoulders of the following giants, and would have taken at least an order of magnitude longer without:

- [Node.js](https://nodejs.org/en/) - event driven JavaScript
- [Electron](https://www.electronjs.org/) - portable GUI framework
- [serialport](https://serialport.io/) - Node.js serial library
- [xterm.js](https://xtermjs.org/) - fully featured JavaScript

Small utilities also make life easier:

- [electron-store](https://github.com/sindresorhus/electron-store) - simple data persistance library
- [fs](https://nodejs.dev/learn/the-nodejs-fs-module) - Node.js file access module

And finally:

- [Visual Studio Code](https://code.visualstudio.com/) - a *does everything* text editor

### Building from source

1. Clone this repo: ```git clone git@github.com:ngregorich/term19.git```
1. Run ```npm install``` to install term19 dependencies
1. Run ```npm start``` to run the application
1. *Optionally* run ```electron packager .``` to bundle the Electron application

### Known issues

The code has a number of TODO items which include include:

- Testing on and packaging for macOS and Linux
- Adding a loopback serial port for demo and debug
- Adding tests
- Storing each logged run as with a name in log-date-run.csv format
- Supporting window resizing
- *Possibly* supporting data frame sizes other than 8 bits 
- *Possibly* supporting parity bits
- *Possibly* supporting stop bit sizes other than 1 bit
- *Possibly* supporting color customization

### Contributing

Bug reports and pull requests are welcome.

### License

This project is licensed under the [GPLv3 License](LICENSE.md).