'use strict';

const {Block, createBlocController} = require ('./block.js');

var A = require("./arrays");
var O = require("./outils");

var ModuleName = 'blockchain.js';

var MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};

var addBlock = (newBlock, caller) => {
    var here = O.functionNameJS (ModuleName);
    console.log('\n');
    console.log('Entrée dans',here,'appelé par',caller)
    console.log('Entrée dans',here,'avec newBlock',newBlock)

    if (isValidNewBlock(newBlock, getLatestBlock(), here)) {
        A.blockChain.push(newBlock);
    }
    console.log('Sortie  de',here);
};

var broadcast = (message, caller) => {
    var here = O.functionNameJS(ModuleName);
    console.log('\n');
    console.log('Entrée dans',here,'appelé par',caller);
    console.log('\n');
    console.log('Entrée dans',here,'avec message',message)
    console.log('\n');
    console.log('dans',here,'il y a',A.socket_a.length,'sockets');

    A.socket_a.forEach (ws => {
	console.log('dans',here,'écriture du message dans le socket',ws.url);
	write(ws, message, here)
    });
    console.log('Sortie  de',here);
}

var generateNextBlock = (blockData, caller) => {
    var here = O.functionNameJS(ModuleName);
    console.log('\n');
    console.log('Entrée dans',here,'appelé par',caller,'avec blockData',blockData);

    var previousBlock = getLatestBlock();
    var nextIndex = previousBlock.index + 1;
    var nextTimestamp = new Date().getTime() / 1000;
    var nextHash = O.calculateHash(nextIndex, previousBlock.hashCourant, nextTimestamp, blockData);

    var result = new Block(nextIndex,
			   "texte",
			   blockData,
			   nextTimestamp,
			   "clé publique",
			   previousBlock.hashCourant,
			   nextHash); 
    console.log('Sortie  de',here,'avec result',result);

    return result; 
};

var getGenesisBlock = (caller) => {
    var here = O.functionNameJS(ModuleName);
    console.log('\n');
    console.log('Entrée dans',here,'appelé par',caller);
    
    var nextHash = O.calculateHash(0, "hash vide", nextTimestamp, "mon bloc génésis");
    var nextTimestamp = new Date().getTime() / 1000;
    var http_port = process.env.HTTP_PORT;
    var p2p_port = process.env.P2P_PORT;
    var contenu = "Bloc Genesis de websocket-blockchain http " + http_port + " p2p " + p2p_port;

    var result = createBlocController ({
	index: 0,
	typeContenu: "texte",
	contenu: contenu,
	horodatage: nextTimestamp,
	auteurClePublique: "clé publique",
	hashPrecedent:"hash vide",
	hashCourant: nextHash,
    });
    
    console.log('Sortie  de',here,'avec result',result);
    return result;
};

var getLatestBlock = () => O.getLatestElement(A.blockChain);

var isValidChain = (blockchainToValidate, caller) => {
    var here = O.functionNameJS(ModuleName);
    console.log('\n');
    console.log('Entrée dans',here,'appelé par',caller);
    console.log('Entrée dans',here,'avec blockchainToValidate',blockchainToValidate);
    var genesisBlockToValidate = blockchainToValidate[0];
    var genesisBlockCurrent = getGenesisBlock(here);
    
    if (JSON.stringify(genesisBlockToValidate) !== JSON.stringify(genesisBlockCurrent)) {
	console.log('\n');
	console.log('dans',here,'genesisBlockToValidate',genesisBlockToValidate);
	console.log('dans',here,'tandis que genesisBlockCurrent',genesisBlockCurrent);

	console.log('\n');
	console.log('dans',here,'genesisBlockToValidate.horodatage',genesisBlockToValidate.horodatage);
	console.log('dans',here,'   genesisBlockCurrent.horodatage',genesisBlockCurrent.horodatage);

	if (genesisBlockToValidate.horodatage < genesisBlockCurrent.horodatage) {
	    var result = true;
	} else {
	    console.log('\n');
	    console.log('Erreur dans',here,'genesisBlockToValidate.horodatage',genesisBlockToValidate.horodatage);
	    console.log('\n');
	    console.log('Erreur dans',here,'tandis que genesisBlockCurrent.horodatage',genesisBlockCurrent.horodatage);
	    console.log('\n');
	    console.log('Sortie  de',here);
	    var result = false;
	}
	console.log('Sortie  de',here,'avec result',result);
	return result;
    }
    
    var tempBlocks = [blockchainToValidate[0]];
    for (var i = 1; i < blockchainToValidate.length; i++) {
        if (isValidNewBlock (blockchainToValidate[i], tempBlocks[i - 1], here)) {
	    console.log('dans',here,'bloc #',i,'est validé');
            tempBlocks.push(blockchainToValidate[i]);
        } else {
	    console.log('dans',here,'bloc #',i,'est invalide');
            return false;
        }
    }
    console.log('Sortie  de',here);
    return true;
};

var isValidNewBlock = (newBlock, previousBlock, caller) => {
    var here = O.functionNameJS (ModuleName);
    console.log('\n');
    console.log('Entrée dans',here,'appelé par',caller)
    console.log('Entrée dans',here,'avec newBlock',newBlock)
    console.log('Entrée dans',here,'avec previousBlock',previousBlock);
    
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('dans',here,'index invalide previousBlock.index',previousBlock.index,'newBlock.index',newBlock.index);
	('Sortie  de',here);
        return false;
    } else if (previousBlock.hashCourant !== newBlock.hashPrecedent) {
	console.log('\nErreur dans',here,'previousBlock.hashCourant',previousBlock.hashCourant)
        console.log('Erreur différe de newBlock.hashPrecedent',newBlock.hashPrecedent);
	console.log('\nSortie  de',here);
        return false;
    } else if (O.calculateHashForBlock(newBlock) !== newBlock.hashCourant) {
        console.log(typeof (newBlock.hashCourant) + ' ' + typeof O.calculateHashForBlock(newBlock));
        console.log('\nErreur dans',here,'hashCourant',O.calculateHashForBlock(newBlock))
	console.log('Erreur est différent de newBlock.hashCourant',newBlock.hashCourant);
	console.log('\n');
	console.log('Sortie  de',here);
        return false;
    }
    console.log('Sortie  de',here,'result true');
    return true;
};

var replaceChain = (newBlocks, caller) => {
    var here = O.functionNameJS(ModuleName);
    console.log('\n');
    console.log('Entrée dans',here,'appelé par',caller);
    console.log('Entrée dans',here,'avec newBlocks',newBlocks);
    var areValidNewBlocks = isValidChain(newBlocks, here);

    console.log('dans',here,'areValidNewBlocks',areValidNewBlocks);
    console.log('dans',here,'newBlocks.length',newBlocks.length);
    console.log('dans',here,'blockChain.length',A.blockChain.length);
    
    if (isValidChain(newBlocks, here) && newBlocks.length > A.blockChain.length) {
        console.log('dans',here,'La blockchain reçue est valide.');
        console.log('dans',here,'Remplacer la blockchain actuelle par la blockchain reçue.');
        A.blockChain = newBlocks;
        broadcast(responseLatestMsg(here), here);
    } else if (isValidChain(newBlocks, here) && ( (newBlocks.length == 1) && (newBlocks.length == A.blockChain.length) )) {
        console.log('dans',here,'La blockchain reçue est valide.');
        console.log('dans',here,'Remplacer la blockchain actuelle par la blockchain reçue.');
        A.blockChain = newBlocks;
        broadcast(responseLatestMsg(here), here);
    } else {
	console.log('\n');
        console.log('!!!!! dans',here,'La blockchain reçue est invalide. !!!!!');
	console.log('\n');
    }
    console.log('Sortie  de',here);
};

var responseLatestMsg = (caller) => {
    var here = O.functionNameJS (ModuleName);
    console.log('\n');
    console.log('Entrée dans',here,'appelé par',caller,'avec',A.blockChain.length,'blocs');

    var latestE = getLatestBlock();
    var result = {
	'type': MessageType.RESPONSE_BLOCKCHAIN,
	'data': JSON.stringify([latestE])
    };
    console.log('Sortie  de',here,'result',result);
    return result;
};

var write = (ws, message, caller) => {
    var here = O.functionNameJS (ModuleName);
    console.log('\n');
    console.log('Entrée dans',here,'appelé par',caller);
    console.log('Entrée dans',here,'avec ws.url',ws.url);
    console.log('Entrée dans',here,'avec message',message);
    
    ws.send(JSON.stringify(message))
    
    console.log('Sortie  de',here);
};

module.exports.addBlock = addBlock;
module.exports.broadcast = broadcast;
module.exports.generateNextBlock = generateNextBlock;
module.exports.getGenesisBlock = getGenesisBlock;
module.exports.getLatestBlock = getLatestBlock;
module.exports.replaceChain = replaceChain;
module.exports.responseLatestMsg = responseLatestMsg;
module.exports.MessageType = MessageType;
module.exports.write = write;
