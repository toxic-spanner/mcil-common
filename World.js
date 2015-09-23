function World(dimensions) {
    this.width = dimensions.width;
    this.height = dimensions.height;
    this.depth = dimensions.depth;

    this.isWorld = true;

    this.x = 0;
    this.y = 0;
    this.z = 0;

    this.direction = World.directions.XP;

    this.previousPosition = { x: 0, y: 0, z: 0 };
    this.previousDirection = World.directions.XP;

    this.directionPattern = [];

    this.isTurning = false;

    // use an object instead of array to avoid memory problems with large maps
    this.map = {};
}
module.exports = World;

World.directions = {
    XP: { x: 1, y: 0, z: 0 },
    XN: { x: -1, y: 0, z: 0 },
    YP: { x: 0, y: 1, z: 0 },
    YN: { x: 0, y: -1, z: 0 },
    ZP: { x: 0, y: 0, z: 1 },
    ZN: { x: 0, y: 0, z: -1 }
};

World.prototype.place = function(block, rX, rY, rZ) {
    var pos = this.toComponents(rX, rY, rZ);

    var xPos = this.map[pos.x];
    if (!xPos) xPos = this.map[pos.x] = {};

    var yPos = xPos[pos.y];
    if (!yPos) yPos = xPos[pos.y] = {};

    yPos[pos.z] = block;
};

World.prototype.toComponents = function(rX_dir, rY, rZ) {
    var rX_dirType = typeof rX_dir;
    if (rX_dirType === "number" && rY == null) {
        return {
            x: this.x + this.direction.x * rX_dirType,
            y: this.y + this.direction.y * rX_dirType,
            z: this.z + this.direction.z * rX_dirType
        };
    }

    if (rX_dirType === "number") {
        return {
            x: this.x + rX_dir,
            y: this.y + (rY || 0),
            z: this.z + (rZ || 0)
        };
    }
    if (rX_dirType === "object") {
        return {
            x: this.x + (rX_dirType.x || 0),
            y: this.y + (rX_dirType.y || 0),
            z: this.z + (rX_dirType.z || 0)
        };
    }

    return {
        x: this.x,
        y: this.y,
        z: this.z
    };
};

World.prototype.available = function(rX, rY, rZ) {
    var pos = this.toComponents(rX, rY, rZ);

    if (pos.x < 0 || pos.x >= this.width || pos.y < 0 || pos.y >= this.height || pos.z < 0 || pos.z >= this.depth) {
        return false;
    }

    var xPos = this.map[pos.x];
    if (!xPos) return true;

    var yPos = xPos[pos.y];
    if (!yPos) return true;

    return !yPos[pos.z];
};

World.prototype.availableDistance = function(direction, offset) {
    var distance = 0;

    if (!offset) offset = { x: 0, y: 0, z: 0 };

    var currentX = this.x + (offset.x || 0);
    var currentY = this.y + (offset.y || 0);
    var currentZ = this.z + (offset.z || 0);

    while (true) {
        if (currentX < 0 || currentX >= this.width || currentY < 0 || currentY >= this.height || currentZ < 0 ||
            currentZ >= this.depth) break;
        if (this.map[currentX] && this.map[currentX][currentY] && this.map[currentX][currentY][currentZ]) break;

        distance++;
        currentX += direction.x;
        currentY += direction.y;
        currentZ += direction.z;
    }

    return distance;
};

World.prototype.forward = function() {
    var dir;
    if (this.directionPattern.length) dir = this.directionPattern.unshift();
    else dir = this.direction;

    this.move(dir);
};

World.prototype.move = function(direction) {
    this.previousDirection = this.direction;
    this.previousPosition = {
        x: this.x,
        y: this.y,
        z: this.z
    };

    this.x += direction.x;
    this.y += direction.y;
    this.z += direction.z;
};