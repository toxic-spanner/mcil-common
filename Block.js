function Block(name, nbt, damage) {
    this.name = name;
    this.damage = damage || -1;
    this.nbt = nbt || {};
}