var Block = require('../Block');

module.exports = function(i, node, branchId, branches, world) {
    var duration = node.duration;

    var repeaterCount = Math.ceil(duration / 4);
    var endRepeaterAmount = duration % 4;
    if (endRepeaterAmount === 0) endRepeaterAmount = 4;

    // todo: find a fix for this
    if (world.direction.z) throw Error("Cannot have vertical repeaters!");

    var directionNumber;
    if (world.direction.x) {
        if (world.direction.x > 0) directionNumber = 1;
        else directionNumber = 3;
    } else if (world.direction.z) {
        if (world.direction.z > 0) directionNumber = 2;
        else directionNumber = 0;
    }

    // todo: refactor command direction finding with this
    for (var x = 0; x < repeaterCount; x++) {
        var repeaterNumber = x === repeaterCount - 1 ? endRepeaterAmount : 4;
        world.place(new Block("unpowered_repeater", {}, directionNumber + 4 * (repeaterNumber - 1)));
        world.forward();
    }

    return true;
};