# term19
An electron based serial terminal focused on a streamlined workflow

## Screenshots

TODO 30JAN2021 upload screenshot(s), add link

## Downloading binaries

TODO 30JAN2021 create release binary, add link

## Background

I am a hardware engineer. I use serial ports. A lot. Yes, still in 2021.

The interface between a user and a device connected to a serial port is typically a serial terminal. Some popular serial terminals are:
- [PuTTY](https://www.chiark.greenend.org.uk/~sgtatham/putty/) - Windows
- [ExtraPuTTY](http://extraputty.com/) - Windows
- [KiTTY](http://www.9bis.net/kitty/) - Windows
- [TeraTerm](https://ttssh2.osdn.jp/) - Windows
- [CoolTerm](https://www.freeware.the-meiers.org/) - Windows / macOS / Linux
- [Serial](https://www.decisivetactics.com/products/serial/) - macOS
- [GNU Screen](https://www.gnu.org/software/screen/) - macOS / Linux

This project started out as an evaluation of whether [Node.js](https://nodejs.org/en/) was a reasonable alternative to [Python](https://www.python.org/) to create deployable serial port automation, logging, and data visualization applications. The JavaScript guys seem to be super productive *and* having fun. Could I? \[Spoiler: yes.\]

There are seemingly [many](https://xtermjs.org/) SSH and terminal sharing Node.js projects, but none for serial ports were found.

### Goals

What problems am I trying to solve (*or create?*) with term19? Feel free to frame these as user stories by prefixing them with: *As a user,*...

- I want to select my serial port from a *refreshable* pull down menu
    - I don't want to have to go to to the Device Manager or list the dev tree to see what ports are available
- I don't want to have to dig even deeper to sort out which serial port is which device
    - Was COM4 my PyBoard and COM3 my FTDI cable?! *Groan*
- I want my terminal to remember which serial port I am connected to, even when the application is closed
    - On that note, I want my terminal to remember the baud rate and all of the other settings, even when the application is closed
- I want easy to remember copy and paste key commands, that don't interfere with things like sending a *ctrl + c* / ASCII 0x03 / ETX character
- Add a key command to connect to the serial port, I want to be quick!
    - OK, I want key commands for *all the things*!
- I want to be able to quickly see which serial port I am connected to and at what baud rate
- I want flexible enter key behavior, sometimes LF, sometimes CR, sometimes both!
- I want an option for local echo (echo), in case my equipment doesn't chat back
- I want to be able to save my session to a log file
    - Some timestamps would be nice
- I want a clean UI and UX
    - Throw in some error messages
- I want my terminal to be reliable and performant
- I want my terminal to be cross platform (untested)

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

- [VisualStudio Code](https://code.visualstudio.com/) - a *does everything* text editor

### Building from source

TODO 30JAN2021 write instructions

### Contributing

Bug reports and pull requests are welcome.

### License

This project is licensed under the [GPLv3 License](LICENSE.md).