'use strict';

var O = require("./outils");

var ModuleName = 'block.js';

class Block {
    constructor(index, typeContenu, contenu, horodatage, auteurClePublique, hashPrecedent, hashCourant) {
	var here = O.functionNameJS(ModuleName);
	console.log('\nEntrée dans',here,'constructor avec index',index,'\n');

        this.index = index;
	this.typeContenu = typeContenu;
        this.contenu = contenu;
        this.horodatage = horodatage;
	this.auteurClePublique = auteurClePublique; 
        this.hashPrecedent = hashPrecedent;
        this.hashCourant = hashCourant;
    }
}

module.exports = {
    Block
};

