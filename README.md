# MCIL Common
This package is used by the `mcil-mcedit`, `mcil-command` and `mcil-world` repositories to do the common process of parsing MCIL and converting it into a block sequence. The individual modules then take care of outputting platform-dependant information.

## Usage

Installation from [NPM](https://npmjs.org):

```bash
$ npm install mcil-common --save
```

Basic usage:

```js
var mcil = require('mcil-common');
var code = /* get the code */;

mcil.trace(code, { width: 100, height: 100, depth: 100 }, function(block) {
    console.log("Place a " + block.name + " at (" + [block.x, block.y, block.z] + ")");
});

```

## Layout

The library attempts to follow a linear output, where commands continue out towards the longest axis. It starts at the initial branch, and lays out blocks in the pattern set.

When a command block instruction is encountered, a command block is placed at the current position, and the position is moved in the direction. All of the command blocks except the first one are set to chain and are always active. When a 'wait' instruction is encountered, there are two things that could happen depending on the wait duration: for a short wait duration, one or more repeaters are placed sequentially. For a longer duration, a command block loop is setup that increments a scoreboard value every tick, and continues the branch execution once the value has reached a certain amount.

To provide optimum performance, the library optimizes branch operations. When a branch instruction is encountered, the library first checks if the new branch is referenced elsewhere. If it is not, the branch is able to be joined directly to the original branch.

The resulting branch may look like this:

![Diagram](http://i.imgur.com/hVwwxTu.png)

In this diagram, the main branch is yellow wool, the secondary branch is blue wool, and the "decider" command block is red.

If the branch _is_ encountered elsewhere, the library must place the branch contents in a location where it can be triggered by all references. The branch is then activated by `setblock`-ing a redstone block at the beginning of the branch, which then clears the redstone block and continues branch execution.

### Block Conflicts

`mcil-common` gracefully handles the case where two execution blocks need to go in the same place, by redirecting one of the streams. This is done on a 'first in first served' basis, whereby the earlier a branch is executed, the higher its priority when it comes to redirecting. The library also redirects a branch when the branch reaches the world edge (set by the second parameter to `mcil.trace`).

When redirecting is required, the library will attempt to simply 'wrap around'.

![Diagram](http://i.imgur.com/5i18PQM.png)

As shown in this diagram, the blue branch reaches the yellow branch, and so wraps around to be facing the opposite direction as it originally was.

### Command normalisation

Any relative coordinates in a command are changed to be relative to the _origin point_, or the coordinates (0,0,0) in the world representation.
