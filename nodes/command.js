var Block = require('../Block');

module.exports = function(i, node, branchId, branches, world, _isConditional) {
    var finalDirection;
    var blockName = i === 0 ? 'minecraft:command_block' : 'minecraft:chain_command_block';

    var currentBranch = branches[branchId];

    // convert relative coordinates to be relative to the origin
    // we need to try and guess if the relative coordinate is X, Y, or Z, so we do this by
    // keeping track of whichever type was previously encountered, and using the next
    // in the order of XYZ.
    // we also implement the 'flags' *, x, y, and z. * means that we shouldn't change the relative
    // coordinate, and the other flags specifically say which dimension this is for.
    var currentFound = 0;
    var commandParams = node.params.replace(/\b~(-?((\d+)|(\d?\.\d+))[\*xyz]?)\b/gi, function(all, match) {
        var matchLength = match.length;
        var lastCharacter = match.substring(-1);

        switch (lastCharacter) {
            case '*': return "~" + match.substr(0, matchLength - 1);
            case 'x':
                currentFound = 0;
                match = match.substr(0, matchLength - 1);
                break;
            case 'y':
                currentFound = 1;
                match = match.substr(0, matchLength - 1);
                break;
            case 'z':
                currentFound = 2;
                match = match.substr(0, matchLength - 1);
                break;
        }

        var relativePosition = parseFloat(match);

        currentFound++;

        if (currentFound === 1) relativePosition += world.x;
        else if (currentFound === 2) relativePosition += world.y;
        else if (currentFound === 3) {
            currentFound = 0;
            relativePosition += world.z;
        }

        return "~" + relativePosition;
    });

    if (!world.isTurning && !world.available(Math.min(2, currentBranch.length - i))) {
        var dx = world.direction.x;
        var dy = world.direction.y;
        var dz = world.direction.z;

        // first try a simple 'turn around'
        // these directions are possible sides to go to turn around... of course it shouldn't
        // be possible to turn into the current direction (e.g. facing +x, turn to +x and then
        // continue down -x)
        var turnAroundDirections = [
            { x: !dx * 1,  y: 0,        z: 0        },
            { x: !dx * -1, y: 0,        z: 0        },
            { x: 0,        y: !dy * 1,  z: 0        },
            { x: 0,        y: !dy * -1, z: 0        },
            { x: 0,        y: 0,        z: !dz * 1  },
            { x: 0,        y: 0,        z: !dz * -1 }
        ];

        var oppositeDirection = {
            x: dx * -1,
            y: dy * -1,
            z: dz * -1
        };

        var maxDistance = 1, maxDirection = false;
        for (var x = 0; x < turnAroundDirections.length; x++) {
            var dir = turnAroundDirections[x];
            if (dir.x === 0 && dir.y === 0 && dir.z === 0) continue;

            var distance = world.availableDistance(oppositeDirection, {
                x: dx + dir.x,
                y: dy + dir.y,
                z: dz + dir.z
            });
            if (distance > maxDistance) {
                maxDistance = distance;
                maxDirection = dir;
            }
        }

        if (maxDirection) {
            finalDirection = maxDirection;
            world.directionPattern.push(maxDirection);
            world.direction = oppositeDirection;
            world.isTurning = true;
        } else {
            // cant go backwards, try just continuing another direction
            // if this also fails, we will need to do create a new branch with the
            // remaining nodes and then branch to that.

            // todo
        }
    } else finalDirection = world.direction;

    var directionNumber;
    if (finalDirection.x) {
        if (finalDirection.x > 0) directionNumber = 5;
        else directionNumber = 4;
    } else if (finalDirection.y) {
        if (finalDirection.y > 0) directionNumber = 3;
        else directionNumber = 2;
    } else if (finalDirection.z) {
        if (finalDirection.z > 0) directionNumber = 1;
        else directionNumber = 0;
    }

    var data = {
        auto: i > 0,
        Command: node.command + ' ' + commandParams,
        conditionMet: 1,
        CustomName: node.name ? node.name : '#',
        id: 'Control',
        powered: 0,
        SuccessCount: 0,
        TrackOutput: 0,
        x: world.x,
        y: world.y,
        z: world.z
    };
    if (_isConditional) data.conditionMet = 0;

    world.place(new Block(blockName, data, directionNumber));

    world.forward();

    world.isTurning = false;

    return true;
};