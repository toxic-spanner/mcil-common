function Block(name, nbt, damage) {
    this.name = name;
    this.damage = damage || -1;
    this.nbt = nbt || {};

    this._placed = false;

    this.x = -1;
    this.y = -1;
    this.z = -1;
}