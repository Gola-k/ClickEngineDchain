

ClickEngine is a full-featured, no-code, open-source game development software. You can build games for mobile, desktop and the web. ClickEngine is fast and easy to use: the game logic is built up using an intuitive and powerful event-based system.

## Open the netlify link here
[ClickEngine-Netlify](https://6681a1a8fab9d0611bb7b231--polite-pixie-86e8ff.netlify.app/)

## Overview of the architecture

| Directory     | ℹ️ Description                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------- |
| `Core`        | ClickEngine core library, containing common tools to implement the IDE and work with ClickEngine games. |
| `GDJS`        | The game engine, written in TypeScript, using PixiJS (WebGL), powering all ClickEngine games.        |
| `ClickEngine.js` | Bindings of `Core`, `GDJS` and `Extensions` to JavaScript (with WebAssembly), used by the IDE.    |
| `newIDE`      | The game editor, written in JavaScript with React, Electron and PixiJS.                           |
| `Extensions`  | Extensions for the game engine, providing objects, behaviors, events and new features.            |

To learn more about ClickEngine Architecture, read the [architecture overview here](Core/ClickEngine-Architecture-Overview.md).

Pre-generated documentation of the Core library, C++ and TypeScript game engines is [available here](https://docs.ClickEngine.io).

Status of the tests and builds: [![Windows Build status](https://ci.appveyor.com/api/projects/status/84uhtdox47xp422x/branch/master?svg=true)](https://ci.appveyor.com/project/4ian/ClickEngine/branch/master) [![https://good-labs.github.io/greater-good-affirmation/assets/images/badge.svg](https://good-labs.github.io/greater-good-affirmation/assets/images/badge.svg)](https://good-labs.github.io/greater-good-affirmation)


## License

- The Core library, the native and HTML5 game engines, the IDE, and all extensions (respectively `Core`, `GDJS`, `newIDE` and `Extensions` folders) are under the **MIT license**.
- The name, ClickEngine, and its logo are the exclusive property of Florian Rival.

Games exported with ClickEngine are based on the GDevelop game engine (see `Core` and `GDJS` folders): this engine is distributed under the MIT license so that you can **distribute, sell or do anything** with the games you created with GDevelop. In particular, you are not forced to make your game open-source.

[node.js]: https://nodejs.org

### Credits for GDJS Game Engine: GDevelop
