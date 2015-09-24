var World = require('./World');
var followBranch = require('./followBranch');
var postBranches = require('./postBranches');

exports.walk = function(code, world, cb) {
    if (!world || !world.isWorld) world = new World(world);

    if (!code.length) return;

    world._placeCallback = cb;

    postBranches.unshift({
        id: 0,
        start: { x: 0, y: 0, z: 0 },
        direction: World.directions.XP
    });

    for (var i = 0; i < postBranches.length; i++) {
        var branch = postBranches[i];

        var start = branch.start;
        if (typeof start === "function") start = start(world);

        world.x = start.x;
        world.y = start.y;
        world.z = start.z;
        world.previousPosition = start;
        world.direction = branch.direction;
        world.previousDirection = branch.direction;
        world.directionPattern = [];

        followBranch(branch.id, code, world, cb);
    }

    world._placeCallback = false;
};