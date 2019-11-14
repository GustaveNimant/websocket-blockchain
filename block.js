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

var createBlocController = (bloc) => {
    var here = O.functionNameJS(ModuleName);
    var result = new Block(bloc.index,
			   bloc.typeContenu,
			   bloc.contenu,
			   bloc.horodatage,
			   bloc.auteurClePublique,
			   bloc.hashPrecedent,
			   bloc.hashCourant);
    
    console.log('Sortie  de',here,'avec result',result);
    return result;
};

module.exports = {
    Block
};
module.exports.createBlocController = createBlocController;
