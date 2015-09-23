var command = require('./command');
var postBranches = require('../postBranches');

module.exports = function(i, node, branchId, branches, world) {
    if (node.test) command(i, node.test, branchId, branches, world);

    var currentBranch = branches[branchId];

    // find if this is the only time the new branch is referenced
    // if it is, we can simply continue the new branch from where
    // we are now.
    var isSingular = true;
    for (var x = 0; x < branches.length; x++) {
        var branch = branches[x];
        for (var y = 0; y < branch.length; y++) {
            if (x === branchId && y === i) continue;

            var referenceNode = branch[y];
            if (referenceNode.type === "branch" && referenceNode.id === node.id) {
                isSingular = false;
                break;
            }
        }

        if (!isSingular) break;
    }

    /**
     * HOW DOES BRANCHING WORK EXACTLY?
     * That is a very good question! Unfortunately, the 1.9 chainable command blocks currently don't provide a way to
     * actually branch, so instead we must use a slightly less performant method.
     *
     * For 'singular' branches - i.e branches that are only referenced once - the branch will directly connect to the
     * calling branch. This is done by injecting a command block in the calling branch, which places a redstone block
     * at the start of the new branch. The first command block in the new branch then clears this redstone block.
     *
     * This is the same as for non-singular branches, except the new branch is in a different location. If the branch
     * is both singular, and at the end of the current branch, however, it will be directly continued from the current
     * branch.
     *
     * It is worth noting Minecraft's behaviour when it comes to this sort of branching: from testing, it appears as
     * it executes in a similar fashion to asynchronous Javascript functions: the new branch will be run as soon
     * as possible, but after any previously 'scheduled' executions (including the previous branch).
     */
    if (isSingular) {
        var offshootDirection, resultDirection;

        // if this is the last command in the branch, we can simply continue
        if (i === currentBranch.length - 1) offshootDirection = world.direction;
        else {
            // make usre we don't go in the same direction as the current branch, or the previous direction of the
            // current branch (in the case of a turn)
            var dx = world.direction.x || world.previousDirection.x;
            var dy = world.direction.y || world.previousDirection.y;
            var dz = world.direction.z || world.previousDirection.z;

            var offshotDirections = [
                { x: !dx * 1,  y: 0,        z: 0        },
                { x: !dx * -1, y: 0,        z: 0        },
                { x: 0,        y: !dy * 1,  z: 0        },
                { x: 0,        y: !dy * -1, z: 0        },
                { x: 0,        y: 0,        z: !dz * 1  },
                { x: 0,        y: 0,        z: !dz * -1 }
            ];

            var oppositeDirection = {
                x: world.direction.x * -1,
                y: world.direction.y * -1,
                z: world.direction.z * -1
            };

            var maxDistance = 1, turnDirection = false, finalDirection = false;
            for (var z = 0; z < offshotDirections.length; z++) {
                var dir = offshotDirections[z];
                if (dir.x === 0 && dir.y === 0 && dir.z === 0) continue;

                // if it goes in the opposite direction
                var sameDistance = world.availableDistance(world.direction, dir);
                var oppositeDistance = world.availableDistance(oppositeDirection, dir);

                if (sameDistance > oppositeDistance) {
                    if (sameDistance > maxDistance) {
                        maxDistance = sameDistance;
                        turnDirection = dir;
                        finalDirection = world.direction;
                    }
                } else {
                    if (oppositeDistance > maxDistance) {
                        maxDistance = oppositeDistance;
                        turnDirection = dir;
                        finalDirection = oppositeDirection;
                    }
                }
            }

            if (turnDirection) {
                offshootDirection = turnDirection;
                resultDirection = finalDirection;
            }
        }

        if (offshootDirection) {
            var switchBranch = branches[node.id];
            switchBranch.unshift({
                type: "command",
                name: "mcil.branch.reset",
                command: "setblock",
                params: "~" + (offshootDirection.x * -1) + "* ~" + (offshootDirection.y * -1) + "* ~" + (offshootDirection.z * -1) + "* stone"
            });
            postBranches.push({
                id: node.id,
                start: {
                    x: world.x + offshootDirection.x,
                    y: world.y + offshootDirection.y,
                    z: world.z + offshootDirection.z
                },
                direction: resultDirection
            });

            command(i + 1, {
                type: "command",
                name: "mcil.branch.local",
                command: "setblock",
                params: "~" + offshootDirection.x + "* ~" + offshootDirection.y + "* ~" + offshootDirection.z + "* stone"
            }, world, node.test);
        }
    } else {
        // todo: non-singular
    }
};