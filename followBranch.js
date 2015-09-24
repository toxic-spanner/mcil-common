var nodes = require('./nodes');

module.exports = function(branchId, branches, world) {
    var branch = branches[branchId];

    for (var i = 0; i < branch.length; i++) {
        var node = branch[i];
        if (nodes[node.type]) nodes[node.type](i, node, branchId, branches, world);
        else throw new Error("Unknown node type " + node.type);
    }
};