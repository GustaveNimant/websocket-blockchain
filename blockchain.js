'use strict';

const {Block} = require ('./block.js');

var O = require("./outils");

var ModuleName = 'blockchain.js';

var addBlock = (newBlock, blockChain, caller) => {
    var here = O.functionNameJS (ModuleName);
    console.log('Entrée dans',here,'appelé par',caller,'avec newBlock',newBlock);

    if (isValidNewBlock(newBlock, O.getLatestElement(blockChain))) {
        blockChain.push(newBlock);
    }
    console.log('Sortie  de ',here);
};

var isValidChain = (blockchainToValidate) => {
    var here = O.functionNameJS(ModuleName);
    console.log('Entrée dans',here,'avec blockchainToValidate',blockchainToValidate);

    if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(getGenesisBlock())) {
        return false;
    }
    var tempBlocks = [blockchainToValidate[0]];
    for (var i = 1; i < blockchainToValidate.length; i++) {
        if (isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
	    console.log('Dans',here,'bloc #',i,'est validé');
            tempBlocks.push(blockchainToValidate[i]);
        } else {
	    console.log('Dans',here,'bloc #',i,'est invalide');
            return false;
        }
    }
    console.log('Sortie  de ',here);
    return true;
};

var generateNextBlock = (blockData, blockChain, caller) => {
    var here = O.functionNameJS(ModuleName);
    console.log('Entrée dans',here,'appelé par',caller,'avec blockData',blockData);

    var previousBlock = O.getLatestElement(blockChain);
    var nextIndex = previousBlock.index + 1;
    var nextTimestamp = new Date().getTime() / 1000;
    var nextHash = O.calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);

    var result = new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData, nextHash); 
    console.log('Sortie  de ',here,'avec result',result);

    return result; 
};

var isValidNewBlock = (newBlock, previousBlock) => {
    var here = O.functionNameJS ();
    
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('Dans',here,'index invalide previousBlock.index',previousBlock.index,'newBlock.index',newBlock.index);
	('Sortie  de ',here);
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('previousHash invalide');
	console.log('Sortie  de ',here);
        return false;
    } else if (O.calculateHashForBlock(newBlock) !== newBlock.hash) {
        console.log(typeof (newBlock.hash) + ' ' + typeof O.calculateHashForBlock(newBlock));
        console.log('Dans',here,'hash invalide: ' + O.calculateHashForBlock(newBlock) + ' ' + newBlock.hash);
	console.log('Sortie  de ',here);
        return false;
    }
        console.log('Sortie  de ',here);
    return true;
};

var replaceChain = (newBlocks, blockChain, socket_a, caller) => {
    var here = O.functionNameJS(ModuleName);
    console.log('Entrée dans',here,'appelé par',caller,'avec newBlocks',newBlocks);
    
    if (isValidChain(newBlocks) && newBlocks.length > blockChain.length) {
        console.log('La blockchain reçue est valide. Remplacer la blockchain actuelle par la blockchain reçue.');
        blockChain = newBlocks;
        broadcast(responseLatestMsg(blockChain), socket_a, here);
    } else {
        console.log('Dans',here,'La blockchain reçue est invalide.');
    }
    console.log('Sortie  de ',here);
};

module.exports.addBlock = addBlock;
module.exports.generateNextBlock = generateNextBlock;
module.exports.isValidChain = isValidChain;
module.exports.isValidNewBlock = isValidNewBlock;
module.exports.replaceChain = replaceChain;
