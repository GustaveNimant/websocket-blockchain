'use strict';

var O = require("./outils");
var ModuleName = 'block';

class Block {
    constructor(index, previousHash, timestamp, data, hash) {
	var here = O.functionNameJS(ModuleName);
	console.log('\nEntrée dans',here,'constructor avec index',index,'\n');

        this.index = index;
        this.previousHash = previousHash.toString();
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash.toString();
    }
}

module.exports = {
    Block
};

