Place a portable Windows Node.js runtime in this folder when a machine should not depend on globally installed Node.

Expected files:

- runtime/node/node.exe
- runtime/node/nodew.exe
- runtime/node/npm.cmd

The VBS launchers and launch-xinyuexia.mjs check this folder before system Node, Codex bundled Node, or PATH.
